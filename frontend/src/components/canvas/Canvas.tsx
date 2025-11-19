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
  height = 800 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [, setSelectedNode] = useState<D3Node | null>(null);
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });

  useEffect(() => {
    if (!svgRef.current || !graph) return;

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

    // Convert to D3 nodes and edges
    const nodes: D3Node[] = graph.nodes.map(n => ({
      ...n,
      x: n.position?.x || Math.random() * width,
      y: n.position?.y || Math.random() * height,
    }));

    const edges: D3Edge[] = graph.edges.map(e => ({
      ...e,
      source: e.sourceId,
      target: e.targetId,
    }));

    // Create force simulation
    const simulation = d3.forceSimulation<D3Node>(nodes)
      .force('link', d3.forceLink<D3Node, D3Edge>(edges)
        .id(d => d.id)
        .distance(d => 100 + (1 - d.weight) * 100)
        .strength(d => d.weight)
      )
      .force('charge', d3.forceManyBody()
        .strength(-300)
        .distanceMax(400)
      )
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<D3Node>()
        .radius(d => ((d.metadata?.size as number) || 1) * 20 + 10)
      );

    // Create arrow markers for directed edges
    svg.append('defs').selectAll('marker')
      .data(['contains', 'relates', 'triggers', 'temporal'])
      .enter().append('marker')
      .attr('id', d => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#9ca3af');

    // Draw edges
    const link = g.append('g')
      .selectAll('line')
      .data(edges)
      .enter().append('line')
      .attr('stroke', '#9ca3af')
      .attr('stroke-width', d => d.weight * 3)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', d => `url(#arrow-${d.type})`);

    // Draw edge labels
    const edgeLabels = g.append('g')
      .selectAll('text')
      .data(edges.filter(e => e.label))
      .enter().append('text')
      .attr('font-size', '10px')
      .attr('fill', '#6b7280')
      .attr('text-anchor', 'middle')
      .text(d => d.label || '');

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

    // Node circles
    node.append('circle')
      .attr('r', d => ((d.metadata?.size as number) || 1) * 15)
      .attr('fill', d => (d.metadata?.color as string) || '#6366f1')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
        onNodeClick?.(d);
      })
      .on('mouseenter', function() {
        d3.select(this).attr('stroke-width', 4);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('stroke-width', 2);
      });

    // Node icons/text
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', '12px')
      .attr('fill', '#fff')
      .attr('pointer-events', 'none')
      .text(d => {
        switch (d.type) {
          case 'entry': return '📝';
          case 'emotion': return '😊';
          case 'theme': return '💡';
          case 'pattern': return '🔄';
          case 'distortion': return '⚠️';
          default: return '•';
        }
      });

    // Node labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => (d.metadata.size || 1) * 15 + 20)
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#1f2937')
      .attr('pointer-events', 'none')
      .text(d => d.label.length > 20 ? d.label.substring(0, 20) + '...' : d.label);

    // Frequency badges
    node.filter(d => !!(d.metadata?.frequency && d.metadata.frequency > 1))
      .append('circle')
      .attr('cx', d => ((d.metadata?.size as number) || 1) * 10)
      .attr('cy', d => -((d.metadata?.size as number) || 1) * 10)
      .attr('r', 10)
      .attr('fill', '#ef4444')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    node.filter(d => !!(d.metadata?.frequency && d.metadata.frequency > 1))
      .append('text')
      .attr('x', d => ((d.metadata?.size as number) || 1) * 10)
      .attr('y', d => -((d.metadata?.size as number) || 1) * 10)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .attr('pointer-events', 'none')
      .text(d => String(d.metadata?.frequency || ''));

    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as D3Node).x!)
        .attr('y1', d => (d.source as D3Node).y!)
        .attr('x2', d => (d.target as D3Node).x!)
        .attr('y2', d => (d.target as D3Node).y!);

      edgeLabels
        .attr('x', d => ((d.source as D3Node).x! + (d.target as D3Node).x!) / 2)
        .attr('y', d => ((d.source as D3Node).y! + (d.target as D3Node).y!) / 2);

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
  }, [graph, width, height, onNodeClick, onNodeDrag]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-gray-200 rounded-lg bg-gray-50"
      />
      
      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => {
            const svg = d3.select(svgRef.current);
            svg.transition().call(
              d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
              1.3
            );
          }}
          className="p-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-50"
          title="Zoom In"
        >
          <span className="text-xl">+</span>
        </button>
        <button
          onClick={() => {
            const svg = d3.select(svgRef.current);
            svg.transition().call(
              d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
              0.7
            );
          }}
          className="p-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-50"
          title="Zoom Out"
        >
          <span className="text-xl">−</span>
        </button>
        <button
          onClick={() => {
            const svg = d3.select(svgRef.current);
            svg.transition().call(
              d3.zoom<SVGSVGElement, unknown>().transform as any,
              d3.zoomIdentity
            );
          }}
          className="p-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-50"
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
