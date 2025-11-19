import React from 'react';
import { D3Node } from '../../types/canvas.types';
import { X, Calendar, Tag, TrendingUp } from 'lucide-react';

interface NodeDetailPanelProps {
  node: D3Node | null;
  onClose: () => void;
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ node, onClose }) => {
  if (!node) return null;

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

  const getNodeTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="absolute top-4 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div 
        className="px-4 py-3 flex items-center justify-between border-b border-gray-200"
        style={{ backgroundColor: node.metadata.color || '#6366f1', opacity: 0.9 }}
      >
        <div className="flex items-center gap-2 text-white">
          <span className="text-2xl">{getNodeIcon(node.type)}</span>
          <span className="font-semibold">{getNodeTypeLabel(node.type)}</span>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded p-1 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto space-y-4">
        {/* Label */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{node.label}</h3>
        </div>

        {/* Description */}
        {node.description && (
          <div>
            <p className="text-sm text-gray-600">{node.description}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-2">
          {/* Date */}
          {node.metadata.date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-gray-600">
                {new Date(node.metadata.date).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Frequency */}
          {node.metadata.frequency && node.metadata.frequency > 1 && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp size={16} className="text-gray-400" />
              <span className="text-gray-600">
                Appears {node.metadata.frequency} times
              </span>
            </div>
          )}

          {/* Intensity */}
          {node.metadata.intensity !== undefined && (
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Intensity</span>
                <span className="font-medium">{node.metadata.intensity}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${node.metadata.intensity}%`,
                    backgroundColor: node.metadata.color || '#6366f1',
                  }}
                />
              </div>
            </div>
          )}

          {/* Sentiment */}
          {node.metadata.sentiment !== undefined && (
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Sentiment</span>
                <span className="font-medium">
                  {node.metadata.sentiment > 0 ? '+' : ''}
                  {(node.metadata.sentiment * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.abs(node.metadata.sentiment) * 100}%`,
                    backgroundColor: node.metadata.sentiment > 0 ? '#10b981' : '#ef4444',
                    marginLeft: node.metadata.sentiment > 0 ? '50%' : 'auto',
                    marginRight: node.metadata.sentiment < 0 ? '50%' : 'auto',
                  }}
                />
              </div>
            </div>
          )}

          {/* Category */}
          {node.metadata.category && (
            <div className="flex items-center gap-2 text-sm">
              <Tag size={16} className="text-gray-400" />
              <span className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs">
                {node.metadata.category}
              </span>
            </div>
          )}

          {/* Severity */}
          {node.metadata.severity && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Severity:</span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  node.metadata.severity === 'high'
                    ? 'bg-red-100 text-red-700'
                    : node.metadata.severity === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {node.metadata.severity}
              </span>
            </div>
          )}

          {/* Pattern Type */}
          {node.metadata.patternType && (
            <div className="flex items-center gap-2 text-sm">
              <Tag size={16} className="text-gray-400" />
              <span className="text-gray-600">
                Type: <span className="font-medium">{node.metadata.patternType}</span>
              </span>
            </div>
          )}
        </div>

        {/* Entry Link */}
        {node.metadata.entryId && (
          <div className="pt-3 border-t border-gray-200">
            <a
              href={`/journal/${node.metadata.entryId}`}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View Full Entry →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeDetailPanel;
