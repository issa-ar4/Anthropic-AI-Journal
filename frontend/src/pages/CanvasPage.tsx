import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import canvasService from '../services/canvasService';
import Canvas from '../components/canvas/Canvas';
import NodeDetailPanel from '../components/canvas/NodeDetailPanel';
import CanvasControls from '../components/canvas/CanvasControls';
import TimelineView from '../components/canvas/TimelineView';
import { D3Node, CanvasGraph, NodeType } from '../types/canvas.types';
import { Loader2, Download, RefreshCw, BarChart3, Network } from 'lucide-react';

const CanvasPage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<D3Node | null>(null);
  const [filteredGraph, setFilteredGraph] = useState<CanvasGraph | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeTypes, setSelectedNodeTypes] = useState<NodeType[]>([]);
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
    } catch (error: any) {
      console.error('Failed to regenerate canvas:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to generate canvas';
      alert(errorMessage + '\n\nPlease create journal entries and analyze them first.');
    } finally {
      setIsGenerating(false);
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
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
          </div>
          <p className="text-lg text-gray-600 font-medium">Loading your cognitive canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Cognitive Canvas
          </h1>
          <p className="text-gray-600 text-lg">
            Interactive visualization of your journal entries, emotions, themes, and patterns
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-8 flex items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('graph')}
              className={`px-5 py-3 rounded-xl flex items-center gap-2 transition-all font-semibold ${
                viewMode === 'graph'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              <Network size={20} />
              Graph View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-5 py-3 rounded-xl flex items-center gap-2 transition-all font-semibold ${
                viewMode === 'timeline'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              <BarChart3 size={20} />
              Timeline View
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="px-5 py-3 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-purple-300 hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all font-semibold"
            >
              {isGenerating ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <RefreshCw size={20} />
              )}
              {isGenerating ? 'Generating...' : 'Regenerate'}
            </button>
            <button
              onClick={handleExport}
              className="px-5 py-3 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-blue-300 hover:scale-105 flex items-center gap-2 transition-all font-semibold"
            >
              <Download size={20} />
              Export
            </button>
          </div>
        </div>

        {/* Main Content */}
        {!graph || !filteredGraph ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-xl">
            <div className="max-w-2xl mx-auto px-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Network className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                No Canvas Available
              </h3>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Your cognitive canvas visualizes connections between your journal entries, emotions, themes, and patterns.
                {!canvasData?.graph && (
                  <span className="block mt-3 font-semibold text-purple-600">
                    Create journal entries and analyze them to generate your canvas.
                  </span>
                )}
              </p>
              <button
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center gap-2 transition-all font-semibold text-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Canvas...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Generate Canvas
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
            {/* Controls Sidebar */}
            {viewMode === 'graph' && (
              <div className="lg:sticky lg:top-4 lg:self-start">
                <CanvasControls
                  selectedNodeTypes={selectedNodeTypes}
                  selectedEdgeTypes={[]}
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
