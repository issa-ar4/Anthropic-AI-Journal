import React from 'react';
import { Filter, Search } from 'lucide-react';
import { NodeType, EdgeType } from '../../types/canvas.types';

interface CanvasControlsProps {
  onFilterChange: (filters: {
    nodeTypes: NodeType[];
    edgeTypes: EdgeType[];
    searchQuery: string;
  }) => void;
  onLayoutChange: (layout: 'force' | 'circular' | 'hierarchical') => void;
  onTimeRangeChange: (days: number) => void;
  selectedNodeTypes: NodeType[];
  selectedEdgeTypes: EdgeType[];
  searchQuery: string;
  timeRange: number;
}

const CanvasControls: React.FC<CanvasControlsProps> = ({
  onFilterChange,
  onLayoutChange,
  onTimeRangeChange,
  selectedNodeTypes,
  selectedEdgeTypes,
  searchQuery,
  timeRange,
}) => {
  const nodeTypes: { type: NodeType; label: string; icon: string; color: string }[] = [
    { type: 'entry', label: 'Entries', icon: '📝', color: '#6366f1' },
    { type: 'emotion', label: 'Emotions', icon: '😊', color: '#ef4444' },
    { type: 'theme', label: 'Themes', icon: '💡', color: '#8b5cf6' },
    { type: 'pattern', label: 'Patterns', icon: '🔄', color: '#10b981' },
    { type: 'distortion', label: 'Distortions', icon: '⚠️', color: '#f59e0b' },
  ];

  const handleNodeTypeToggle = (type: NodeType) => {
    const newTypes = selectedNodeTypes.includes(type)
      ? selectedNodeTypes.filter(t => t !== type)
      : [...selectedNodeTypes, type];
    onFilterChange({ nodeTypes: newTypes, edgeTypes: selectedEdgeTypes, searchQuery });
  };

  const handleSearchChange = (query: string) => {
    onFilterChange({ nodeTypes: selectedNodeTypes, edgeTypes: selectedEdgeTypes, searchQuery: query });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-4">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search nodes..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Time Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time Range
        </label>
        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 2 weeks</option>
          <option value={30}>Last month</option>
          <option value={90}>Last 3 months</option>
          <option value={180}>Last 6 months</option>
          <option value={365}>Last year</option>
          <option value={0}>All time</option>
        </select>
      </div>

      {/* Node Type Filters */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Filter size={16} />
          Node Types
        </label>
        <div className="space-y-2">
          {nodeTypes.map(({ type, label, icon, color }) => (
            <label
              key={type}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedNodeTypes.length === 0 || selectedNodeTypes.includes(type)}
                onChange={() => handleNodeTypeToggle(type)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-lg">{icon}</span>
              <span className="text-sm text-gray-700">{label}</span>
              <div
                className="ml-auto w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Layout Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Layout
        </label>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => onLayoutChange('force')}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
          >
            🌐 Force-Directed
          </button>
          <button
            onClick={() => onLayoutChange('circular')}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
          >
            ⭕ Circular
          </button>
          <button
            onClick={() => onLayoutChange('hierarchical')}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
          >
            📊 Hierarchical
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Legend</h4>
        <div className="space-y-1 text-xs text-gray-600">
          <div>• Circle size = frequency/importance</div>
          <div>• Line thickness = connection strength</div>
          <div>• Red badge = appears multiple times</div>
          <div>• Drag nodes to reposition</div>
          <div>• Scroll to zoom</div>
        </div>
      </div>
    </div>
  );
};

export default CanvasControls;
