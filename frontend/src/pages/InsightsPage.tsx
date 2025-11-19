import { useQuery } from '@tanstack/react-query';
import { analysisService } from '../services/analysisService';
import { Loader2, TrendingUp, Brain, AlertCircle } from 'lucide-react';
import EmotionalTrendsChart from '../components/analysis/EmotionalTrendsChart';
import PatternList from '../components/analysis/PatternList';

export default function InsightsPage() {
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['insights'],
    queryFn: () => analysisService.getInsights(30),
  });

  const { data: patternsData, isLoading: patternsLoading } = useQuery({
    queryKey: ['patterns'],
    queryFn: () => analysisService.getPatterns(),
  });

  const isLoading = insightsLoading || patternsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const hasData = insights && (
    insights.emotionalTrends.length > 0 ||
    insights.topPatterns.length > 0 ||
    insights.mostCommonDistortions.length > 0
  );

  if (!hasData) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Insights</h1>
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No insights yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create journal entries and analyze them to see patterns and trends
          </p>
          <a
            href="/journal"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Journal
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Insights</h1>
        <p className="text-gray-600">
          AI-powered analysis of your journal entries over the past 30 days
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Entries Analyzed</p>
              <p className="text-2xl font-bold text-gray-900">
                {insights?.emotionalTrends.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Patterns Detected</p>
              <p className="text-2xl font-bold text-gray-900">
                {patternsData?.patterns.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Common Patterns</p>
              <p className="text-2xl font-bold text-gray-900">
                {insights?.mostCommonDistortions.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emotional Trends */}
      {insights && <EmotionalTrendsChart data={insights} />}

      {/* Patterns */}
      {patternsData && patternsData.patterns.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            Detected Patterns
          </h2>
          <PatternList patterns={patternsData.patterns} />
        </div>
      )}
    </div>
  );
}
