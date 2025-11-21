import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import analysisService from '@/services/analysisService';
import entryService from '@/services/entryService';

interface AnalyzeAllModalProps {
  onClose: () => void;
  onComplete: () => void;
}

type ModalState = 'confirm' | 'analyzing' | 'complete' | 'error';

export const AnalyzeAllModal: React.FC<AnalyzeAllModalProps> = ({ onClose, onComplete }) => {
  const [state, setState] = useState<ModalState>('confirm');
  const [unanalyzedCount, setUnanalyzedCount] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [totalToAnalyze, setTotalToAnalyze] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [unanalyzedEntries, setUnanalyzedEntries] = useState<any[]>([]);

  useEffect(() => {
    loadUnanalyzedCount();
  }, []);

  const loadUnanalyzedCount = async () => {
    try {
      const response = await entryService.getUnanalyzedEntries();
      setUnanalyzedCount(response.count);
      setUnanalyzedEntries(response.entries);
    } catch (err: any) {
      console.error('Failed to load unanalyzed entries:', err);
      setError('Failed to load entries. Please try again.');
    }
  };

  const handleConfirm = async () => {
    if (unanalyzedCount === 0) {
      setState('complete');
      return;
    }

    setState('analyzing');
    setTotalToAnalyze(unanalyzedCount);
    setCurrentIndex(0);

    try {
      // Analyze entries one by one
      for (let i = 0; i < unanalyzedEntries.length; i++) {
        const entry = unanalyzedEntries[i];
        setCurrentIndex(i + 1);
        
        try {
          await analysisService.analyzeEntry(entry.id);
        } catch (err) {
          console.error(`Failed to analyze entry ${entry.id}:`, err);
          // Continue with next entry even if one fails
        }
      }

      setState('complete');
      onComplete();
    } catch (err: any) {
      console.error('Bulk analysis error:', err);
      setError(err.message || 'Failed to complete analysis');
      setState('error');
    }
  };

  const handleClose = () => {
    if (state === 'analyzing') {
      const confirmed = window.confirm(
        'Analysis is in progress. Are you sure you want to close? Progress will be lost.'
      );
      if (!confirmed) return;
    }
    onClose();
  };

  const progress = totalToAnalyze > 0 ? (currentIndex / totalToAnalyze) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Analyze All Entries</h2>
          </div>
          {state !== 'analyzing' && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {state === 'confirm' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      {unanalyzedCount === 0 ? 'All entries analyzed!' : `${unanalyzedCount} entries need analysis`}
                    </p>
                    <p className="text-sm text-blue-700">
                      {unanalyzedCount === 0
                        ? 'All your journal entries have already been analyzed. You can view insights in the Canvas and Insights pages.'
                        : `This will analyze ${unanalyzedCount} journal ${unanalyzedCount === 1 ? 'entry' : 'entries'} that haven't been analyzed yet. This process may take a few minutes.`}
                    </p>
                  </div>
                </div>
              </div>

              {unanalyzedCount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⏱️ Estimated time:</strong> ~{Math.ceil(unanalyzedCount * 5 / 60)} minute{Math.ceil(unanalyzedCount * 5 / 60) === 1 ? '' : 's'}
                  </p>
                  <p className="text-sm text-yellow-800 mt-1">
                    Please keep this window open during the analysis.
                  </p>
                </div>
              )}

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={unanalyzedCount === 0}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {unanalyzedCount === 0 ? 'Close' : 'Start Analysis'}
                </button>
              </div>
            </div>
          )}

          {state === 'analyzing' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full mb-4">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analyzing Your Entries...
                </h3>
                <p className="text-sm text-gray-600">
                  Processing entry {currentIndex} of {totalToAnalyze}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800 text-center">
                  🧠 AI is analyzing emotions, patterns, and insights from your journal entries...
                </p>
              </div>

              <p className="text-xs text-gray-500 text-center">
                This may take a few minutes. Please don't close this window.
              </p>
            </div>
          )}

          {state === 'complete' && (
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Analysis Complete!
              </h3>
              <p className="text-gray-600">
                {totalToAnalyze === 0
                  ? 'All your entries were already analyzed.'
                  : `Successfully analyzed ${totalToAnalyze} journal ${totalToAnalyze === 1 ? 'entry' : 'entries'}.`}
              </p>

              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  📊 What's Next?
                </p>
                <p className="text-sm text-gray-700">
                  Visit the <strong>Canvas</strong> and <strong>Insights</strong> pages to explore your emotional patterns, 
                  cognitive distortions, and discover actionable insights from your journal.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all mt-4"
              >
                Done
              </button>
            </div>
          )}

          {state === 'error' && (
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-2">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Analysis Error
              </h3>
              <p className="text-gray-600">
                {error || 'An error occurred during analysis'}
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  Some entries may have been analyzed successfully. 
                  You can try again or analyze individual entries from the journal list.
                </p>
              </div>

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setState('confirm');
                    setError(null);
                    loadUnanalyzedCount();
                  }}
                  className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
