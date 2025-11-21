import React from 'react';
import { CanvasGraph } from '@/types/canvas.types';
import { TrendingUp, AlertTriangle, Lightbulb, Heart, Brain } from 'lucide-react';

interface CanvasInsightsProps {
  graph: CanvasGraph;
}

const CanvasInsights: React.FC<CanvasInsightsProps> = ({ graph }) => {
  // Analyze the graph to extract insights
  const insights = React.useMemo(() => {
    const emotions = graph.nodes.filter(n => n.type === 'emotion');
    const distortions = graph.nodes.filter(n => n.type === 'distortion');
    const themes = graph.nodes.filter(n => n.type === 'theme');
    const patterns = graph.nodes.filter(n => n.type === 'pattern');

    // Most frequent emotion
    const topEmotion = emotions.sort((a, b) => 
      (b.metadata?.frequency || 0) - (a.metadata?.frequency || 0)
    )[0];

    // Most common distortion
    const topDistortion = distortions.sort((a, b) => 
      (b.metadata?.frequency || 0) - (a.metadata?.frequency || 0)
    )[0];

    // Dominant themes
    const topThemes = themes
      .sort((a, b) => (b.metadata?.frequency || 0) - (a.metadata?.frequency || 0))
      .slice(0, 3);

    return {
      topEmotion,
      topDistortion,
      topThemes,
      emotionCount: emotions.length,
      distortionCount: distortions.length,
      themeCount: themes.length,
      patternCount: patterns.length,
    };
  }, [graph]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Insights</h3>
      </div>

      {/* Top Emotion */}
      {insights.topEmotion && (
        <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-pink-600" />
            <h4 className="text-sm font-semibold text-gray-900">Top Emotion</h4>
          </div>
          <p className="text-lg font-bold text-pink-600">{insights.topEmotion.label}</p>
          <p className="text-xs text-gray-600 mt-1">
            Appeared {insights.topEmotion.metadata?.frequency || 1} times
          </p>
        </div>
      )}

      {/* Top Cognitive Distortion */}
      {insights.topDistortion && (
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <h4 className="text-sm font-semibold text-gray-900">Thinking Pattern</h4>
          </div>
          <p className="text-lg font-bold text-orange-600">{insights.topDistortion.label}</p>
          <p className="text-xs text-gray-600 mt-1">
            Detected {insights.topDistortion.metadata?.frequency || 1} times
          </p>
        </div>
      )}

      {/* Dominant Themes */}
      {insights.topThemes.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-semibold text-gray-900">Top Themes</h4>
          </div>
          <div className="space-y-1.5">
            {insights.topThemes.map((theme, idx) => (
              <div key={theme.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  {idx + 1}. {theme.label}
                </span>
                <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">
                  {theme.metadata?.frequency}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-gray-600" />
          <h4 className="text-sm font-semibold text-gray-900">Summary</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-600">Emotions</p>
            <p className="text-xl font-bold text-pink-600">{insights.emotionCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Distortions</p>
            <p className="text-xl font-bold text-orange-600">{insights.distortionCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Themes</p>
            <p className="text-xl font-bold text-blue-600">{insights.themeCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Patterns</p>
            <p className="text-xl font-bold text-purple-600">{insights.patternCount}</p>
          </div>
        </div>
      </div>


    </div>
  );
};

export default CanvasInsights;
