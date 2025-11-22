import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, TrendingDown } from 'lucide-react';

interface DistortionImpact {
  type: string;
  count: number;
  avgSentiment: number;
  severity: number; // Calculated as combination of frequency and sentiment impact
}

interface DistortionImpactChartProps {
  data: DistortionImpact[];
}

export default function DistortionImpactChart({ data }: DistortionImpactChartProps) {
  // Sort by average sentiment (most negative first), take top 5, and convert to positive values for display
  const sortedData = [...data]
    .sort((a, b) => a.avgSentiment - b.avgSentiment)
    .slice(0, 5) // Only take top 5 most impactful distortions
    .map(item => ({
      ...item,
      displayValue: Math.abs(item.avgSentiment) // Convert to positive for bar display
    }));

  const getBarColor = (sentiment: number) => {
    if (sentiment < -0.6) return '#dc2626'; // red-600
    if (sentiment < -0.4) return '#ea580c'; // orange-600
    if (sentiment < -0.2) return '#f59e0b'; // amber-500
    if (sentiment < 0) return '#fbbf24'; // amber-400
    return '#10b981'; // green-500
  };

  const getSeverityLabel = (sentiment: number) => {
    if (sentiment < -0.6) return 'Severe';
    if (sentiment < -0.4) return 'High';
    if (sentiment < -0.2) return 'Moderate';
    return 'Low';
  };

  const mostImpactful = sortedData[0];

  // Custom tick renderer that wraps text to multiple lines using tspan
  const CustomYAxisTick = ({ x, y, payload }: any) => {
    const label = payload.value;
    const maxCharsPerLine = 25; // Increased for wider axis
    const words = label.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach((word: string) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
    
    // Allow up to 3 lines for full text display
    const displayLines = lines.slice(0, 3);
    const lineHeight = 14;
    const yOffset = -((displayLines.length - 1) * lineHeight) / 2;
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={-10}
          y={0}
          textAnchor="end"
          fill="#4b5563"
          fontSize="12"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {displayLines.map((line, index) => (
            <tspan
              key={index}
              x={-10}
              dy={index === 0 ? yOffset : lineHeight}
            >
              {line}
            </tspan>
          ))}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6 px-8 pt-8">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            Cognitive Distortion Impact
          </h3>
          <p className="text-sm text-gray-600 mt-1">Top 5 patterns that hurt you the most</p>
        </div>
        {mostImpactful && (
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Highest Impact</p>
            <p className="text-sm font-bold text-red-600">
              {mostImpactful.type}
            </p>
            <p className="text-xs text-gray-500">
              {mostImpactful.avgSentiment.toFixed(2)} avg sentiment
            </p>
          </div>
        )}
      </div>

      {sortedData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 'dataMax']} />
              <YAxis 
                dataKey="type" 
                type="category"
                tick={<CustomYAxisTick />}
                width={280}
                interval={0}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DistortionImpact;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="font-semibold text-sm mb-1">{data.type}</p>
                        <p className="text-xs text-gray-600">
                          Avg Sentiment: <span className="font-bold text-red-600">{data.avgSentiment.toFixed(2)}</span>
                        </p>
                        <p className="text-xs text-gray-600">
                          Found in: <span className="font-bold">{data.count}</span> entries
                        </p>
                        <p className="text-xs text-gray-600">
                          Severity: <span className="font-bold">{getSeverityLabel(data.avgSentiment)}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="displayValue" radius={[0, 4, 4, 0]}>
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.avgSentiment)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Color Legend */}
          <div className="mt-4 px-8">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-3">How to interpret:</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626' }}></div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">Severe</p>
                    <p className="text-[10px] text-gray-500">≤ -0.6</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ea580c' }}></div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">High</p>
                    <p className="text-[10px] text-gray-500">-0.6 to -0.4</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">Moderate</p>
                    <p className="text-[10px] text-gray-500">-0.4 to -0.2</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fbbf24' }}></div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">Low</p>
                    <p className="text-[10px] text-gray-500">-0.2 to 0</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">Positive</p>
                    <p className="text-[10px] text-gray-500">≥ 0</p>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-gray-600 mt-3 leading-relaxed">
                <span className="font-semibold">Bar length</span> shows the negative impact on your emotional state. 
                <span className="font-semibold"> Colors</span> indicate severity based on average sentiment scores across entries. 
                Longer bars with darker colors require more attention.
              </p>
            </div>
          </div>

          <div className="mt-6 px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-xl border border-red-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Priority Focus</p>
                  <p className="text-xs text-gray-600">
                    Work on <span className="font-bold text-red-600">{mostImpactful.type}</span> - 
                    it appears in {mostImpactful.count} entries with an average sentiment 
                    of {mostImpactful.avgSentiment.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Total Patterns</p>
                  <p className="text-xs text-gray-600">
                    Showing top 5 of {data.length} different cognitive distortion types 
                    detected across your entries
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No cognitive distortions detected yet</p>
        </div>
      )}
    </div>
  );
}
