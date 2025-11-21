import { Calendar } from 'lucide-react';

interface DateRangeSelectorProps {
  selectedRange: number;
  onRangeChange: (days: number) => void;
}

const ranges = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: 'All Time', days: 365 },
];

export default function DateRangeSelector({ selectedRange, onRangeChange }: DateRangeSelectorProps) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow p-2 border border-gray-200">
      <Calendar className="w-4 h-4 text-gray-500 ml-2" />
      <div className="flex gap-1">
        {ranges.map((range) => (
          <button
            key={range.days}
            onClick={() => onRangeChange(range.days)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedRange === range.days
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}
