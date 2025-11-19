import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, Loader2, Sparkles, Edit2, Trash2, X, Check } from 'lucide-react';
import { entryService } from '../services/entryService';
import { analysisService } from '../services/analysisService';
import { format } from 'date-fns';
import AnalysisDisplay from '../components/analysis/AnalysisDisplay';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import type { Analysis } from '../types/analysis.types';
import type { JournalEntry } from '../types/api.types';
import { countWords, hasEnoughContentForAnalysis, getContentValidationMessage, MIN_WORDS_FOR_ANALYSIS } from '../utils/text';

export default function JournalPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<{ [key: string]: Analysis }>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; entryId: string | null }>({ 
    isOpen: false, 
    entryId: null 
  });
  const [contentWarning, setContentWarning] = useState<string | null>(null);
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
      setContentWarning(null);
      setIsCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, title, content }: { id: string; title: string; content: string }) =>
      entryService.update(id, title || undefined, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setEditingId(null);
      setEditTitle('');
      setEditContent('');
      setContentWarning(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => entryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setDeleteConfirm({ isOpen: false, entryId: null });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      const warning = getContentValidationMessage(content);
      if (warning) {
        setContentWarning(warning);
        return;
      }
      createMutation.mutate();
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditTitle(entry.title || '');
    setEditContent(entry.content);
    setContentWarning(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
    setContentWarning(null);
  };

  const handleUpdateSubmit = (e: React.FormEvent, entryId: string) => {
    e.preventDefault();
    if (editContent.trim()) {
      const warning = getContentValidationMessage(editContent);
      if (warning) {
        setContentWarning(warning);
        return;
      }
      updateMutation.mutate({ id: entryId, title: editTitle, content: editContent });
    }
  };

  const handleDeleteClick = (entryId: string) => {
    setDeleteConfirm({ isOpen: true, entryId });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.entryId) {
      deleteMutation.mutate(deleteConfirm.entryId);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, entryId: null });
  };

  const handleAnalyze = async (entryId: string, content: string) => {
    // Check if content has enough words for analysis
    if (!hasEnoughContentForAnalysis(content)) {
      const warning = getContentValidationMessage(content);
      alert(warning || 'This entry is too short for AI analysis.');
      return;
    }

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
              onChange={(e) => {
                setContent(e.target.value);
                setContentWarning(null);
              }}
              placeholder="How are you feeling today? What's on your mind?"
              rows={8}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
            />
            {contentWarning && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                ⚠️ {contentWarning}
              </div>
            )}
            <div className="text-xs text-gray-500 mb-4">
              {countWords(content)} words · Minimum {MIN_WORDS_FOR_ANALYSIS} words required for AI analysis
            </div>
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
                  setContentWarning(null);
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
              {editingId === entry.id ? (
                /* Edit Mode */
                <form onSubmit={(e) => handleUpdateSubmit(e, entry.id)}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Title (optional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => {
                      setEditContent(e.target.value);
                      setContentWarning(null);
                    }}
                    rows={8}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                  />
                  {contentWarning && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                      ⚠️ {contentWarning}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mb-4">
                    {countWords(editContent)} words · Minimum {MIN_WORDS_FOR_ANALYSIS} words required for AI analysis
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* View Mode */
                <>
                  {entry.title && (
                    <h3 className="text-xl font-semibold mb-2">{entry.title}</h3>
                  )}
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{entry.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(entry.createdAt), 'MMMM d, yyyy · h:mm a')}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(entry.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                      <button
                        onClick={() => handleAnalyze(entry.id, entry.content)}
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
                  </div>
                  {analyses[entry.id] && (
                    <AnalysisDisplay analysis={analyses[entry.id]} />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Journal Entry"
        message="Are you sure you want to delete this journal entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
