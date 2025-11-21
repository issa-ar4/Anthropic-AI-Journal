import { TrendingUp, Clock, Calendar, CheckCircle } from 'lucide-react';

interface RecoveryMetrics {
  averageRecoveryDays: number;
  fastestRecoveryDays: number;
  slowestRecoveryDays: number;
  totalRecoveryEvents: number;
  improvementTrend: number; // Percentage change in recovery speed
}

interface RecoveryRateCardProps {
  data: RecoveryMetrics;
}

export default function RecoveryRateCard({ data }: RecoveryRateCardProps) {
  const {
    averageRecoveryDays,
    fastestRecoveryDays,
    slowestRecoveryDays,
    totalRecoveryEvents,
    improvementTrend,
  } = data;

  const getDaysText = (days: number) => {
    if (days < 1) {
      const hours = Math.round(days * 24);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    const roundedDays = Math.round(days * 10) / 10;
    return `${roundedDays} ${roundedDays === 1 ? 'day' : 'days'}`;
  };

  const getRecoveryMessage = () => {
    if (averageRecoveryDays < 1) return { text: 'Quick recovery', color: 'text-green-600', bg: 'bg-green-50' };
    if (averageRecoveryDays < 2) return { text: 'Good resilience', color: 'text-green-500', bg: 'bg-green-50' };
    if (averageRecoveryDays < 3) return { text: 'Moderate recovery', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (averageRecoveryDays < 5) return { text: 'Takes time', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { text: 'Slow recovery', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const recoveryMsg = getRecoveryMessage();

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          Recovery Rate
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          How quickly you bounce back from low points
        </p>
      </div>

      {totalRecoveryEvents > 0 ? (
        <>
          {/* Main Recovery Stat */}
          <div className={`${recoveryMsg.bg} p-6 rounded-xl border-2 ${recoveryMsg.color.replace('text-', 'border-')} mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Average Recovery Time</p>
                <p className={`text-4xl font-bold ${recoveryMsg.color}`}>
                  {getDaysText(averageRecoveryDays)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Clock className={`w-8 h-8 ${recoveryMsg.color}`} />
              </div>
            </div>
            <p className="text-sm text-gray-700">
              {recoveryMsg.text} • Based on {totalRecoveryEvents} recovery {totalRecoveryEvents === 1 ? 'event' : 'events'}
            </p>
          </div>

          {/* Recovery Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-xs font-semibold text-gray-700">Fastest Recovery</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {getDaysText(fastestRecoveryDays)}
              </p>
              <p className="text-xs text-gray-600 mt-1">Best performance</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <p className="text-xs font-semibold text-gray-700">Slowest Recovery</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {getDaysText(slowestRecoveryDays)}
              </p>
              <p className="text-xs text-gray-600 mt-1">Longest duration</p>
            </div>

            <div className={`bg-gradient-to-br ${improvementTrend > 0 ? 'from-blue-50 to-indigo-50' : 'from-gray-50 to-slate-50'} p-4 rounded-xl border ${improvementTrend > 0 ? 'border-blue-200' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className={`w-4 h-4 ${improvementTrend > 0 ? 'text-blue-600' : 'text-gray-600'}`} />
                <p className="text-xs font-semibold text-gray-700">Trend</p>
              </div>
              <p className={`text-2xl font-bold ${improvementTrend > 0 ? 'text-blue-600' : improvementTrend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {improvementTrend > 0 ? '+' : ''}{improvementTrend.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {improvementTrend > 0 ? 'Getting faster' : improvementTrend < 0 ? 'Getting slower' : 'Stable'}
              </p>
            </div>
          </div>

          {/* Contextual Messages */}
          <div className="space-y-3">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex gap-3">
                <div className="p-2 bg-blue-100 rounded-lg h-fit">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">What This Means</p>
                  <p className="text-xs text-gray-700">
                    When you hit a low point, it typically takes you <span className="font-bold">{getDaysText(averageRecoveryDays)}</span> to 
                    return to your baseline or above. This helps you know the storm will pass.
                  </p>
                </div>
              </div>
            </div>

            {improvementTrend > 10 && (
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <div className="flex gap-3">
                  <div className="p-2 bg-green-100 rounded-lg h-fit">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-900 mb-1">Great Progress!</p>
                    <p className="text-xs text-gray-700">
                      Your recovery time is improving by {improvementTrend.toFixed(0)}%. The journaling practice is working!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {averageRecoveryDays < 2 && (
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <div className="flex gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg h-fit">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-purple-900 mb-1">Strong Resilience</p>
                    <p className="text-xs text-gray-700">
                      You're demonstrating excellent emotional resilience with quick recovery times.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="font-medium mb-1">Not enough data yet</p>
          <p className="text-sm">
            Keep journaling to track your recovery patterns
          </p>
        </div>
      )}
    </div>
  );
}
