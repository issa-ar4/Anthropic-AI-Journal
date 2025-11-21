import { InsightData } from '../../types/analysis.types';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface InsightsSummaryProps {
  data: InsightData;
}

export default function InsightsSummary({ data }: InsightsSummaryProps) {
  // Calculate key metrics
  const totalEntries = data.emotionalTrends.length;
  const avgSentiment = data.overallSentimentTrend.reduce((sum, day) => sum + day.score, 0) / data.overallSentimentTrend.length;
  const recentSentiment = data.overallSentimentTrend.slice(-7).reduce((sum, day) => sum + day.score, 0) / Math.min(7, data.overallSentimentTrend.length);
  const olderSentiment = data.overallSentimentTrend.slice(0, -7).reduce((sum, day) => sum + day.score, 0) / (data.overallSentimentTrend.length - 7);
  const sentimentTrend = recentSentiment - olderSentiment;

  // Get most common emotion
  const emotionCounts: { [key: string]: number } = {};
  data.emotionalTrends.forEach(day => {
    Object.entries(day.emotions).forEach(([emotion, intensity]) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + intensity;
    });
  });
  const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];

  // Get most common distortion
  const topDistortion = data.mostCommonDistortions[0];

  // Get sentiment description
  const getSentimentDescription = (score: number) => {
    if (score > 0.3) return 'predominantly positive';
    if (score > 0) return 'slightly positive';
    if (score > -0.3) return 'slightly negative';
    return 'predominantly negative';
  };

  const getTrendIcon = () => {
    if (sentimentTrend > 0.1) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (sentimentTrend < -0.1) return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getTrendText = () => {
    if (sentimentTrend > 0.1) return 'improving';
    if (sentimentTrend < -0.1) return 'declining';
    return 'stable';
  };

  const getTrendColor = () => {
    if (sentimentTrend > 0.1) return 'text-green-600';
    if (sentimentTrend < -0.1) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your Mental Wellness Summary</h2>
      </div>

      <div className="space-y-4 text-gray-800 leading-relaxed">
        <p className="text-lg">
          Over the past {totalEntries} days, your emotional state has been{' '}
          <span className="font-semibold text-purple-700">
            {getSentimentDescription(avgSentiment)}
          </span>
          {data.overallSentimentTrend.length > 7 && (
            <>
              {' '}and is currently{' '}
              <span className={`font-semibold flex items-center gap-1 inline-flex ${getTrendColor()}`}>
                {getTrendIcon()}
                {getTrendText()}
              </span>
            </>
          )}.
        </p>

        {topEmotion && (
          <p className="text-lg">
            Your most prominent emotion has been{' '}
            <span className="font-semibold text-blue-700 capitalize">{topEmotion[0]}</span>
            , appearing frequently throughout your journal entries.
          </p>
        )}

        {topDistortion && topDistortion.count > 2 && (
          <p className="text-lg">
            A pattern worth noting: you've shown signs of{' '}
            <span className="font-semibold text-amber-700 capitalize">
              {topDistortion.type.replace(/_/g, ' ')}
            </span>
            {' '}({topDistortion.count} times), which may be influencing how you perceive and respond to situations.
          </p>
        )}

        {data.topPatterns.length > 0 && (
          <p className="text-lg">
            I've identified{' '}
            <span className="font-semibold text-indigo-700">
              {data.topPatterns.length} recurring pattern{data.topPatterns.length !== 1 ? 's' : ''}
            </span>
            {' '}in your journaling. Understanding these patterns is the first step toward positive change.
          </p>
        )}

        <div className="mt-6 pt-6 border-t border-purple-200">
          <p className="text-base text-gray-700 italic">
            💡 <strong>Remember:</strong> Awareness is powerful. By recognizing these patterns, you're already taking meaningful steps toward better mental wellness.
          </p>
        </div>
      </div>
    </div>
  );
}
