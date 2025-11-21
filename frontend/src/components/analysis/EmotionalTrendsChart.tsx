import { InsightData } from '../../types/analysis.types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, AlertCircle, Sparkles, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';

interface EmotionalTrendsChartProps {
  data: InsightData;
}

export default function EmotionalTrendsChart({ data }: EmotionalTrendsChartProps) {
  // Get all unique emotion names
  const emotionNames = Array.from(
    new Set(
      data.emotionalTrends.flatMap((day) => Object.keys(day.emotions))
    )
  ).slice(0, 5); // Limit to top 5 emotions for clarity

  // Colors for emotions
  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  // Calculate week-over-week changes
  const calculateTrend = () => {
    if (data.overallSentimentTrend.length < 14) return null;
    
    const lastWeek = data.overallSentimentTrend.slice(-7);
    const previousWeek = data.overallSentimentTrend.slice(-14, -7);
    
    const lastWeekAvg = lastWeek.reduce((sum, day) => sum + day.score, 0) / lastWeek.length;
    const previousWeekAvg = previousWeek.reduce((sum, day) => sum + day.score, 0) / previousWeek.length;
    
    const change = lastWeekAvg - previousWeekAvg;
    const percentChange = previousWeekAvg !== 0 ? (change / Math.abs(previousWeekAvg)) * 100 : 0;
    
    return {
      change,
      percentChange,
      lastWeekAvg,
      previousWeekAvg,
    };
  };

  const trend = calculateTrend();

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.change > 0.1) return <ArrowUp className="w-5 h-5 text-green-600" />;
    if (trend.change < -0.1) return <ArrowDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-600';
    if (trend.change > 0.1) return 'text-green-600';
    if (trend.change < -0.1) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendText = () => {
    if (!trend) return 'Not enough data';
    if (trend.change > 0.1) return 'Improving';
    if (trend.change < -0.1) return 'Declining';
    return 'Stable';
  };

  return (
    <div className="space-y-6">
      {/* Sentiment Trend */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Overall Sentiment Trend
          </h3>
          {trend && (
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${trend.change > 0.1 ? 'bg-green-100' : trend.change < -0.1 ? 'bg-red-100' : 'bg-gray-100'}`}>
                {getTrendIcon()}
                <span className={`text-sm font-semibold ${getTrendColor()}`}>
                  {getTrendText()}
                </span>
              </div>
              <span className={`text-xs ${getTrendColor()}`}>
                {trend.percentChange > 0 ? '+' : ''}{trend.percentChange.toFixed(1)}% vs last week
              </span>
            </div>
          )}
        </div>
        {data.overallSentimentTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.overallSentimentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis domain={[-1, 1]} tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value: any) => [value.toFixed(2), 'Sentiment']}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#6366f1" 
                strokeWidth={2}
                dot={{ fill: '#6366f1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">Not enough data yet</p>
        )}
      </div>

      {/* Emotion Trends */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Emotion Intensity Over Time
        </h3>
        {data.emotionalTrends.length > 0 && emotionNames.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.emotionalTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Legend />
              {emotionNames.map((emotion, idx) => (
                <Line
                  key={emotion}
                  type="monotone"
                  dataKey={`emotions.${emotion}`}
                  name={emotion}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[idx % colors.length] }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">Not enough data yet</p>
        )}
      </div>

      {/* Common Cognitive Distortions */}
      {data.mostCommonDistortions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Most Common Thinking Patterns
          </h3>
          <div className="space-y-3">
            {data.mostCommonDistortions.map((distortion, idx) => {
              const maxCount = Math.max(...data.mostCommonDistortions.map(d => d.count));
              const percentage = (distortion.count / maxCount) * 100;
              
              // Determine severity based on count and percentage
              const getSeverity = () => {
                if (distortion.count >= 5 || percentage >= 80) return 'high';
                if (distortion.count >= 3 || percentage >= 50) return 'medium';
                return 'low';
              };
              
              const severity = getSeverity();
              
              const getSeverityColor = () => {
                if (severity === 'high') return 'bg-red-500';
                if (severity === 'medium') return 'bg-amber-500';
                return 'bg-blue-500';
              };
              
              const getSeverityBadge = () => {
                if (severity === 'high') return 'bg-red-100 text-red-700 border-red-300';
                if (severity === 'medium') return 'bg-amber-100 text-amber-700 border-amber-300';
                return 'bg-blue-100 text-blue-700 border-blue-300';
              };
              
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">
                        {distortion.type.replace(/_/g, ' ')}
                      </span>
                      {severity === 'high' && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getSeverityBadge()}`}>
                          Needs Attention
                        </span>
                      )}
                    </div>
                    <span className="text-gray-600">{distortion.count}x</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getSeverityColor()}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Low frequency</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span>Medium frequency</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>High frequency (needs attention)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
