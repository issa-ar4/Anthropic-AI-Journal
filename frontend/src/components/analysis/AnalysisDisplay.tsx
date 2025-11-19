import { Analysis } from '../../types/analysis.types';
import { Brain, Heart, AlertTriangle, Link as LinkIcon } from 'lucide-react';

interface AnalysisDisplayProps {
  analysis: Analysis;
  cached?: boolean;
}

export default function AnalysisDisplay({ analysis, cached }: AnalysisDisplayProps) {
  return (
    <div className="mt-6 space-y-6 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          AI Analysis
        </h3>
        {cached && (
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
            Cached
          </span>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Emotions */}
      {analysis.emotions.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            Detected Emotions
          </h4>
          <div className="space-y-3">
            {analysis.emotions.map((emotion, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium capitalize">{emotion.name}</span>
                  <span className="text-gray-600">{emotion.intensity}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      emotion.category === 'positive'
                        ? 'bg-green-500'
                        : emotion.category === 'negative'
                        ? 'bg-red-500'
                        : 'bg-gray-400'
                    }`}
                    style={{ width: `${emotion.intensity}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Overall Sentiment:</span>
              <span className={`font-semibold capitalize ${
                analysis.sentiment.overall === 'positive' ? 'text-green-600' :
                analysis.sentiment.overall === 'negative' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {analysis.sentiment.overall}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Key Themes */}
      {analysis.keyThemes.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3">Key Themes</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.keyThemes.map((theme, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cognitive Distortions */}
      {analysis.cognitiveDistortions.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Cognitive Patterns to Consider
          </h4>
          <div className="space-y-4">
            {analysis.cognitiveDistortions.map((distortion, idx) => (
              <div key={idx} className="border-l-4 border-amber-400 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{distortion.type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    distortion.severity === 'high' ? 'bg-red-100 text-red-700' :
                    distortion.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {distortion.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{distortion.explanation}</p>
                <p className="text-sm text-green-700 italic">
                  💡 {distortion.suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Causal Links */}
      {analysis.causalLinks.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-blue-500" />
            Connections & Patterns
          </h4>
          <div className="space-y-3">
            {analysis.causalLinks.map((link, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-700">{link.cause}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium text-gray-700">{link.effect}</span>
                  </div>
                  <p className="text-gray-600 text-xs">{link.reasoning}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {Math.round(link.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
