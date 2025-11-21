import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import canvasService from '../services/canvasService';
import Canvas from '../components/canvas/Canvas';
import NodeDetailPanel from '../components/canvas/NodeDetailPanel';
import CanvasControls from '../components/canvas/CanvasControls';
import CanvasInsights from '../components/canvas/CanvasInsights';
import CanvasGuide from '../components/canvas/CanvasGuide';
import { EmotionTimeline } from '../components/canvas/EmotionTimeline';
import { RootCauseTree } from '../components/canvas/RootCauseTree';
import { DistortionDashboard } from '../components/canvas/DistortionDashboard';
import { D3Node, CanvasGraph, NodeType } from '../types/canvas.types';
import { Loader2, RefreshCw, HelpCircle, Sparkles, TrendingUp, GitBranch, AlertTriangle, Network } from 'lucide-react';

type ViewMode = 'timeline' | 'tree' | 'dashboard' | 'advanced';

const CanvasPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [selectedNode, setSelectedNode] = useState<D3Node | null>(null);
  const [filteredGraph, setFilteredGraph] = useState<CanvasGraph | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeTypes, setSelectedNodeTypes] = useState<NodeType[]>([]);
  const [timeRange, setTimeRange] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Load timeline data
  const {
    data: timelineData,
    isLoading: timelineLoading,
  } = useQuery({
    queryKey: ['canvas-timeline', timeRange],
    queryFn: () => canvasService.getTimeline(timeRange),
    enabled: viewMode === 'timeline',
  });

  // Load tree data
  const {
    data: treeData,
    isLoading: treeLoading,
  } = useQuery({
    queryKey: ['canvas-tree'],
    queryFn: () => canvasService.getTree(),
    enabled: viewMode === 'tree',
  });

  // Load dashboard data
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
  } = useQuery({
    queryKey: ['canvas-dashboard'],
    queryFn: () => canvasService.getDashboard(),
    enabled: viewMode === 'dashboard',
  });

  // Load canvas data (for advanced view)
  const {
    data: canvasData,
    isLoading: canvasLoading,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: ['canvas'],
    queryFn: () => canvasService.loadCanvas(),
    enabled: viewMode === 'advanced',
    retry: 1,
  });

  const graph = canvasData?.graph;
  const isLoading = viewMode === 'timeline' ? timelineLoading : 
                    viewMode === 'tree' ? treeLoading :
                    viewMode === 'dashboard' ? dashboardLoading : canvasLoading;

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

  // Generate actionable analysis from the graph data
  const generateAnalysis = (graphData: CanvasGraph): string => {
    const emotions = graphData.nodes.filter(n => n.type === 'emotion');
    const distortions = graphData.nodes.filter(n => n.type === 'distortion');
    const themes = graphData.nodes.filter(n => n.type === 'theme');
    const patterns = graphData.nodes.filter(n => n.type === 'pattern');
    
    // Find top emotion
    const topEmotion = emotions.sort((a, b) => 
      ((b.metadata?.frequency || 0) as number) - ((a.metadata?.frequency || 0) as number)
    )[0];
    
    // Find top distortion
    const topDistortion = distortions.sort((a, b) => 
      ((b.metadata?.frequency || 0) as number) - ((a.metadata?.frequency || 0) as number)
    )[0];
    
    // Find top theme
    const topTheme = themes.sort((a, b) => 
      ((b.metadata?.frequency || 0) as number) - ((a.metadata?.frequency || 0) as number)
    )[0];

    // Build analysis text
    let analysis = '';
    
    if (topEmotion && topDistortion && topTheme) {
      analysis = `Your journal reveals that "${topEmotion.label}" is your most frequent emotion, often connected to thoughts about "${topTheme.label}". `;
      analysis += `You frequently experience "${topDistortion.label}", which may be distorting how you perceive these situations. `;
      analysis += `Action Steps: (1) When you notice ${topEmotion.label.toLowerCase()}, pause and identify if ${topDistortion.label.toLowerCase()} is present. `;
      analysis += `(2) Challenge this thought pattern by asking "What evidence supports or contradicts this?" `;
      analysis += `(3) Journal about ${topTheme.label.toLowerCase()} using more balanced, evidence-based language. `;
      analysis += `(4) Practice mindfulness when ${topEmotion.label.toLowerCase()} arises to create space between feeling and reaction.`;
    } else if (topEmotion) {
      analysis = `Your primary emotional pattern centers around "${topEmotion.label}". `;
      analysis += `Action Steps: (1) Track what triggers this emotion throughout your day. `;
      analysis += `(2) Develop coping strategies specific to managing ${topEmotion.label.toLowerCase()}. `;
      analysis += `(3) Consider reaching out for support when this emotion feels overwhelming.`;
    } else {
      analysis = `Your canvas is building up. Continue journaling regularly to reveal deeper patterns. `;
      analysis += `Action Steps: (1) Write at least 3-5 entries per week. (2) Be honest about your emotions. `;
      analysis += `(3) Use the "Analyze" button on each entry to extract insights.`;
    }
    
    return analysis;
  };

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
      let errorMessage = error?.response?.data?.error || error?.message || 'Failed to generate canvas';
      
      // Provide specific guidance based on error
      if (errorMessage.includes('Not enough data') || errorMessage.includes('no data available')) {
        errorMessage = '❌ Cannot Generate Canvas\n\n' +
          '📝 Requirements:\n' +
          '• At least 3-5 journal entries\n' +
          '• Entries must be analyzed (use "Analyze" button on each entry)\n\n' +
          '💡 Tips:\n' +
          '• Write journal entries about your thoughts and feelings\n' +
          '• Use the Journal page to create new entries\n' +
          '• Click "Analyze" on each entry to generate insights\n' +
          '• Root cause analysis sessions also contribute to the canvas';
      }
      
      alert(errorMessage);
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
            Your most important insights organized into 5 columns. Each column shows the top 5 items based on frequency, connections, and recency.
          </p>
        </div>

        {/* View Tabs */}
        <div className="mb-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                viewMode === 'timeline'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <TrendingUp size={18} />
              Timeline
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                viewMode === 'dashboard'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <AlertTriangle size={18} />
              Thinking Patterns
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                viewMode === 'tree'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <GitBranch size={18} />
              Root Cause Flow
            </button>
            <button
              onClick={() => setViewMode('advanced')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                viewMode === 'advanced'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Network size={18} />
              Advanced View
            </button>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {viewMode === 'timeline' && 'See how your emotions change over time'}
              {viewMode === 'dashboard' && 'Understand your cognitive distortions'}
              {viewMode === 'tree' && 'Explore how emotions connect to patterns'}
              {viewMode === 'advanced' && 'Interactive network visualization'}
            </p>
            <button
              onClick={() => setShowGuide(true)}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <HelpCircle size={16} />
              Help
            </button>
          </div>
        </div>

        {/* Main Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : viewMode === 'timeline' && timelineData?.timeline ? (
          <EmotionTimeline 
            data={timelineData.timeline}
            onEmotionClick={(emotion) => console.log('Selected emotion:', emotion)}
          />
        ) : viewMode === 'dashboard' && dashboardData?.distortions ? (
          <DistortionDashboard 
            distortions={dashboardData.distortions}
            onEntryClick={(entryId) => window.location.href = `/journal`}
          />
        ) : viewMode === 'tree' && treeData?.tree ? (
          <RootCauseTree 
            data={treeData.tree}
            onNodeClick={(type, value) => console.log('Clicked:', type, value)}
          />
        ) : viewMode === 'advanced' && (!graph || !filteredGraph) ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-xl">
            <div className="max-w-2xl mx-auto px-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Sparkles className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {loadError ? 'Canvas Generation Failed' : 'No Canvas Available'}
              </h3>
              
              {loadError ? (
                <div className="text-left bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                  <p className="text-red-800 font-semibold mb-2">⚠️ Error Loading Canvas</p>
                  <p className="text-red-700 text-sm mb-4">
                    {(loadError as any)?.message || 'An unexpected error occurred'}
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-red-100">
                    <p className="text-gray-800 font-semibold mb-2">📋 Requirements:</p>
                    <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
                      <li>Create at least 3-5 journal entries</li>
                      <li>Analyze each entry (click "Analyze" button)</li>
                      <li>Wait for analysis to complete before generating canvas</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-left bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                  <p className="text-blue-800 font-semibold mb-3">💡 Getting Started</p>
                  <div className="text-blue-700 text-sm space-y-2">
                    <p>The cognitive canvas visualizes connections between your:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Journal entries</li>
                      <li>Emotional patterns</li>
                      <li>Recurring themes</li>
                      <li>Cognitive distortions</li>
                      <li>Root cause insights</li>
                    </ul>
                  </div>
                  <div className="mt-4 bg-white rounded-lg p-4 border border-blue-100">
                    <p className="text-gray-800 font-semibold mb-2">📋 To generate your canvas:</p>
                    <ol className="text-gray-700 text-sm space-y-1 list-decimal list-inside">
                      <li>Write 3-5 journal entries about your thoughts</li>
                      <li>Analyze each entry using the "Analyze" button</li>
                      <li>Optional: Complete a root cause analysis session</li>
                      <li>Return here and click "Generate Canvas"</li>
                    </ol>
                  </div>
                </div>
              )}
              
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
                    {loadError ? 'Retry Generation' : 'Generate Canvas'}
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Controls Sidebar */}
            <div className="w-full lg:w-64 flex-shrink-0">
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
                }}
                onTimeRangeChange={(days) => {
                  setTimeRange(days);
                }}
              />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Visualization */}
              <div className="relative overflow-x-auto">
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
              </div>

              {/* Analysis Section */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🧠</span>
                  What This Means & What To Do
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 leading-relaxed">
                    {generateAnalysis(graph)}
                  </p>
                </div>
              </div>
            </div>

            {/* Insights Sidebar */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="lg:sticky lg:top-4">
                <CanvasInsights graph={graph} />
              </div>
            </div>
          </div>
        )}


      </div>

      {/* Guide Modal */}
      {showGuide && <CanvasGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default CanvasPage;
