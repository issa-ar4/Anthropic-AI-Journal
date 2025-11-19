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
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-900">Key Insights</h3>
      </div>

      {/* Top Emotion */}
      {insights.topEmotion && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Most Frequent Emotion</h4>
              <p className="text-2xl font-bold text-pink-600 mb-1">{insights.topEmotion.label}</p>
              <p className="text-sm text-gray-600">
                Appeared {insights.topEmotion.metadata?.frequency || 1} times in your entries
              </p>
              <p className="text-sm text-gray-700 mt-2">
                💡 This emotion shows up frequently. Consider exploring what triggers it.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Cognitive Distortion */}
      {insights.topDistortion && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Common Thinking Pattern</h4>
              <p className="text-xl font-bold text-orange-600 mb-1">{insights.topDistortion.label}</p>
              <p className="text-sm text-gray-600">
                Detected {insights.topDistortion.metadata?.frequency || 1} times
              </p>
              <p className="text-sm text-gray-700 mt-2">
                💡 This cognitive distortion appears often. Try challenging these thoughts with evidence.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dominant Themes */}
      {insights.topThemes.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Recurring Themes</h4>
              <div className="space-y-2">
                {insights.topThemes.map((theme, idx) => (
                  <div key={theme.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {idx + 1}. {theme.label}
                    </span>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                      {theme.metadata?.frequency}x
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-700 mt-3">
                💡 These themes dominate your thoughts. They might reveal what's most important to you.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">Your Pattern Summary</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600">Unique Emotions</p>
                <p className="text-2xl font-bold text-green-600">{insights.emotionCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Thinking Patterns</p>
                <p className="text-2xl font-bold text-orange-600">{insights.distortionCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Recurring Themes</p>
                <p className="text-2xl font-bold text-blue-600">{insights.themeCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Identified Patterns</p>
                <p className="text-2xl font-bold text-purple-600">{insights.patternCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">🎯 What to Do Next</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">•</span>
            <span><strong>Click on any node</strong> to see its connections and related entries</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">•</span>
            <span><strong>Filter by type</strong> (left panel) to focus on emotions, themes, or patterns</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">•</span>
            <span><strong>Look for clusters</strong> - nodes close together are frequently connected</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">•</span>
            <span><strong>Review your top distortion</strong> and practice reframing those thoughts</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CanvasInsights;
