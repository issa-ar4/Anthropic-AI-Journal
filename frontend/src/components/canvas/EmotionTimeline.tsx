import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TimelineEmotion {
  name: string;
  intensity: number;
  trend?: 'up' | 'down' | 'stable';
}

interface TimelineDay {
  date: string;
  emotions: TimelineEmotion[];
}

interface EmotionTimelineProps {
  data: TimelineDay[];
  onEmotionClick?: (emotionName: string) => void;
}

export const EmotionTimeline: React.FC<EmotionTimelineProps> = ({ data, onEmotionClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 40, right: 120, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get top 5 emotions by frequency
    const emotionFrequency = new Map<string, number>();
    data.forEach(day => {
      day.emotions.forEach(e => {
        emotionFrequency.set(e.name, (emotionFrequency.get(e.name) || 0) + 1);
      });
    });
    
    const emotions = Array.from(emotionFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    // Create scales
    const xScale = d3.scaleTime()
      .domain([
        new Date(data[0].date),
        new Date(data[data.length - 1].date)
      ])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Create emotion to color mapping
    const emotionColorMap = new Map<string, string>();
    emotions.forEach((emotion, i) => {
      const colors = ['#ef4444', '#8b5cf6', '#f59e0b', '#10b981', '#3b82f6'];
      emotionColorMap.set(emotion, colors[i % colors.length]);
    });



    // Draw X axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(7)
      .tickFormat(d => d3.timeFormat('%b %d')(d as Date));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    // Draw Y axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d}`);
    
    g.append('g')
      .call(yAxis);

    // Add Y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', '#374151')
      .text('Intensity (0-100)');

    // Group data by emotion for line drawing
    const emotionData = new Map<string, Array<{ date: Date; intensity: number }>>();
    emotions.forEach(emotion => {
      emotionData.set(emotion, []);
    });

    data.forEach(day => {
      day.emotions.forEach(emotion => {
        if (!emotions.includes(emotion.name)) return;
        emotionData.get(emotion.name)?.push({
          date: new Date(day.date),
          intensity: emotion.intensity
        });
      });
    });

    // Draw lines for each emotion
    emotions.forEach(emotion => {
      const points = emotionData.get(emotion) || [];
      if (points.length === 0) return;

      points.sort((a, b) => a.date.getTime() - b.date.getTime());

      const line = d3.line<{ date: Date; intensity: number }>()
        .x(d => xScale(d.date))
        .y(d => yScale(d.intensity))
        .curve(d3.curveMonotoneX);

      const color = emotionColorMap.get(emotion) || '#6b7280';

      g.append('path')
        .datum(points)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', selectedEmotion === null || selectedEmotion === emotion ? 3 : 1)
        .attr('opacity', selectedEmotion === null || selectedEmotion === emotion ? 0.8 : 0.2)
        .attr('d', line);

      // Draw circles for data points
      points.forEach(point => {
        g.append('circle')
          .attr('cx', xScale(point.date))
          .attr('cy', yScale(point.intensity))
          .attr('r', 5)
          .attr('fill', color)
          .attr('opacity', selectedEmotion === null || selectedEmotion === emotion ? 0.9 : 0.2)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .on('mouseenter', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('r', 8)
              .attr('opacity', 1);
          })
          .on('mouseleave', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('r', 5)
              .attr('opacity', selectedEmotion === null || selectedEmotion === emotion ? 0.9 : 0.2);
          })
          .on('click', () => {
            setSelectedEmotion(emotion);
            if (onEmotionClick) {
              onEmotionClick(emotion);
            }
          })
          .append('title')
          .text(`${emotion}: ${point.intensity}/100 on ${d3.timeFormat('%b %d')(point.date)}`);
      });
    });

    // Add emotion legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 10}, ${margin.top})`);

    legend.append('text')
      .attr('y', -10)
      .style('font-size', '12px')
      .style('font-weight', '600')
      .text('Top 5 Emotions');

    emotions.forEach((emotion, i) => {
      const color = emotionColorMap.get(emotion) || '#6b7280';
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 25 + 10})`)
        .style('cursor', 'pointer')
        .on('click', () => {
          setSelectedEmotion(emotion);
          if (onEmotionClick) {
            onEmotionClick(emotion);
          }
        });

      legendRow.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', color)
        .attr('stroke-width', 3);

      legendRow.append('circle')
        .attr('cx', 10)
        .attr('cy', 0)
        .attr('r', 4)
        .attr('fill', color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5);

      legendRow.append('text')
        .attr('x', 28)
        .attr('y', 4)
        .style('font-size', '11px')
        .style('font-weight', selectedEmotion === emotion ? '700' : '400')
        .style('fill', selectedEmotion === emotion ? color : '#374151')
        .text(emotion);
    });

  }, [data, selectedEmotion, onEmotionClick]);

  // Calculate emotion statistics
  const emotionStats = React.useMemo(() => {
    const stats = new Map<string, { count: number; avgIntensity: number; trend: string }>();
    
    data.forEach(day => {
      day.emotions.forEach(emotion => {
        if (!stats.has(emotion.name)) {
          stats.set(emotion.name, { count: 0, avgIntensity: 0, trend: emotion.trend || 'stable' });
        }
        const current = stats.get(emotion.name)!;
        current.count++;
        current.avgIntensity += emotion.intensity;
      });
    });

    stats.forEach((value) => {
      value.avgIntensity = Math.round(value.avgIntensity / value.count);
    });

    return Array.from(stats.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [data]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeline Chart */}
      <div ref={containerRef} className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Emotion Timeline</h3>
          {selectedEmotion && (
            <button
              onClick={() => setSelectedEmotion(null)}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Clear selection
            </button>
          )}
        </div>
        <svg ref={svgRef} />
        <p className="text-sm text-gray-500 mt-4">
          Lines show how emotion intensity changes over time. Click on an emotion in the legend to filter. Y-axis shows intensity (0-100).
        </p>
      </div>

      {/* Top Emotions Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Top 5 Emotions Summary</h3>
        <p className="text-sm text-gray-600 mb-4">
          Your most frequent emotions over the selected time period
        </p>
        <div className="space-y-3">
          {emotionStats.map(emotion => (
            <div
              key={emotion.name}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
              onClick={() => {
                setSelectedEmotion(emotion.name);
                if (onEmotionClick) {
                  onEmotionClick(emotion.name);
                }
              }}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-semibold text-gray-900 text-base">{emotion.name}</span>
                  {getTrendIcon(emotion.trend)}
                </div>
                <div className="text-sm text-gray-600 space-x-4">
                  <span>Appeared <strong>{emotion.count} times</strong></span>
                  <span>•</span>
                  <span>Average intensity: <strong>{emotion.avgIntensity} out of 100</strong></span>
                </div>
              </div>
              <div className="ml-4">
                <div className="w-32 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-indigo-600 h-3 rounded-full transition-all"
                    style={{ width: `${emotion.avgIntensity}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>💡 How to read this:</strong> The number shows how many times this emotion appeared in your journal entries. 
            The intensity bar shows the average strength of this emotion (0 = barely felt, 100 = very intense).
          </p>
        </div>
      </div>
    </div>
  );
};
