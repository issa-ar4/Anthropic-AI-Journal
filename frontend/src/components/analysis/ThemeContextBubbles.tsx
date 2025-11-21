import { useMemo } from 'react';
import { Lightbulb, Zap } from 'lucide-react';

interface ThemeBubble {
  theme: string;
  count: number;
  avgSentiment: number;
}

interface ThemeContextBubblesProps {
  data: ThemeBubble[];
}

export default function ThemeContextBubbles({ data }: ThemeContextBubblesProps) {
  const { positive, negative } = useMemo(() => {
    const sorted = [...data].sort((a, b) => Math.abs(b.avgSentiment) - Math.abs(a.avgSentiment));
    
    return {
      positive: sorted.filter(t => t.avgSentiment > 0.1).slice(0, 8),
      negative: sorted.filter(t => t.avgSentiment < -0.1).slice(0, 8),
    };
  }, [data]);

  const getSize = (count: number, maxCount: number) => {
    const minSize = 60;
    const maxSize = 140;
    const ratio = count / maxCount;
    return minSize + (maxSize - minSize) * ratio;
  };

  const maxPositiveCount = Math.max(...positive.map(t => t.count), 1);
  const maxNegativeCount = Math.max(...negative.map(t => t.count), 1);

  const getOpacity = (sentiment: number) => {
    const intensity = Math.abs(sentiment);
    return 0.4 + intensity * 0.6; // Range from 0.4 to 1.0
  };

  const renderBubbleCluster = (
    themes: ThemeBubble[],
    maxCount: number,
    color: string
  ) => {
    if (themes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
          <p className="text-sm">No themes detected</p>
        </div>
      );
    }

    // Split text into multiple lines for better readability
    const splitTextForBubble = (text: string, bubbleSize: number) => {
      const words = text.split(' ');
      const maxCharsPerLine = Math.floor(bubbleSize / 7); // Adjusted for better fit
      const lines: string[] = [];
      let currentLine = '';
      
      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= maxCharsPerLine) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });
      if (currentLine) lines.push(currentLine);
      
      // Allow up to 4 lines for full text display
      return lines.slice(0, 4);
    };

    return (
      <div className="relative min-h-[400px] flex flex-wrap items-center justify-center p-8 gap-4" style={{ height: 'auto' }}>
        {themes.map((theme, idx) => {
          const size = getSize(theme.count, maxCount);
          const opacity = getOpacity(theme.avgSentiment);
          const collisionPadding = 10; // Extra space to prevent overlap
          const textLines = splitTextForBubble(theme.theme, size);
          
          return (
            <div
              key={`${theme.theme}-${idx}`}
              className="flex-shrink-0 transition-all hover:scale-110 hover:z-10 cursor-pointer group"
              style={{
                width: size + collisionPadding,
                height: size + collisionPadding,
                margin: '4px',
              }}
            >
              <div
                className={`w-full h-full rounded-full flex items-center justify-center text-white font-semibold shadow-lg border-2 ${color}`}
                style={{ opacity, overflow: 'visible' }}
              >
                <div 
                  className="text-center px-3"
                  style={{ 
                    fontSize: '11px',
                    lineHeight: '1.3',
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    overflow: 'visible',
                    maxWidth: '90%'
                  }}
                >
                  {textLines.map((line, i) => (
                    <div key={i} style={{ marginBottom: i < textLines.length - 1 ? '2px' : '0' }}>{line}</div>
                  ))}
                </div>
              </div>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:block z-20">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                  <p className="font-bold mb-1">{theme.theme}</p>
                  <p>Count: {theme.count}</p>
                  <p>Sentiment: {theme.avgSentiment.toFixed(2)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          What Drains vs. Fuels You
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Themes connected to your emotional state (bubble size = frequency)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Negative Themes */}
        <div className="border-2 border-red-200 rounded-xl bg-gradient-to-br from-red-50 to-orange-50">
          <div className="p-4 border-b border-red-200 bg-white/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-100 rounded-lg">
                <Zap className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">What Drains You</h4>
                <p className="text-xs text-gray-600">
                  {negative.length} themes with negative sentiment
                </p>
              </div>
            </div>
          </div>
          {renderBubbleCluster(
            negative,
            maxNegativeCount,
            'border-red-300 bg-gradient-to-br from-red-500 to-orange-500'
          )}
        </div>

        {/* Positive Themes */}
        <div className="border-2 border-green-200 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="p-4 border-b border-green-200 bg-white/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <Lightbulb className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">What Fuels You</h4>
                <p className="text-xs text-gray-600">
                  {positive.length} themes with positive sentiment
                </p>
              </div>
            </div>
          </div>
          {renderBubbleCluster(
            positive,
            maxPositiveCount,
            'border-green-300 bg-gradient-to-br from-green-500 to-emerald-500'
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {negative.length > 0 && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <p className="text-sm font-semibold text-gray-900 mb-1">Top Energy Drain</p>
            <p className="text-lg font-bold text-red-600">{negative[0].theme}</p>
            <p className="text-xs text-gray-600 mt-1">
              Appears {negative[0].count} times • Sentiment: {negative[0].avgSentiment.toFixed(2)}
            </p>
          </div>
        )}
        {positive.length > 0 && (
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <p className="text-sm font-semibold text-gray-900 mb-1">Top Energy Source</p>
            <p className="text-lg font-bold text-green-600">{positive[0].theme}</p>
            <p className="text-xs text-gray-600 mt-1">
              Appears {positive[0].count} times • Sentiment: {positive[0].avgSentiment.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <p className="text-xs text-gray-700">
          <span className="font-semibold">Pro Tip:</span> Notice the patterns? Try to increase activities 
          related to green bubbles and develop coping strategies for red bubble triggers.
        </p>
      </div>
    </div>
  );
}
