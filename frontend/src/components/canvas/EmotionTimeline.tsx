import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { TrendingUp, TrendingDown, AlertCircle, Activity, Clock, Zap } from 'lucide-react';

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

// New interfaces for volatility and transitions
interface EmotionVolatility {
  emotion: string;
  volatilityScore: number; // 0-100
  avgIntensity: number;
  peakIntensity: number;
  daysPresent: number;
}

interface EmotionTransition {
  from: string;
  to: string;
  count: number;
  avgDaysBetween: number;
}

export const EmotionTimeline: React.FC<EmotionTimelineProps> = ({ data, onEmotionClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'volatility' | 'transitions'>('volatility');

  // Calculate volatility metrics
  const volatilityData = useMemo(() => {
    const emotionMap = new Map<string, number[]>();
    
    data.forEach(day => {
      day.emotions.forEach(emotion => {
        if (!emotionMap.has(emotion.name)) {
          emotionMap.set(emotion.name, []);
        }
        emotionMap.get(emotion.name)!.push(emotion.intensity);
      });
    });

    const volatilities: EmotionVolatility[] = [];
    emotionMap.forEach((intensities, emotion) => {
      if (intensities.length < 2) return;
      
      // Calculate standard deviation for volatility
      const avg = intensities.reduce((a, b) => a + b, 0) / intensities.length;
      const variance = intensities.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / intensities.length;
      const stdDev = Math.sqrt(variance);
      
      // Normalize to 0-100 scale (assuming max std dev of 30 for emotional swings)
      const volatilityScore = Math.min(100, (stdDev / 30) * 100);
      
      volatilities.push({
        emotion,
        volatilityScore: Math.round(volatilityScore),
        avgIntensity: Math.round(avg),
        peakIntensity: Math.max(...intensities),
        daysPresent: intensities.length,
      });
    });
    
    return volatilities.sort((a, b) => b.volatilityScore - a.volatilityScore).slice(0, 5);
  }, [data]);

  // Calculate emotion transitions
  const transitionData = useMemo(() => {
    const transitions = new Map<string, { count: number; totalDays: number }>();
    
    for (let i = 0; i < data.length - 1; i++) {
      const currentDay = data[i];
      const nextDay = data[i + 1];
      
      // Find dominant emotion (highest intensity) for each day
      const currentDominant = currentDay.emotions.reduce((max, e) => 
        e.intensity > max.intensity ? e : max, currentDay.emotions[0]);
      const nextDominant = nextDay.emotions.reduce((max, e) => 
        e.intensity > max.intensity ? e : max, nextDay.emotions[0]);
      
      if (currentDominant && nextDominant && currentDominant.name !== nextDominant.name) {
        const key = `${currentDominant.name}→${nextDominant.name}`;
        if (!transitions.has(key)) {
          transitions.set(key, { count: 0, totalDays: 0 });
        }
        const t = transitions.get(key)!;
        t.count++;
        t.totalDays += 1; // Days between is always 1 in this simplified version
      }
    }
    
    return Array.from(transitions.entries())
      .map(([key, data]) => {
        const [from, to] = key.split('→');
        return {
          from,
          to,
          count: data.count,
          avgDaysBetween: data.totalDays / data.count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [data]);

  // Calculate baseline comparison
  const baselineComparison = useMemo(() => {
    if (data.length < 14) return null;
    
    const mid = Math.floor(data.length / 2);
    const older = data.slice(0, mid);
    const recent = data.slice(mid);
    
    const getAvgIntensities = (days: TimelineDay[]) => {
      const map = new Map<string, number[]>();
      days.forEach(day => {
        day.emotions.forEach(e => {
          if (!map.has(e.name)) map.set(e.name, []);
          map.get(e.name)!.push(e.intensity);
        });
      });
      
      const result = new Map<string, number>();
      map.forEach((intensities, emotion) => {
        result.set(emotion, intensities.reduce((a, b) => a + b, 0) / intensities.length);
      });
      return result;
    };
    
    const olderAvg = getAvgIntensities(older);
    const recentAvg = getAvgIntensities(recent);
    
    const changes: { emotion: string; change: number; direction: 'up' | 'down' }[] = [];
    recentAvg.forEach((recent, emotion) => {
      const older = olderAvg.get(emotion) || 0;
      const change = ((recent - older) / Math.max(older, 1)) * 100;
      if (Math.abs(change) > 10) {
        changes.push({
          emotion,
          change: Math.round(Math.abs(change)),
          direction: change > 0 ? 'up' : 'down',
        });
      }
    });
    
    return changes.sort((a, b) => b.change - a.change).slice(0, 3);
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0 || viewType !== 'volatility') return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = 350;
    const margin = { top: 20, right: 20, bottom: 40, left: 180 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create horizontal bar chart for volatility
    const yScale = d3.scaleBand()
      .domain(volatilityData.map(d => d.emotion))
      .range([0, innerHeight])
      .padding(0.2);

    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);

    // Color scale based on volatility
    const colorScale = d3.scaleLinear<string>()
      .domain([0, 50, 100])
      .range(['#10b981', '#f59e0b', '#ef4444']);

    // Draw Y axis (emotion names)
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '13px')
      .style('font-weight', '600');

    // Draw X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .selectAll('text')
      .style('font-size', '11px');

    // Add axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Volatility Score (0 = Stable, 100 = Highly Variable)');

    // Draw bars
    g.selectAll('.volatility-bar')
      .data(volatilityData)
      .enter()
      .append('rect')
      .attr('class', 'volatility-bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.emotion) || 0)
      .attr('width', d => xScale(d.volatilityScore))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.volatilityScore))
      .attr('opacity', 0.8)
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseenter', function() {
        d3.select(this).attr('opacity', 1);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('opacity', 0.8);
      })
      .on('click', (_, d) => {
        setSelectedEmotion(d.emotion);
        if (onEmotionClick) {
          onEmotionClick(d.emotion);
        }
      });

    // Add value labels on bars
    g.selectAll('.volatility-label')
      .data(volatilityData)
      .enter()
      .append('text')
      .attr('class', 'volatility-label')
      .attr('x', d => xScale(d.volatilityScore) + 8)
      .attr('y', d => (yScale(d.emotion) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('font-weight', '700')
      .style('fill', '#374151')
      .text(d => d.volatilityScore);

  }, [data, volatilityData, selectedEmotion, onEmotionClick, viewType]);

  const getVolatilityLevel = (score: number) => {
    if (score >= 70) return { label: 'Highly Volatile', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    if (score >= 40) return { label: 'Moderately Volatile', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { label: 'Stable', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
  };

  return (
    <div className="space-y-6">
      {/* Header with View Switcher */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              Emotional Weather Map
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Understanding your emotional patterns through volatility and transitions
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewType('volatility')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                viewType === 'volatility'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Zap className="w-4 h-4 inline mr-1" />
              Volatility
            </button>
            <button
              onClick={() => setViewType('transitions')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                viewType === 'transitions'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-1" />
              Transitions
            </button>
          </div>
        </div>
      </div>

      {viewType === 'volatility' && (
        <>
          {/* Volatility Chart */}
          <div ref={containerRef} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Emotional Volatility Index
              </h3>
              <p className="text-sm text-gray-600">
                Which emotions swing the most? High volatility means unpredictable intensity changes.
              </p>
            </div>
            <svg ref={svgRef} />
          </div>

          {/* Volatility Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {volatilityData.map((emotion) => {
              const level = getVolatilityLevel(emotion.volatilityScore);
              return (
                <div
                  key={emotion.emotion}
                  className={`${level.bg} rounded-xl p-5 border ${level.border} cursor-pointer hover:shadow-md transition-all`}
                  onClick={() => {
                    setSelectedEmotion(emotion.emotion);
                    if (onEmotionClick) onEmotionClick(emotion.emotion);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-bold text-lg text-gray-900">{emotion.emotion}</h4>
                    <div className={`px-2 py-1 rounded-lg text-xs font-bold ${level.color} bg-white`}>
                      {emotion.volatilityScore}
                    </div>
                  </div>
                  
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${level.color} bg-white mb-3`}>
                    <AlertCircle className="w-3 h-3" />
                    {level.label}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mt-4">
                    <div>
                      <p className="text-gray-500 mb-1">Avg Intensity</p>
                      <p className="font-bold text-gray-900">{emotion.avgIntensity}/100</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Peak</p>
                      <p className="font-bold text-gray-900">{emotion.peakIntensity}/100</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500 mb-1">Days Present</p>
                      <p className="font-bold text-gray-900">{emotion.daysPresent} days</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {viewType === 'transitions' && (
        <>
          {/* Explanation Card */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Understanding Emotional Transitions
            </h4>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>What you're seeing:</strong> These are your most common emotional sequences - how one feeling tends to lead to another.
              </p>
              <p>
                <strong>How to read it:</strong> "Anxiety → Loneliness" means that on days when you felt anxiety, loneliness often followed on the next day.
              </p>
              <p>
                <strong>Why it matters:</strong> Understanding these patterns helps you:
                <span className="block mt-1 ml-4">• Anticipate what emotion might come next</span>
                <span className="block ml-4">• Break negative cascades before they start</span>
                <span className="block ml-4">• Identify triggers that set off emotional chains</span>
              </p>
              <p className="text-xs text-gray-600 bg-white rounded-lg p-3 mt-2">
                <strong>💡 Pro tip:</strong> If you see a pattern like "Pride → Anxiety," it might mean accomplishments trigger worry about maintaining success. Recognizing this helps you prepare healthier responses.
              </p>
            </div>
          </div>

          {/* Emotion Transitions */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Emotional Transition Patterns
              </h3>
              <p className="text-sm text-gray-600">
                Your top 5 most frequent emotional sequences
              </p>
            </div>
            
            {transitionData.length > 0 ? (
              <div className="space-y-4">
                {transitionData.map((transition, idx) => (
                  <div
                    key={`${transition.from}-${transition.to}-${idx}`}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="px-4 py-2 bg-white rounded-lg border-2 border-purple-300">
                        <span className="font-bold text-gray-900">{transition.from}</span>
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-300 to-blue-300"></div>
                        <Activity className="w-4 h-4 text-blue-500" />
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300"></div>
                      </div>
                      <div className="px-4 py-2 bg-white rounded-lg border-2 border-blue-300">
                        <span className="font-bold text-gray-900">{transition.to}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{transition.count}×</p>
                      <p className="text-xs text-gray-500">occurrences</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Not enough data to detect emotion transitions yet
              </p>
            )}
          </div>
        </>
      )}

      {/* Baseline Comparison */}
      {baselineComparison && baselineComparison.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-900">Then vs. Now</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Comparing recent period to earlier baseline
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {baselineComparison.map((change) => (
              <div
                key={change.emotion}
                className="bg-white rounded-xl p-4 border border-indigo-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{change.emotion}</span>
                  {change.direction === 'up' ? (
                    <TrendingUp className="w-5 h-5 text-red-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <p className={`text-2xl font-bold ${change.direction === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                  {change.direction === 'up' ? '+' : '-'}{change.change}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {change.direction === 'up' ? 'increasing' : 'decreasing'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          How to Use This View
        </h4>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Volatility:</strong> Shows which emotions have the most unpredictable swings. 
            High volatility = emotional turbulence that needs attention.
          </p>
          <p>
            <strong>Transitions:</strong> Reveals which emotions tend to follow each other. 
            Pattern: "Anxiety → Self-criticism" means anxiety often leads to self-criticism.
          </p>
          <p>
            <strong>Baseline:</strong> Compares your recent emotional state to your earlier patterns. 
            Helps identify if things are improving or declining.
          </p>
        </div>
      </div>
    </div>
  );
};
