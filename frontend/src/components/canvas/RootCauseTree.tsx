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
    const height = Math.max(600, data.length * 150);
    const margin = { top: 80, right: 150, bottom: 60, left: 200 };

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;

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
        .attr('y', -60)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', '700')
        .style('fill', col.color)
        .text(col.label);
      
      g.append('text')
        .attr('x', col.x)
        .attr('y', -42)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', '400')
        .style('fill', '#6b7280')
        .text(col.subtitle);
    });

    // Take top 5 emotions for clarity
    const topEmotions = data.slice(0, 5);
    const emotionSpacing = 400; // Fixed spacing between emotions
    const startY = 200; // Start position after column headers

    topEmotions.forEach((node, emotionIndex) => {
      const emotionY = startY + emotionIndex * emotionSpacing;

      // Draw emotion node (larger and more visible)
      const emotionG = g.append('g')
        .attr('transform', `translate(${columns[0].x},${emotionY})`)
        .style('cursor', 'pointer')
        .on('click', () => onNodeClick?.('emotion', node.emotion));

      emotionG.append('circle')
        .attr('r', 60)
        .attr('fill', columns[0].color)
        .attr('opacity', 0.9)
        .attr('stroke', '#fff')
        .attr('stroke-width', 3);

      emotionG.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.3em')
        .style('fill', 'white')
        .style('font-size', '16px')
        .style('font-weight', '700')
        .text(node.emotion);

      emotionG.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.3em')
        .style('fill', 'white')
        .style('font-size', '14px')
        .style('font-weight', '600')
        .text(`${node.frequency}×`);

      // Draw triggers with dynamic spacing (no empty spaces)
      const maxConnections = 3;
      const triggers = node.triggers.slice(0, maxConnections);
      const triggerSpacing = triggers.length > 1 ? 150 : 0;
      const triggerStartY = emotionY - ((triggers.length - 1) * triggerSpacing) / 2;

      triggers.forEach((trigger, triggerIndex) => {
        const triggerY = triggerStartY + triggerIndex * triggerSpacing;
        
        // Draw line
        g.append('line')
          .attr('x1', columns[0].x + 60)
          .attr('y1', emotionY)
          .attr('x2', columns[1].x - 100)
          .attr('y2', triggerY)
          .attr('stroke', columns[1].color)
          .attr('stroke-width', 2)
          .attr('opacity', 0.4);

        // Draw trigger node (narrower, taller pills)
        const triggerG = g.append('g')
          .attr('transform', `translate(${columns[1].x},${triggerY})`)
          .style('cursor', 'pointer')
          .on('click', () => onNodeClick?.('trigger', trigger));

        triggerG.append('rect')
          .attr('x', -100)
          .attr('y', -35)
          .attr('width', 200)
          .attr('height', 70)
          .attr('rx', 15)
          .attr('fill', columns[1].color)
          .attr('opacity', 0.9)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);

        // Wrap text for better readability
        const words = trigger.split(' ');
        const maxWidth = 180;
        let line = '';
        let lineNumber = 0;
        const lineHeight = 16;
        
        words.forEach((word, i) => {
          const testLine = line + (line ? ' ' : '') + word;
          const testWidth = testLine.length * 7;
          
          if (testWidth > maxWidth && line !== '') {
            triggerG.append('text')
              .attr('text-anchor', 'middle')
              .attr('dy', `${-8 + lineNumber * lineHeight}px`)
              .style('fill', 'white')
              .style('font-size', '13px')
              .style('font-weight', '600')
              .text(line);
            line = word;
            lineNumber++;
          } else {
            line = testLine;
          }
          
          if (i === words.length - 1) {
            triggerG.append('text')
              .attr('text-anchor', 'middle')
              .attr('dy', `${-8 + lineNumber * lineHeight}px`)
              .style('fill', 'white')
              .style('font-size', '13px')
              .style('font-weight', '600')
              .text(line);
          }
        });
        
        triggerG.append('title').text(trigger);
      });

      // Draw distortions with dynamic spacing (no empty spaces)
      const distortions = node.distortions.slice(0, maxConnections);
      const distortionSpacing = distortions.length > 1 ? 150 : 0;
      const distortionStartY = emotionY - ((distortions.length - 1) * distortionSpacing) / 2;

      distortions.forEach((distortion, distIndex) => {
        const distY = distortionStartY + distIndex * distortionSpacing;
        
        // Draw line from middle trigger to distortion
        const middleTriggerY = emotionY;
        g.append('line')
          .attr('x1', columns[1].x + 100)
          .attr('y1', middleTriggerY)
          .attr('x2', columns[2].x - 100)
          .attr('y2', distY)
          .attr('stroke', columns[2].color)
          .attr('stroke-width', 2)
          .attr('opacity', 0.4);

        // Draw distortion node (narrower, taller boxes)
        const distG = g.append('g')
          .attr('transform', `translate(${columns[2].x},${distY})`)
          .style('cursor', 'pointer')
          .on('click', () => onNodeClick?.('distortion', distortion));

        distG.append('rect')
          .attr('x', -100)
          .attr('y', -35)
          .attr('width', 200)
          .attr('height', 70)
          .attr('rx', 10)
          .attr('fill', columns[2].color)
          .attr('opacity', 0.9)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);

        // Wrap text for better readability
        const distWords = distortion.split(' ');
        const distMaxWidth = 180;
        let distLine = '';
        let distLineNumber = 0;
        const distLineHeight = 16;
        
        distWords.forEach((word, i) => {
          const testLine = distLine + (distLine ? ' ' : '') + word;
          const testWidth = testLine.length * 7;
          
          if (testWidth > distMaxWidth && distLine !== '') {
            distG.append('text')
              .attr('text-anchor', 'middle')
              .attr('dy', `${-8 + distLineNumber * distLineHeight}px`)
              .style('fill', 'white')
              .style('font-size', '13px')
              .style('font-weight', '600')
              .text(distLine);
            distLine = word;
            distLineNumber++;
          } else {
            distLine = testLine;
          }
          
          if (i === distWords.length - 1) {
            distG.append('text')
              .attr('text-anchor', 'middle')
              .attr('dy', `${-8 + distLineNumber * distLineHeight}px`)
              .style('fill', 'white')
              .style('font-size', '13px')
              .style('font-weight', '600')
              .text(distLine);
          }
        });
        
        distG.append('title').text(distortion);
      });

      // Draw patterns with dynamic spacing (no empty spaces)
      const patterns = node.patterns.slice(0, maxConnections);
      const patternSpacing = patterns.length > 1 ? 150 : 0;
      const patternStartY = emotionY - ((patterns.length - 1) * patternSpacing) / 2;

      patterns.forEach((pattern, patternIndex) => {
        const patternY = patternStartY + patternIndex * patternSpacing;
        
        // Draw line
        const middleDistY = emotionY;
        g.append('line')
          .attr('x1', columns[2].x + 100)
          .attr('y1', middleDistY)
          .attr('x2', columns[3].x - 67)
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
          .attr('r', 67)
          .attr('fill', columns[3].color)
          .attr('opacity', 0.9)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);

        patternG.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .style('fill', 'white')
          .style('font-size', '14px')
          .style('font-weight', '700')
          .text(pattern)
          .append('title')
          .text(pattern);
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
      {/* How to Read This - Moved to top */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-2">📖</span>
          How to Read This Flow Diagram
        </h4>
        
        <div className="mb-4 text-sm text-gray-700 space-y-2">
          <p className="font-medium">This diagram shows the chain reaction of your emotional experiences:</p>
          <p><strong>Follow the lines from left to right</strong> to see how one thing leads to another. Each emotion connects to the events that triggered it, the thought patterns that followed, and the behaviors that resulted.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">1</div>
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="font-bold text-gray-900">Emotions</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">The feelings you experienced</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 ml-11">
              The red circles show your most frequent emotions. The number indicates how many times it appeared in your journals.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">2</div>
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                  <span className="font-bold text-gray-900">Triggers</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">What caused the emotion</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 ml-11">
              The purple pills show specific situations, events, or circumstances that sparked your emotional response.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">3</div>
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                  <span className="font-bold text-gray-900">Distortions</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">How your mind interpreted it</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 ml-11">
              The orange boxes reveal cognitive distortions - unhelpful thinking patterns like catastrophizing or mind reading.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">4</div>
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="font-bold text-gray-900">Patterns</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">What you did in response</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 ml-11">
              The green circles show your behavioral patterns - the actions you took as a result of your thoughts and feelings.
            </p>
          </div>
        </div>

        <div className="bg-blue-100 rounded-lg p-4 border border-blue-300">
          <p className="text-sm text-blue-900 flex items-start">
            <span className="text-lg mr-2">💡</span>
            <span><strong>Pro Tip:</strong> Understanding this chain helps you interrupt negative patterns. If you can identify the trigger or catch the distortion early, you can choose a different response before it becomes a habitual pattern.</span>
          </p>
        </div>
      </div>

      <div ref={containerRef} className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Root Cause Flow
          </h3>
          <p className="text-sm text-gray-600">
            Your top 5 emotions and their cause-and-effect relationships. Scroll horizontally to see the full flow.
          </p>
        </div>
        <div className="overflow-x-auto">
          <svg ref={svgRef} />
        </div>
      </div>
    </div>
  );
};
