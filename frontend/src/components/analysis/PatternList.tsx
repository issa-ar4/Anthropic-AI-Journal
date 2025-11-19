import { Pattern } from '../../types/analysis.types';
import { TrendingUp, Target, Brain, Zap } from 'lucide-react';

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

export default function PatternList({ patterns }: PatternListProps) {
  if (patterns.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Brain className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No patterns detected yet</p>
        <p className="text-sm mt-1">Keep journaling to discover patterns!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {patterns.map((pattern) => (
        <div
          key={pattern.id}
          className={`p-4 rounded-lg border-l-4 ${getPatternColor(pattern.type)}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getPatternIcon(pattern.type)}
              <span className="font-semibold capitalize">
                {pattern.type.replace('_', ' ')}
              </span>
            </div>
            <span className="text-sm font-medium">
              {pattern.frequency}x
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-2">{pattern.description}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {pattern.relatedEntryIds.length} related{' '}
              {pattern.relatedEntryIds.length === 1 ? 'entry' : 'entries'}
            </span>
            <span>
              Last seen: {new Date(pattern.lastDetected).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
