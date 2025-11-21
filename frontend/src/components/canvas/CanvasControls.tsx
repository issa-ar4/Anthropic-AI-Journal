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
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-5">
      <h3 className="font-semibold text-gray-900 text-lg">Filters</h3>
      
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Time Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time Period
        </label>
        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange(Number(e.target.value))}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value={7}>Last week</option>
          <option value={30}>Last month</option>
          <option value={90}>Last 3 months</option>
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
                className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-base">{icon}</span>
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <div
                className="ml-auto w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: color }}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">How to Use</h4>
        <div className="space-y-1.5 text-xs text-gray-600">
          <div>• Click nodes for details</div>
          <div>• Drag nodes to move them</div>
          <div>• Scroll to zoom in/out</div>
          <div>• Filter by type below</div>
        </div>
      </div>
    </div>
  );
};

export default CanvasControls;
