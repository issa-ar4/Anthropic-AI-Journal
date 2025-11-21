import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Heart, Info } from 'lucide-react';

interface EmotionRadarData {
  emotion: string;
  intensity: number;
  category: 'positive' | 'negative' | 'neutral';
}

interface EmotionalRadarChartProps {
  data: EmotionRadarData[];
}

export default function EmotionalRadarChart({ data }: EmotionalRadarChartProps) {
  // Take top 6 emotions by intensity
  const topEmotions = [...data]
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 6);

  const getEmotionalBalance = () => {
    const positive = topEmotions.filter(e => e.category === 'positive');
    const negative = topEmotions.filter(e => e.category === 'negative');
    const neutral = topEmotions.filter(e => e.category === 'neutral');
    
    const positiveIntensity = positive.reduce((sum, e) => sum + e.intensity, 0);
    const negativeIntensity = negative.reduce((sum, e) => sum + e.intensity, 0);
    
    return {
      positive: positive.length,
      negative: negative.length,
      neutral: neutral.length,
      balance: positiveIntensity - negativeIntensity,
    };
  };

  const balance = getEmotionalBalance();

  const getBalanceMessage = () => {
    if (balance.balance > 50) return { text: 'Predominantly positive', color: 'text-green-600', bg: 'bg-green-50' };
    if (balance.balance > 10) return { text: 'Slightly positive', color: 'text-green-500', bg: 'bg-green-50' };
    if (balance.balance > -10) return { text: 'Balanced', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (balance.balance > -50) return { text: 'Slightly negative', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { text: 'Predominantly negative', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const balanceMsg = getBalanceMessage();

  // Calculate emotional volatility (how spiky the shape is)
  const calculateVolatility = () => {
    if (topEmotions.length < 2) return 0;
    const avg = topEmotions.reduce((sum, e) => sum + e.intensity, 0) / topEmotions.length;
    const variance = topEmotions.reduce((sum, e) => sum + Math.pow(e.intensity - avg, 2), 0) / topEmotions.length;
    return Math.sqrt(variance);
  };

  const volatility = calculateVolatility();
  const isVolatile = volatility > 20;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
              <Heart className="w-5 h-5 text-white" />
            </div>
            Emotional Balance
          </h3>
          <p className="text-sm text-gray-600 mt-1">Your mental state at a glance</p>
        </div>
      </div>

      {topEmotions.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={450}>
            <RadarChart data={topEmotions} outerRadius="75%" margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis 
                dataKey="emotion" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as EmotionRadarData;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="font-semibold text-sm mb-1">{data.emotion}</p>
                        <p className="text-xs text-gray-600">
                          Intensity: <span className="font-bold">{data.intensity.toFixed(0)}</span>/100
                        </p>
                        <p className="text-xs text-gray-600 capitalize">
                          Type: <span className="font-bold">{data.category}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Radar
                name="Intensity"
                dataKey="intensity"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${balanceMsg.bg} p-4 rounded-xl border ${balanceMsg.color.replace('text-', 'border-')}`}>
              <div className="flex items-center gap-2 mb-1">
                <Heart className={`w-4 h-4 ${balanceMsg.color}`} />
                <p className="text-sm font-semibold text-gray-900">Overall Balance</p>
              </div>
              <p className={`text-lg font-bold ${balanceMsg.color}`}>
                {balanceMsg.text}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {balance.positive} positive, {balance.negative} negative, {balance.neutral} neutral
              </p>
            </div>

            <div className={`${isVolatile ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'} p-4 rounded-xl border`}>
              <div className="flex items-center gap-2 mb-1">
                <Info className={`w-4 h-4 ${isVolatile ? 'text-orange-600' : 'text-green-600'}`} />
                <p className="text-sm font-semibold text-gray-900">Emotional Pattern</p>
              </div>
              <p className={`text-lg font-bold ${isVolatile ? 'text-orange-600' : 'text-green-600'}`}>
                {isVolatile ? 'Volatile' : 'Stable'}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {isVolatile 
                  ? 'Wide variation in emotional intensity'
                  : 'Relatively consistent emotional state'
                }
              </p>
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-indigo-600" />
                <p className="text-sm font-semibold text-gray-900">Dominant Emotion</p>
              </div>
              <p className="text-lg font-bold text-indigo-600">
                {topEmotions[0].emotion}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Intensity: {topEmotions[0].intensity.toFixed(0)}/100
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-700">
                  <span className="font-semibold">Reading Your Chart:</span> A large, uniform shape indicates overwhelming emotions. 
                  A spiky shape shows emotional volatility. A balanced shape suggests emotional regulation.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Heart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No emotional data available yet</p>
        </div>
      )}
    </div>
  );
}
