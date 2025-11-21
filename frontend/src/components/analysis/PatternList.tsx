import { useState } from 'react';
import { Pattern } from '../../types/analysis.types';
import { TrendingUp, Target, Brain, Zap, ChevronDown, ChevronUp, Calendar, FileText, ExternalLink, TrendingDown, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PatternListProps {
  patterns: Pattern[];
  patternTrends?: {
    patternId: string;
    weeklyFrequency: number[];
  }[];
}

const getPatternIcon = (type: string) => {
  switch (type) {
    case 'recurring_theme':
      return <TrendingUp className="w-4 h-4" />;
    case 'trigger':
      return <Zap className="w-4 h-4" />;
    case 'behavioral':
      return <Target className="w-4 h-4" />;
    case 'thought_pattern':
      return <Brain className="w-4 h-4" />;
    default:
      return <Brain className="w-4 h-4" />;
  }
};

const getPatternColor = (type: string) => {
  switch (type) {
    case 'recurring_theme':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'trigger':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'behavioral':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'thought_pattern':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getPatternBgColor = (type: string) => {
  switch (type) {
    case 'recurring_theme':
      return 'bg-blue-50';
    case 'trigger':
      return 'bg-amber-50';
    case 'behavioral':
      return 'bg-green-50';
    case 'thought_pattern':
      return 'bg-purple-50';
    default:
      return 'bg-gray-50';
  }
};

export default function PatternList({ patterns, patternTrends = [] }: PatternListProps) {
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);

  // Get trend for a specific pattern
  const getTrend = (patternId: string) => {
    const trend = patternTrends.find(t => t.patternId === patternId);
    if (!trend || trend.weeklyFrequency.length < 2) return null;
    
    const recent = trend.weeklyFrequency.slice(-4); // Last 4 weeks
    const older = trend.weeklyFrequency.slice(-8, -4); // Previous 4 weeks
    
    if (older.length === 0) return null;
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    
    const change = recentAvg - olderAvg;
    
    // Handle division by zero and calculate percentage
    let percentChange = 0;
    let isNew = false;
    
    if (olderAvg === 0 && recentAvg > 0) {
      // New pattern in recent period
      isNew = true;
      percentChange = 100;
    } else if (olderAvg !== 0) {
      percentChange = (change / olderAvg) * 100;
    }
    
    return {
      change,
      percentChange,
      data: recent,
      isNew,
    };
  };

  const renderSparkline = (data: number[]) => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data, 1);
    const width = 60;
    const height = 20;
    
    // Create smooth curve path using cubic bezier
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - (val / max) * height;
      return { x, y };
    });
    
    // Generate smooth curve path
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      path += ` Q ${controlX},${current.y} ${controlX},${(current.y + next.y) / 2}`;
      path += ` Q ${controlX},${next.y} ${next.x},${next.y}`;
    }
    
    return (
      <svg width={width} height={height} className="inline-block">
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  if (patterns.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Brain className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No patterns detected yet</p>
        <p className="text-sm mt-1">Keep journaling to discover patterns!</p>
      </div>
    );
  }

  const togglePattern = (patternId: string) => {
    setExpandedPattern(expandedPattern === patternId ? null : patternId);
  };

  return (
    <div className="space-y-4">
      {patterns.map((pattern) => {
        const isExpanded = expandedPattern === pattern.id;
        const trend = getTrend(pattern.id);
        
        return (
          <div
            key={pattern.id}
            className={`rounded-lg border-l-4 transition-all ${getPatternColor(pattern.type)} ${getPatternBgColor(pattern.type)}`}
          >
            <div
              className="px-4 py-3 cursor-pointer hover:bg-white/50 transition-colors"
              onClick={() => togglePattern(pattern.id)}
            >
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-2 flex-1">
                  {getPatternIcon(pattern.type)}
                  <span className="font-semibold capitalize">
                    {pattern.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium px-3 py-1 bg-white rounded-full border-2 border-current">
                    {pattern.frequency}× detected
                  </span>
                  {trend && (
                    <div className="flex items-center gap-2">
                      {renderSparkline(trend.data)}
                      {trend.isNew ? (
                        <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-300">
                          New
                        </span>
                      ) : Math.abs(trend.change) < 0.01 ? (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Minus className="w-4 h-4" />
                          <span className="text-xs font-medium">0%</span>
                        </div>
                      ) : (
                        <div className={`flex items-center gap-1 ${trend.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {trend.change > 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="text-xs font-medium">
                            {Math.abs(trend.percentChange).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-1.5">{pattern.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {pattern.relatedEntryIds.length} related{' '}
                  {pattern.relatedEntryIds.length === 1 ? 'entry' : 'entries'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Last seen: {new Date(pattern.lastDetected).toLocaleDateString()}
                </span>
              </div>
            </div>

            {isExpanded && (
              <div className="px-4 pb-3 pt-2 border-t border-current/20">
                <div className="bg-white rounded-lg p-3 space-y-2.5">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Timeline
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-600">First detected:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(pattern.firstDetected).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Most recent:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(pattern.lastDetected).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Related Journal Entries
                    </h4>
                    <div className="space-y-2">
                      {pattern.relatedEntryIds.slice(0, 5).map((entryId, idx) => (
                        <Link
                          key={entryId}
                          to={`/journal?entry=${entryId}`}
                          className="flex items-center justify-between p-2 rounded bg-gray-50 hover:bg-gray-100 transition-colors text-sm group"
                        >
                          <span className="text-gray-700">
                            Entry {idx + 1}
                          </span>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        </Link>
                      ))}
                      {pattern.relatedEntryIds.length > 5 && (
                        <p className="text-xs text-gray-500 pl-2">
                          + {pattern.relatedEntryIds.length - 5} more entries
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <Link
                      to={`/root-cause`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
                    >
                      <Target className="w-4 h-4" />
                      Explore in Root Cause Analysis
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
