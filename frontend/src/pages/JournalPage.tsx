import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, Loader2, Sparkles } from 'lucide-react';
import { entryService } from '../services/entryService';
import { analysisService } from '../services/analysisService';
import { format } from 'date-fns';
import AnalysisDisplay from '../components/analysis/AnalysisDisplay';
import type { Analysis } from '../types/analysis.types';

export default function JournalPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<{ [key: string]: Analysis }>({});
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['entries'],
    queryFn: () => entryService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: () => entryService.create(title || undefined, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setTitle('');
      setContent('');
      setIsCreating(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createMutation.mutate();
    }
  };

  const handleAnalyze = async (entryId: string) => {
    try {
      setAnalyzingId(entryId);
      const result = await analysisService.analyzeEntry(entryId);
      setAnalyses((prev) => ({ ...prev, [entryId]: result.analysis }));
    } catch (error: any) {
      console.error('Analysis failed:', error);
      alert(
        error.response?.data?.error || 
        error.message || 
        'Failed to analyze entry. Please check if the Anthropic API key is configured correctly.'
      );
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Journal Entries</h1>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      {/* Create Entry Form */}
      {isCreating && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="How are you feeling today? What's on your mind?"
              rows={8}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
            />
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Entry'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setTitle('');
                  setContent('');
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entries List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : data?.entries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-4">No journal entries yet</p>
          <p className="text-sm text-gray-500">Click "New Entry" to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              {entry.title && (
                <h3 className="text-xl font-semibold mb-2">{entry.title}</h3>
              )}
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{entry.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(entry.createdAt), 'MMMM d, yyyy · h:mm a')}
                </div>
                <button
                  onClick={() => handleAnalyze(entry.id)}
                  disabled={analyzingId === entry.id}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {analyzingId === entry.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze with AI
                    </>
                  )}
                </button>
              </div>
              {analyses[entry.id] && (
                <AnalysisDisplay analysis={analyses[entry.id]} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
