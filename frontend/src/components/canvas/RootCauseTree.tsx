import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface TreeNode {
  emotion: string;
  triggers: string[];
  distortions: string[];
  patterns: string[];
  entryIds: string[];
  frequency: number;
}

interface RootCauseTreeProps {
  data: TreeNode[];
  onNodeClick?: (type: string, value: string) => void;
}

export const RootCauseTree: React.FC<RootCauseTreeProps> = ({ data, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = Math.max(700, data.length * 150);
    const margin = { top: 60, right: 150, bottom: 60, left: 180 };

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Define column positions with better spacing
    const columns = [
      { x: 0, label: 'Emotions', color: '#ef4444', subtitle: 'What you feel' },
      { x: innerWidth * 0.30, label: 'Triggers', color: '#8b5cf6', subtitle: 'What causes it' },
      { x: innerWidth * 0.60, label: 'Distortions', color: '#f59e0b', subtitle: 'How you think' },
      { x: innerWidth * 0.90, label: 'Patterns', color: '#10b981', subtitle: 'What you do' },
    ];

    // Draw column labels with subtitles
    columns.forEach(col => {
      g.append('text')
        .attr('x', col.x)
        .attr('y', -30)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', '700')
        .style('fill', col.color)
        .text(col.label);
      
      g.append('text')
        .attr('x', col.x)
        .attr('y', -12)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', '400')
        .style('fill', '#6b7280')
        .text(col.subtitle);
    });

    // Take top 5 emotions for clarity
    const topEmotions = data.slice(0, 5);
    const emotionSpacing = innerHeight / (topEmotions.length + 1);

    topEmotions.forEach((node, emotionIndex) => {
      const emotionY = (emotionIndex + 1) * emotionSpacing;

      // Draw emotion node (larger and more visible)
      const emotionG = g.append('g')
        .attr('transform', `translate(${columns[0].x},${emotionY})`)
        .style('cursor', 'pointer')
        .on('click', () => onNodeClick?.('emotion', node.emotion));

      emotionG.append('circle')
        .attr('r', 35)
        .attr('fill', columns[0].color)
        .attr('opacity', 0.9)
        .attr('stroke', '#fff')
        .attr('stroke-width', 3);

      emotionG.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.3em')
        .style('fill', 'white')
        .style('font-size', '13px')
        .style('font-weight', '700')
        .text(node.emotion);

      emotionG.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.2em')
        .style('fill', 'white')
        .style('font-size', '11px')
        .style('font-weight', '600')
        .text(`${node.frequency}×`);

      // Draw triggers with better spacing
      const maxConnections = 3;
      node.triggers.slice(0, maxConnections).forEach((trigger, triggerIndex) => {
        const triggerY = emotionY + (triggerIndex - 1) * 60;
        
        // Draw line
        g.append('line')
          .attr('x1', columns[0].x + 30)
          .attr('y1', emotionY)
          .attr('x2', columns[1].x - 60)
          .attr('y2', triggerY)
          .attr('stroke', columns[1].color)
          .attr('stroke-width', 2)
          .attr('opacity', 0.4);

        // Draw trigger node (larger pills)
        const triggerG = g.append('g')
          .attr('transform', `translate(${columns[1].x},${triggerY})`)
          .style('cursor', 'pointer')
          .on('click', () => onNodeClick?.('trigger', trigger));

        triggerG.append('rect')
          .attr('x', -60)
          .attr('y', -18)
          .attr('width', 120)
          .attr('height', 36)
          .attr('rx', 18)
          .attr('fill', columns[1].color)
          .attr('opacity', 0.9)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);

        triggerG.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .style('fill', 'white')
          .style('font-size', '12px')
          .style('font-weight', '600')
          .text(trigger.length > 15 ? trigger.substring(0, 15) + '...' : trigger);
      });

      // Draw distortions with better spacing
      node.distortions.slice(0, maxConnections).forEach((distortion, distIndex) => {
        const distY = emotionY + (distIndex - 1) * 60;
        
        // Draw line from middle trigger to distortion
        const middleTriggerY = emotionY;
        g.append('line')
          .attr('x1', columns[1].x + 50)
          .attr('y1', middleTriggerY)
          .attr('x2', columns[2].x - 60)
          .attr('y2', distY)
          .attr('stroke', columns[2].color)
          .attr('stroke-width', 2)
          .attr('opacity', 0.4);

        // Draw distortion node (larger boxes)
        const distG = g.append('g')
          .attr('transform', `translate(${columns[2].x},${distY})`)
          .style('cursor', 'pointer')
          .on('click', () => onNodeClick?.('distortion', distortion));

        distG.append('rect')
          .attr('x', -60)
          .attr('y', -18)
          .attr('width', 120)
          .attr('height', 36)
          .attr('rx', 8)
          .attr('fill', columns[2].color)
          .attr('opacity', 0.9)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);

        distG.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .style('fill', 'white')
          .style('font-size', '11px')
          .style('font-weight', '600')
          .text(distortion.length > 13 ? distortion.substring(0, 13) + '...' : distortion);
      });

      // Draw patterns with better spacing
      node.patterns.slice(0, maxConnections).forEach((pattern, patternIndex) => {
        const patternY = emotionY + (patternIndex - 1) * 60;
        
        // Draw line
        const middleDistY = emotionY;
        g.append('line')
          .attr('x1', columns[2].x + 50)
          .attr('y1', middleDistY)
          .attr('x2', columns[3].x - 35)
          .attr('y2', patternY)
          .attr('stroke', columns[3].color)
          .attr('stroke-width', 2)
          .attr('opacity', 0.4);

        // Draw pattern node (larger circles)
        const patternG = g.append('g')
          .attr('transform', `translate(${columns[3].x},${patternY})`)
          .style('cursor', 'pointer')
          .on('click', () => onNodeClick?.('pattern', pattern));

        patternG.append('circle')
          .attr('r', 28)
          .attr('fill', columns[3].color)
          .attr('opacity', 0.9)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);

        patternG.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .style('fill', 'white')
          .style('font-size', '11px')
          .style('font-weight', '700')
          .text(pattern.length > 10 ? pattern.substring(0, 10) : pattern);
      });
    });

  }, [data, onNodeClick]);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">No data available for root cause analysis yet.</p>
        <p className="text-sm text-gray-500 mt-2">Create more journal entries to see patterns.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div ref={containerRef} className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Root Cause Flow
          </h3>
          <p className="text-sm text-gray-600">
            How your emotions connect to triggers, thinking patterns, and behaviors. 
            Shows your top 5 emotions and their relationships.
          </p>
        </div>
        <div className="overflow-x-auto">
          <svg ref={svgRef} />
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">How to Read This</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="font-medium">Emotions</span>
            </div>
            <p className="text-xs text-gray-600">What you feel</p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-4 h-4 rounded-full bg-purple-500"></div>
              <span className="font-medium">Triggers</span>
            </div>
            <p className="text-xs text-gray-600">What sparks it</p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="font-medium">Distortions</span>
            </div>
            <p className="text-xs text-gray-600">How you think</p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="font-medium">Patterns</span>
            </div>
            <p className="text-xs text-gray-600">What you do</p>
          </div>
        </div>
      </div>
    </div>
  );
};
