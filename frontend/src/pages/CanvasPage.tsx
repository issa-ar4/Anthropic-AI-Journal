import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import canvasService from '../services/canvasService';
import Canvas from '../components/canvas/Canvas';
import NodeDetailPanel from '../components/canvas/NodeDetailPanel';
import CanvasControls from '../components/canvas/CanvasControls';
import TimelineView from '../components/canvas/TimelineView';
import { D3Node, CanvasGraph, NodeType, EdgeType } from '../types/canvas.types';
import { Loader2, Download, RefreshCw, BarChart3, Network } from 'lucide-react';

const CanvasPage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<D3Node | null>(null);
  const [filteredGraph, setFilteredGraph] = useState<CanvasGraph | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeTypes, setSelectedNodeTypes] = useState<NodeType[]>([]);
  const [selectedEdgeTypes, setSelectedEdgeTypes] = useState<EdgeType[]>([]);
  const [timeRange, setTimeRange] = useState(30);
  const [viewMode, setViewMode] = useState<'graph' | 'timeline'>('graph');
  const [isGenerating, setIsGenerating] = useState(false);

  // Load canvas data
  const {
    data: canvasData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['canvas'],
    queryFn: () => canvasService.loadCanvas(),
  });

  const graph = canvasData?.graph;

  // Filter graph based on controls
  useEffect(() => {
    if (!graph) {
      setFilteredGraph(null);
      return;
    }

    let nodes = graph.nodes;
    let edges = graph.edges;

    // Filter by node types
    if (selectedNodeTypes.length > 0) {
      nodes = nodes.filter(n => selectedNodeTypes.includes(n.type));
      const nodeIds = new Set(nodes.map(n => n.id));
      edges = edges.filter(e => nodeIds.has(e.sourceId) && nodeIds.has(e.targetId));
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      nodes = nodes.filter(n =>
        n.label.toLowerCase().includes(query) ||
        n.description?.toLowerCase().includes(query)
      );
      const nodeIds = new Set(nodes.map(n => n.id));
      edges = edges.filter(e => nodeIds.has(e.sourceId) && nodeIds.has(e.targetId));
    }

    setFilteredGraph({ nodes, edges, metadata: graph.metadata });
  }, [graph, selectedNodeTypes, searchQuery]);

  // Handle regenerate canvas
  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const newGraph = await canvasService.generateCanvas({
        includeEntries: true,
        includeEmotions: true,
        includeThemes: true,
        includePatterns: true,
        includeDistortions: true,
        days: timeRange || undefined,
        maxNodes: 100,
      });
      await canvasService.saveCanvas(newGraph);
      refetch();
    } catch (error) {
      console.error('Failed to regenerate canvas:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle save canvas
  const handleSave = async () => {
    if (!graph) return;
    try {
      await canvasService.saveCanvas(graph);
      alert('Canvas saved successfully!');
    } catch (error) {
      console.error('Failed to save canvas:', error);
      alert('Failed to save canvas');
    }
  };

  // Handle export
  const handleExport = () => {
    if (!graph) return;
    const dataStr = JSON.stringify(graph, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cognitive-canvas-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your cognitive canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cognitive Canvas
          </h1>
          <p className="text-gray-600">
            Interactive visualization of your journal entries, emotions, themes, and patterns
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('graph')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                viewMode === 'graph'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Network size={18} />
              Graph View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 size={18} />
              Timeline View
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <RefreshCw size={18} />
              )}
              {isGenerating ? 'Generating...' : 'Regenerate'}
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Main Content */}
        {!graph || !filteredGraph ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-4">
              No canvas data available. Generate your first cognitive canvas!
            </p>
            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate Canvas'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
            {/* Controls Sidebar */}
            {viewMode === 'graph' && (
              <div className="lg:sticky lg:top-4 lg:self-start">
                <CanvasControls
                  selectedNodeTypes={selectedNodeTypes}
                  selectedEdgeTypes={selectedEdgeTypes}
                  searchQuery={searchQuery}
                  timeRange={timeRange}
                  onFilterChange={({ nodeTypes, searchQuery: query }) => {
                    setSelectedNodeTypes(nodeTypes);
                    setSearchQuery(query);
                  }}
                  onLayoutChange={(layout) => {
                    console.log('Layout changed to:', layout);
                    // Layout changes would be implemented in Canvas component
                  }}
                  onTimeRangeChange={(days) => {
                    setTimeRange(days);
                  }}
                />
              </div>
            )}

            {/* Visualization */}
            <div className="relative">
              {viewMode === 'graph' ? (
                <>
                  <Canvas
                    graph={filteredGraph}
                    onNodeClick={setSelectedNode}
                    width={1200}
                    height={800}
                  />
                  <NodeDetailPanel
                    node={selectedNode}
                    onClose={() => setSelectedNode(null)}
                  />
                </>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <TimelineView
                    nodes={filteredGraph.nodes}
                    onNodeClick={(node) => setSelectedNode(node as D3Node)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Footer */}
        {graph && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Total Nodes</p>
              <p className="text-2xl font-bold text-gray-900">{graph.nodes.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Connections</p>
              <p className="text-2xl font-bold text-gray-900">{graph.edges.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Entries</p>
              <p className="text-2xl font-bold text-gray-900">
                {graph.nodes.filter(n => n.type === 'entry').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Emotions</p>
              <p className="text-2xl font-bold text-gray-900">
                {graph.nodes.filter(n => n.type === 'emotion').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Patterns</p>
              <p className="text-2xl font-bold text-gray-900">
                {graph.nodes.filter(n => n.type === 'pattern').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasPage;
