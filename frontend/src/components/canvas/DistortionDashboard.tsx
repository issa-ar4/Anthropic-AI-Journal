import React from 'react';
import { AlertTriangle, Lightbulb, FileText } from 'lucide-react';

interface Distortion {
  type: string;
  frequency: number;
  description: string;
  challenge: string;
  relatedEntries: string[];
  severity: 'low' | 'medium' | 'high';
}

interface DistortionDashboardProps {
  distortions: Distortion[];
  onEntryClick?: (entryId: string) => void;
}

export const DistortionDashboard: React.FC<DistortionDashboardProps> = ({ 
  distortions, 
  onEntryClick 
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-orange-500 bg-orange-50';
      case 'low': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (distortions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Cognitive Distortions Detected
        </h3>
        <p className="text-gray-600">
          Great news! Your journal entries show balanced thinking patterns.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-6">
          <AlertTriangle className="w-6 h-6 text-orange-500" />
          <h3 className="text-xl font-semibold text-gray-900">
            Your Thinking Patterns
          </h3>
        </div>

        <p className="text-gray-600 mb-6">
          These are cognitive distortions—automatic thinking patterns that can make situations 
          seem worse than they are. Recognizing them is the first step to changing them.
        </p>

        <div className="space-y-4">
          {distortions.map((distortion, index) => (
            <div
              key={distortion.type}
              className={`border-l-4 rounded-lg p-6 transition-all hover:shadow-md ${getSeverityColor(distortion.severity)}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl font-bold text-gray-400">
                      {index + 1}
                    </span>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {distortion.type}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityBadge(distortion.severity)}`}>
                      {distortion.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 italic">
                    "{distortion.description}"
                  </p>
                </div>
                <div className="text-right ml-4">
                  <span className="text-3xl font-bold text-gray-700">
                    {distortion.frequency}
                  </span>
                  <p className="text-xs text-gray-500">times</p>
                </div>
              </div>

              {/* Challenge Section */}
              <div className="bg-white rounded-lg p-4 mb-4 border border-indigo-200">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-indigo-900 mb-1">
                      How to Challenge This:
                    </p>
                    <p className="text-sm text-gray-700">
                      {distortion.challenge}
                    </p>
                  </div>
                </div>
              </div>

              {/* Related Entries */}
              {distortion.relatedEntries.length > 0 && (
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Appeared in {distortion.relatedEntries.length} journal {distortion.relatedEntries.length === 1 ? 'entry' : 'entries'}
                  </span>
                  {onEntryClick && (
                    <button
                      onClick={() => onEntryClick(distortion.relatedEntries[0])}
                      className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                    >
                      View example
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          💡 Key Insight
        </h4>
        <p className="text-gray-700 mb-4">
          Your most common thinking trap is <strong>{distortions[0]?.type}</strong>, 
          appearing <strong>{distortions[0]?.frequency} times</strong>. 
        </p>
        <p className="text-gray-700 mb-4">
          The good news? Simply becoming aware of these patterns is proven to reduce their impact. 
          Each time you notice one of these thoughts, you're building the skill to think more clearly.
        </p>
        <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-500">
          <p className="text-sm font-medium text-gray-900 mb-2">
            Next Step:
          </p>
          <p className="text-sm text-gray-700">
            For the next 24 hours, watch for <strong>{distortions[0]?.type}</strong>. 
            When you notice it, pause and ask yourself: "{distortions[0]?.challenge}"
          </p>
        </div>
      </div>
    </div>
  );
};
