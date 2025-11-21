import { useState } from 'react';
import { Pattern } from '../../types/analysis.types';
import { TrendingUp, Target, Brain, Zap, ChevronDown, ChevronUp, Calendar, FileText, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PatternListProps {
  patterns: Pattern[];
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

export default function PatternList({ patterns }: PatternListProps) {
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);

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
        
        return (
          <div
            key={pattern.id}
            className={`rounded-lg border-l-4 transition-all ${getPatternColor(pattern.type)} ${getPatternBgColor(pattern.type)}`}
          >
            <div
              className="p-4 cursor-pointer hover:bg-white/50 transition-colors"
              onClick={() => togglePattern(pattern.id)}
            >
              <div className="flex items-start justify-between mb-2">
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
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">{pattern.description}</p>
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
              <div className="px-4 pb-4 pt-2 border-t border-current/20">
                <div className="bg-white rounded-lg p-4 space-y-3">
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
