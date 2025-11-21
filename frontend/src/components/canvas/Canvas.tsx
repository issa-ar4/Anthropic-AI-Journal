import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CanvasGraph, D3Node, D3Edge } from '@/types/canvas.types';

interface CanvasProps {
  graph: CanvasGraph;
  onNodeClick?: (node: D3Node) => void;
  onNodeDrag?: (node: D3Node) => void;
  width?: number;
  height?: number;
}

const Canvas: React.FC<CanvasProps> = ({ 
  graph, 
  onNodeClick, 
  onNodeDrag,
  width = 1200, 
  height = 900 // Increased from 800 for better spacing
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [, setSelectedNode] = useState<D3Node | null>(null);
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });

  // Group nodes by type and filter to top items only
  const groupNodesByType = (nodes: D3Node[]) => {
    const groups: { [key: string]: D3Node[] } = {
      entry: [],
      emotion: [],
      theme: [],
      pattern: [],
      distortion: []
    };
    
    nodes.forEach(node => {
      if (groups[node.type]) {
        groups[node.type].push(node);
      }
    });
    
    // Sort and filter each group to top 5 items
    // Scoring based on: frequency (40%), connections (40%), recency (20%)
    Object.keys(groups).forEach(type => {
      groups[type] = groups[type]
        .map(node => {
          const frequency = (node.metadata?.frequency as number) || 1;
          const connectionCount = graph.edges.filter(
            e => e.sourceId === node.id || e.targetId === node.id
          ).length;
          const createdAt = node.metadata?.createdAt ? new Date(node.metadata.createdAt as string).getTime() : 0;
          const recencyScore = createdAt ? (createdAt / Date.now()) : 0;
          
          // Calculate importance score
          const score = (frequency * 0.4) + (connectionCount * 0.4) + (recencyScore * 0.2);
          
          return { ...node, importanceScore: score };
        })
        .sort((a, b) => (b.importanceScore || 0) - (a.importanceScore || 0))
        .slice(0, 5); // Keep only top 5
    });
    
    return groups;
  };

  useEffect(() => {
    if (!svgRef.current || !graph) return;
    if (!graph.nodes || !graph.edges) {
      console.error('Invalid graph data:', graph);
      return;
    }
    if (graph.nodes.length === 0) {
      console.warn('Graph has no nodes');
      return;
    }

    try {
      // Clear previous content
      d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(svgRef.current);
    
    // Create container for zoom/pan
    const g = svg.append('g');

    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setTransform({
          k: event.transform.k,
          x: event.transform.x,
          y: event.transform.y,
        });
      });

    svg.call(zoom);
    
    // Set initial zoom to fit entire canvas
    const initialScale = 0.75;
    const initialTransform = d3.zoomIdentity
      .translate(width * 0.125, height * 0.1)
      .scale(initialScale);
    svg.call(zoom.transform as any, initialTransform);

    // Group nodes by type for organized layout
    const groupedNodes = groupNodesByType(graph.nodes);
    
    // Position nodes in organized columns by type
    const columnWidth = width / 5;
    const columns = [
      { type: 'entry', x: columnWidth * 0.5, label: '📝 Entries' },
      { type: 'emotion', x: columnWidth * 1.5, label: '💭 Emotions' },
      { type: 'theme', x: columnWidth * 2.5, label: '💡 Themes' },
      { type: 'pattern', x: columnWidth * 3.5, label: '🔄 Patterns' },
      { type: 'distortion', x: columnWidth * 4.5, label: '⚠️ Distortions' }
    ];

    const nodes: D3Node[] = [];
    columns.forEach((col) => {
      const typeNodes = groupedNodes[col.type] || [];
      if (typeNodes.length === 0) return;
      // Increased minimum spacing to prevent label overlap
      const spacing = Math.max(120, Math.min(150, (height - 200) / typeNodes.length));
      
      typeNodes.forEach((node, i) => {
        nodes.push({
          ...node,
          x: col.x,
          y: 150 + i * spacing,
          fx: col.x, // Fix X position to keep columns
          fy: undefined
        });
      });
    });

    // Create set of node IDs for efficient lookup
    const nodeIds = new Set(nodes.map(n => n.id));
    
    // Create a map of node type to check adjacency
    const nodeTypeMap = new Map(nodes.map(n => [n.id, n.type]));
    
    // Define adjacent column pairs (only allow connections between adjacent columns)
    const adjacentTypes: [string, string][] = [
      ['entry', 'emotion'],
      ['emotion', 'theme'],
      ['theme', 'pattern'],
      ['pattern', 'distortion']
    ];
    
    // Group edges by column pair to ensure balanced distribution
    const edgesByPair = new Map<string, typeof graph.edges>();
    
    graph.edges.forEach(e => {
      if (!nodeIds.has(e.sourceId) || !nodeIds.has(e.targetId)) return;
      
      const sourceType = nodeTypeMap.get(e.sourceId);
      const targetType = nodeTypeMap.get(e.targetId);
      
      // Check which adjacent pair this edge belongs to
      adjacentTypes.forEach(([type1, type2]) => {
        if ((sourceType === type1 && targetType === type2) || 
            (sourceType === type2 && targetType === type1)) {
          const pairKey = `${type1}-${type2}`;
          if (!edgesByPair.has(pairKey)) {
            edgesByPair.set(pairKey, []);
          }
          edgesByPair.get(pairKey)!.push(e);
        }
      });
    });
    
    // Process each column pair independently to ensure all get connections
    const selectedEdges: typeof graph.edges = [];
    const nodeConnectionCounts = new Map<string, number>();
    
    adjacentTypes.forEach(([type1, type2]) => {
      const pairKey = `${type1}-${type2}`;
      const pairEdges = edgesByPair.get(pairKey) || [];
      
      // Sort by weight and take top connections for this pair
      pairEdges
        .sort((a, b) => b.weight - a.weight)
        .forEach(e => {
          const sourceCount = nodeConnectionCounts.get(e.sourceId) || 0;
          const targetCount = nodeConnectionCounts.get(e.targetId) || 0;
          
          // Allow up to 5 connections per node
          if (sourceCount < 5 && targetCount < 5) {
            selectedEdges.push(e);
            nodeConnectionCounts.set(e.sourceId, sourceCount + 1);
            nodeConnectionCounts.set(e.targetId, targetCount + 1);
          }
        });
    });
    
    const edges: D3Edge[] = selectedEdges.map(e => ({
      ...e,
      source: e.sourceId,
      target: e.targetId,
    }));

    // Simplified simulation - only allow vertical movement within columns
    const simulation = d3.forceSimulation<D3Node>(nodes)
      .force('link', d3.forceLink<D3Node, D3Edge>(edges)
        .id(d => d.id)
        .distance(100)
        .strength(0.3)
      )
      .force('collision', d3.forceCollide<D3Node>()
        .radius(60) // Increased to account for label height
        .strength(1.0)
      )
      .force('y', d3.forceY<D3Node>(d => d.y || height / 2).strength(0.1));

    // Draw column backgrounds
    g.append('g')
      .selectAll('rect')
      .data(columns)
      .enter().append('rect')
      .attr('x', d => d.x - columnWidth / 2 + 10)
      .attr('y', 50)
      .attr('width', columnWidth - 20)
      .attr('height', height - 60)
      .attr('fill', '#f9fafb')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1)
      .attr('rx', 8);

    // Draw column headers
    g.append('g')
      .selectAll('text')
      .data(columns)
      .enter().append('text')
      .attr('x', d => d.x)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .attr('fill', '#374151')
      .text(d => d.label);

    // Draw edges (behind nodes)
    const link = g.append('g')
      .selectAll('line')
      .data(edges)
      .enter().append('line')
      .attr('stroke', '#9ca3af')
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', 0.6);

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .call(d3.drag<SVGGElement, D3Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );

    // Node circles with consistent sizing
    node.append('circle')
      .attr('r', 24)
      .attr('fill', d => (d.metadata?.color as string) || '#6366f1')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2.5)
      .style('cursor', 'pointer')
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
        onNodeClick?.(d);
      })
      .on('mouseenter', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 28)
          .attr('stroke-width', 3);
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 24)
          .attr('stroke-width', 2.5);
      });

    // Node icons
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', '16px')
      .attr('pointer-events', 'none')
      .text(d => {
        switch (d.type) {
          case 'entry': return '📝';
          case 'emotion': return '💭';
          case 'theme': return '💡';
          case 'pattern': return '🔄';
          case 'distortion': return '⚠️';
          default: return '●';
        }
      });

    // Node labels - show full text with wrapping
    node.each(function(d) {
      const nodeGroup = d3.select(this);
      const text = d.label;
      const maxWidth = 100; // Increased from 80
      const words = text.split(/\s+/);
      
      let line = '';
      let lineNumber = 0;
      const lineHeight = 13; // Increased from 12
      const y = 38;
      
      words.forEach((word) => {
        const testLine = line + (line ? ' ' : '') + word;
        // Better width estimation (7px per char instead of 6)
        if (testLine.length * 7 > maxWidth && line !== '') {
          // Add the current line
          nodeGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', y + lineNumber * lineHeight)
            .attr('font-size', '11px') // Increased from 10px
            .attr('font-weight', '500')
            .attr('fill', '#374151')
            .attr('pointer-events', 'none')
            .text(line);
          line = word;
          lineNumber++;
          // Limit to 2 lines to reduce height
          if (lineNumber >= 2) {
            return;
          }
        } else {
          line = testLine;
        }
      });
      
      // Add the last line (with ellipsis if truncated)
      if (line && lineNumber < 2) {
        nodeGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', y + lineNumber * lineHeight)
          .attr('font-size', '11px') // Increased from 10px
          .attr('font-weight', '500')
          .attr('fill', '#374151')
          .attr('pointer-events', 'none')
          .text(line);
      } else if (line && lineNumber === 2) {
        // Truncate with ellipsis if we have more text
        const truncated = line.length > 12 ? line.substring(0, 12) + '...' : line;
        nodeGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', y + lineNumber * lineHeight)
          .attr('font-size', '11px')
          .attr('font-weight', '500')
          .attr('fill', '#374151')
          .attr('pointer-events', 'none')
          .text(truncated);
      }
    });

    // Frequency badges removed for simplicity

    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as D3Node).x!)
        .attr('y1', d => (d.source as D3Node).y!)
        .attr('x2', d => (d.target as D3Node).x!)
        .attr('y2', d => (d.target as D3Node).y!);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
      onNodeDrag?.(event.subject);
    }

      // Cleanup
      return () => {
        simulation.stop();
      };
    } catch (error) {
      console.error('Error rendering canvas:', error);
    }
  }, [graph, width, height, onNodeClick, onNodeDrag]);

  return (
    <div className="relative">
      {/* Info banner */}
      <div className="absolute top-4 left-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 shadow-sm z-10 max-w-md">
        <p className="text-xs text-blue-800">
          <span className="font-semibold">📊 Showing top 5 items per category</span>
          <br />
          Ranked by frequency (40%), connections (40%), and recency (20%)
        </p>
      </div>

      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-gray-200 rounded-lg bg-white"
      />
      
      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => {
            const svg = d3.select(svgRef.current);
            svg.transition().duration(300).call(
              d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
              1.3
            );
          }}
          className="p-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-50 transition-colors"
          title="Zoom In"
        >
          <span className="text-xl font-bold">+</span>
        </button>
        <button
          onClick={() => {
            const svg = d3.select(svgRef.current);
            svg.transition().duration(300).call(
              d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
              0.7
            );
          }}
          className="p-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-50 transition-colors"
          title="Zoom Out"
        >
          <span className="text-xl font-bold">−</span>
        </button>
        <button
          onClick={() => {
            const svg = d3.select(svgRef.current);
            svg.transition().duration(500).call(
              d3.zoom<SVGSVGElement, unknown>().transform as any,
              d3.zoomIdentity.translate(width / 2, height / 2).scale(1).translate(-width / 2, -height / 2)
            );
          }}
          className="p-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-50 transition-colors"
          title="Reset View"
        >
          <span className="text-xl">⟲</span>
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-4 right-4 px-3 py-1 bg-white border border-gray-300 rounded-lg shadow text-sm">
        {Math.round(transform.k * 100)}%
      </div>
    </div>
  );
};

export default Canvas;
