import { useMemo } from 'react';
import { Clock, Calendar } from 'lucide-react';

interface TriggerTimingData {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  hourOfDay: number; // 0-23
  count: number;
  avgSentiment: number;
}

interface TriggerTimingHeatmapProps {
  data: TriggerTimingData[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = ['12AM', '3AM', '6AM', '9AM', '12PM', '3PM', '6PM', '9PM'];

export default function TriggerTimingHeatmap({ data }: TriggerTimingHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Create a 7x8 grid (7 days, 8 time blocks of 3 hours each)
    const grid: { day: number; timeBlock: number; count: number; avgSentiment: number }[][] = [];
    
    for (let day = 0; day < 7; day++) {
      grid[day] = [];
      for (let block = 0; block < 8; block++) {
        const startHour = block * 3;
        const endHour = startHour + 3;
        
        // Get all entries for this day and time block
        const entries = data.filter(
          d => d.dayOfWeek === day && d.hourOfDay >= startHour && d.hourOfDay < endHour
        );
        
        const count = entries.reduce((sum, e) => sum + e.count, 0);
        const avgSentiment = count > 0
          ? entries.reduce((sum, e) => sum + e.avgSentiment * e.count, 0) / count
          : 0;
        
        grid[day][block] = { day, timeBlock: block, count, avgSentiment };
      }
    }
    
    return grid;
  }, [data]);

  const getColor = (avgSentiment: number, count: number) => {
    if (count === 0) return 'bg-gray-50';
    
    // More negative = more red/orange (triggers)
    if (avgSentiment < -0.5) return 'bg-red-500';
    if (avgSentiment < -0.3) return 'bg-red-400';
    if (avgSentiment < -0.1) return 'bg-orange-400';
    if (avgSentiment < 0.1) return 'bg-yellow-300';
    if (avgSentiment < 0.3) return 'bg-green-300';
    return 'bg-green-400';
  };

  const findPeakTriggerTime = () => {
    let worst = { day: 0, block: 0, sentiment: 1 };
    
    heatmapData.forEach((dayData, day) => {
      dayData.forEach((blockData, block) => {
        if (blockData.count > 0 && blockData.avgSentiment < worst.sentiment) {
          worst = { day, block, sentiment: blockData.avgSentiment };
        }
      });
    });
    
    if (worst.sentiment < 1) {
      return {
        day: DAYS[worst.day],
        time: HOURS[worst.block],
        sentiment: worst.sentiment,
      };
    }
    
    return null;
  };

  const peakTrigger = findPeakTriggerTime();

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
              <Clock className="w-5 h-5 text-white" />
            </div>
            Trigger Timing Pattern
          </h3>
          <p className="text-sm text-gray-600 mt-1">When do struggles typically occur?</p>
        </div>
        {peakTrigger && (
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Peak Difficulty</p>
            <p className="text-sm font-bold text-red-600">
              {peakTrigger.day}s at {peakTrigger.time}
            </p>
          </div>
        )}
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="grid grid-cols-9 gap-2">
          {/* Header row */}
          <div className="text-xs font-medium text-gray-500 flex items-center"></div>
          {HOURS.map((hour) => (
            <div key={hour} className="text-xs font-medium text-gray-500 text-center">
              {hour}
            </div>
          ))}

          {/* Data rows */}
          {heatmapData.map((dayData, dayIdx) => (
            <>
              <div key={`day-${dayIdx}`} className="text-xs font-medium text-gray-500 flex items-center pr-2">
                {DAYS[dayIdx]}
              </div>
              {dayData.map((cell, blockIdx) => (
                <div
                  key={`${dayIdx}-${blockIdx}`}
                  className={`aspect-square rounded-lg ${getColor(cell.avgSentiment, cell.count)} flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg cursor-pointer group relative`}
                >
                  {cell.count > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                        <p className="font-bold mb-1">{DAYS[dayIdx]} at {HOURS[blockIdx]}</p>
                        <p><span className="font-semibold">Entries:</span> {cell.count}</p>
                        <p><span className="font-semibold">Avg Sentiment:</span> {cell.avgSentiment.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-semibold">Color by Sentiment:</span>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded bg-red-500"></div>
              <span className="text-xs text-gray-500">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded bg-yellow-300"></div>
              <span className="text-xs text-gray-500">Neutral</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded bg-green-400"></div>
              <span className="text-xs text-gray-500">High</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-gray-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
            <span className="font-semibold">Tip:</span> Hover over any cell to see entry count and average sentiment
          </div>
          {peakTrigger && (
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Prepare for {peakTrigger.day}s around {peakTrigger.time}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
