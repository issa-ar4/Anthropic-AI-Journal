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
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Insights</h1>
          <p className="text-gray-600 text-lg">AI-powered analysis of your mental patterns</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No insights yet
          </h3>
          <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
            Create journal entries and analyze them to see patterns and trends in your mental wellness journey
          </p>
          <a
            href="/journal"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all font-semibold text-lg"
          >
            Go to Journal
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Insights</h1>
        <p className="text-gray-600 text-lg">
          AI-powered analysis of your journal entries over the past 30 days
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Stats Cards */}
        <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Entries Analyzed</p>
              <p className="text-3xl font-bold text-gray-900">
                {insights?.emotionalTrends.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Patterns Detected</p>
              <p className="text-3xl font-bold text-gray-900">
                {patternsData?.patterns.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl group-hover:scale-110 transition-transform">
              <AlertCircle className="w-6 h-6 text-white" />
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
        <div className="mt-10 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <Brain className="w-6 h-6 text-white" />
            </div>
            Detected Patterns
          </h2>
          <PatternList patterns={patternsData.patterns} />
        </div>
      )}
    </div>
  );
}
