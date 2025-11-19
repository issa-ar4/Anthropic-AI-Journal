import { InsightData } from '../../types/analysis.types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, AlertCircle, Sparkles } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Sentiment Trend */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Overall Sentiment Trend
        </h3>
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
              
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium capitalize">
                      {distortion.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-gray-600">{distortion.count}x</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
