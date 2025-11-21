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

    const yScale = d3.scaleBand()
      .domain(emotions)
      .range([0, innerHeight])
      .padding(0.3);

    // Color scale based on emotion category
    const emotionColors: Record<string, string> = {
      anxiety: '#ef4444',
      fear: '#dc2626',
      sadness: '#3b82f6',
      anger: '#f97316',
      joy: '#10b981',
      hope: '#14b8a6',
      calm: '#6366f1',
      excitement: '#eab308',
      overwhelm: '#f59e0b',
      inadequacy: '#ec4899',
    };

    const getColor = (emotionName: string) => {
      const lower = emotionName.toLowerCase();
      return emotionColors[lower] || '#6b7280';
    };

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
    const yAxis = d3.axisLeft(yScale);
    
    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-weight', (d) => d === selectedEmotion ? 'bold' : 'normal')
      .style('fill', (d) => d === selectedEmotion ? getColor(d as string) : '#374151');

    // Create intensity scale for circle size
    const intensityScale = d3.scaleLinear()
      .domain([0, 100])
      .range([4, 16]);

    // Draw emotion data points (only for top 5)
    data.forEach(day => {
      day.emotions.forEach(emotion => {
        if (!emotions.includes(emotion.name)) return; // Only show top 5
        
        const date = new Date(day.date);
        const yPos = yScale(emotion.name);
        
        if (yPos === undefined) return;

        g.append('circle')
          .attr('cx', xScale(date))
          .attr('cy', yPos + yScale.bandwidth() / 2)
          .attr('r', intensityScale(emotion.intensity))
          .attr('fill', getColor(emotion.name))
          .attr('opacity', selectedEmotion === null || selectedEmotion === emotion.name ? 0.7 : 0.2)
          .attr('stroke', '#fff')
          .attr('stroke-width', 1.5)
          .style('cursor', 'pointer')
          .on('mouseenter', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('r', intensityScale(emotion.intensity) * 1.3)
              .attr('opacity', 1);
          })
          .on('mouseleave', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('r', intensityScale(emotion.intensity))
              .attr('opacity', selectedEmotion === null || selectedEmotion === emotion.name ? 0.7 : 0.2);
          })
          .on('click', () => {
            setSelectedEmotion(emotion.name);
            if (onEmotionClick) {
              onEmotionClick(emotion.name);
            }
          })
          .append('title')
          .text(`${emotion.name}: ${emotion.intensity}/100 on ${d3.timeFormat('%b %d')(date)}`);
      });
    });

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 10}, ${margin.top})`);

    legend.append('text')
      .attr('y', -10)
      .style('font-size', '12px')
      .style('font-weight', '600')
      .text('Intensity');

    [100, 50, 10].forEach((intensity, i) => {
      legend.append('circle')
        .attr('cy', i * 30 + 10)
        .attr('r', intensityScale(intensity))
        .attr('fill', '#6b7280')
        .attr('opacity', 0.5);

      legend.append('text')
        .attr('x', 25)
        .attr('y', i * 30 + 15)
        .style('font-size', '11px')
        .text(`${intensity}%`);
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
          Click on an emotion name or circle to filter. Circle size represents intensity.
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
