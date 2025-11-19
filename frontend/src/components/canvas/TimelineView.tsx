import React, { useMemo } from 'react';
import { CanvasNode } from '../../types/canvas.types';

interface TimelineViewProps {
  nodes: CanvasNode[];
  onNodeClick?: (node: CanvasNode) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ nodes, onNodeClick }) => {
  // Group nodes by date
  const timelineData = useMemo(() => {
    const entryNodes = nodes
      .filter(n => n.type === 'entry' && n.metadata.date)
      .sort((a, b) => new Date(b.metadata.date!).getTime() - new Date(a.metadata.date!).getTime());

    // Group by month
    const grouped: { [key: string]: CanvasNode[] } = {};
    entryNodes.forEach(node => {
      const date = new Date(node.metadata.date!);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(node);
    });

    return Object.entries(grouped).map(([month, nodes]) => ({
      month,
      monthLabel: new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      nodes,
    }));
  }, [nodes]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'entry': return '📝';
      case 'emotion': return '😊';
      case 'theme': return '💡';
      case 'pattern': return '🔄';
      case 'distortion': return '⚠️';
      default: return '•';
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'bg-green-100 border-green-300';
    if (sentiment < -0.3) return 'bg-red-100 border-red-300';
    return 'bg-gray-100 border-gray-300';
  };

  return (
    <div className="space-y-8">
      {timelineData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No entries to display</p>
        </div>
      ) : (
        timelineData.map(({ month, monthLabel, nodes: monthNodes }) => (
          <div key={month} className="relative">
            {/* Month Header */}
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm py-2 mb-4 border-b-2 border-indigo-200">
              <h3 className="text-lg font-semibold text-gray-900">{monthLabel}</h3>
              <p className="text-sm text-gray-500">{monthNodes.length} entries</p>
            </div>

            {/* Timeline Line */}
            <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gray-200" />

            {/* Entries */}
            <div className="space-y-6 pl-16">
              {monthNodes.map((node, index) => (
                <div key={node.id} className="relative">
                  {/* Timeline Dot */}
                  <div
                    className="absolute -left-[2.1rem] top-3 w-4 h-4 rounded-full border-4 border-white"
                    style={{ backgroundColor: node.metadata.color || '#6366f1' }}
                  />

                  {/* Entry Card */}
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      node.metadata.sentiment !== undefined
                        ? getSentimentColor(node.metadata.sentiment)
                        : 'bg-white border-gray-200'
                    }`}
                    onClick={() => onNodeClick?.(node)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{getNodeIcon(node.type)}</span>
                          <h4 className="font-semibold text-gray-900">{node.label}</h4>
                        </div>
                        
                        {node.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {node.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>
                            {new Date(node.metadata.date!).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          
                          {node.metadata.sentiment !== undefined && (
                            <span className="flex items-center gap-1">
                              {node.metadata.sentiment > 0 ? '😊' : node.metadata.sentiment < 0 ? '😢' : '😐'}
                              <span className={node.metadata.sentiment > 0 ? 'text-green-600' : node.metadata.sentiment < 0 ? 'text-red-600' : 'text-gray-600'}>
                                {node.metadata.sentiment > 0 ? '+' : ''}
                                {(node.metadata.sentiment * 100).toFixed(0)}%
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Metadata Pills */}
                      {node.metadata.frequency && node.metadata.frequency > 1 && (
                        <div className="flex-shrink-0">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                            {node.metadata.frequency}x
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TimelineView;
