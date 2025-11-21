import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, Loader2, Sparkles, Edit2, Trash2, X, Check, BookOpen } from 'lucide-react';
import { entryService } from '../services/entryService';
import { analysisService } from '../services/analysisService';
import { format } from 'date-fns';
import AnalysisDisplay from '../components/analysis/AnalysisDisplay';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { AnalyzeAllModal } from '../components/journal/AnalyzeAllModal';
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
  const [showAnalyzeAllModal, setShowAnalyzeAllModal] = useState(false);
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
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Journal Entries</h1>
          <p className="text-gray-600 text-lg">Express your thoughts and feelings</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAnalyzeAllModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold"
          >
            <Sparkles className="w-5 h-5" />
            Analyze All with AI
          </button>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold"
          >
            <Plus className="w-5 h-5" />
            New Entry
          </button>
        </div>
      </div>

      {/* Create Entry Form */}
      {isCreating && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Write New Entry</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
            />
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setContentWarning(null);
              }}
              placeholder="How are you feeling today? What's on your mind?"
              rows={10}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none transition-all"
            />
            {contentWarning && (
              <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl text-amber-800">
                <div className="flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>{contentWarning}</span>
                </div>
              </div>
            )}
            <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
              <span className="font-semibold">{countWords(content)}</span> words · 
              <span className="text-gray-400">Minimum {MIN_WORDS_FOR_ANALYSIS} words required for AI analysis</span>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold disabled:opacity-50 disabled:hover:scale-100"
              >
                {createMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
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
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entries List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        </div>
      ) : data?.entries.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-purple-600" />
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-2">No journal entries yet</p>
          <p className="text-gray-600">Click "New Entry" to start your journey</p>
        </div>
      ) : (
        <div className="space-y-6">
          {data?.entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 border border-gray-100">
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
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 hover:scale-105 transition-all font-medium"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(entry.id)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:scale-105 transition-all font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                      <button
                        onClick={() => handleAnalyze(entry.id, entry.content)}
                        disabled={analyzingId === entry.id}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 font-medium"
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

      {/* Analyze All Modal */}
      {showAnalyzeAllModal && (
        <AnalyzeAllModal
          onClose={() => setShowAnalyzeAllModal(false)}
          onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            queryClient.invalidateQueries({ queryKey: ['canvas'] });
            queryClient.invalidateQueries({ queryKey: ['insights'] });
          }}
        />
      )}
    </div>
  );
}
