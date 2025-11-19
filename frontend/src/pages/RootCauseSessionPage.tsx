import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Clock, CheckCircle, XCircle, Trash2, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sessionService } from '../services/sessionService';
import ChatInterface from '../components/session/ChatInterface';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import type { Session, SessionMessage } from '../types/session.types';
import { format } from 'date-fns';

export default function RootCauseSessionPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<SessionMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    sessionId: string | null;
  }>({ isOpen: false, sessionId: null });

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch all sessions
  const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => sessionService.getAll(),
  });

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: (initialEmotion: string) => sessionService.create(initialEmotion),
    onSuccess: (data) => {
      setActiveSessionId(data.session.id);
      setCurrentMessages(data.session.messages);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  // Continue session mutation
  const continueSessionMutation = useMutation({
    mutationFn: ({ sessionId, message }: { sessionId: string; message: string }) =>
      sessionService.continue(sessionId, message),
    onSuccess: (data) => {
      setCurrentMessages(data.session.messages);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => sessionService.delete(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      if (activeSessionId === deleteConfirm.sessionId) {
        setActiveSessionId(null);
        setCurrentMessages([]);
      }
      setDeleteConfirm({ isOpen: false, sessionId: null });
    },
  });

  const handleStartNewSession = async (initialMessage: string) => {
    if (!initialMessage || initialMessage.trim().length < 3) {
      console.error('Initial emotion must be at least 3 characters');
      return;
    }
    
    setIsProcessing(true);
    try {
      await createSessionMutation.mutateAsync(initialMessage.trim());
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinueSession = async (message: string) => {
    if (!activeSessionId) return;

    setIsProcessing(true);
    try {
      await continueSessionMutation.mutateAsync({
        sessionId: activeSessionId,
        message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (activeSessionId) {
      await handleContinueSession(message);
    } else {
      await handleStartNewSession(message);
    }
  };

  const handleSelectSession = (session: Session) => {
    setActiveSessionId(session.id);
    setCurrentMessages(session.messages);
  };

  const handleNewSession = () => {
    setActiveSessionId(null);
    setCurrentMessages([]);
  };

  const handleDeleteClick = (sessionId: string) => {
    setDeleteConfirm({ isOpen: true, sessionId });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.sessionId) {
      deleteSessionMutation.mutate(deleteConfirm.sessionId);
    }
  };

  const handleVisualizeSession = (sessionId: string) => {
    // Navigate to canvas page with session ID as query param
    navigate(`/canvas?session=${sessionId}`);
  };

  const activeSession = sessionsData?.sessions.find((s) => s.id === activeSessionId);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar - Session History */}
      <div className="w-80 bg-slate-50 border-r border-slate-200 overflow-y-auto">
        <div className="p-4 border-b border-slate-200 bg-white">
          <button
            onClick={handleNewSession}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            New Session
          </button>
        </div>

        <div className="p-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Previous Sessions
          </h2>

          {isLoadingSessions ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : sessionsData?.sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No sessions yet. Start your first guided analysis!
            </div>
          ) : (
            <div className="space-y-2">
              {sessionsData?.sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                    activeSessionId === session.id
                      ? 'bg-indigo-100 border-2 border-indigo-500'
                      : 'bg-white border border-slate-200 hover:border-indigo-300'
                  }`}
                  onClick={() => handleSelectSession(session)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {session.initialEmotion}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">
                          {format(new Date(session.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {session.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Complete
                          </span>
                        ) : session.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-full">
                            <XCircle className="w-3 h-3" />
                            Abandoned
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          {session.turnCount} turns
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  {session.rootCause && (
                    <>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                        {session.rootCause}
                      </p>
                      {session.status === 'completed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVisualizeSession(session.id);
                          }}
                          className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-medium"
                        >
                          <Network className="w-3 h-3" />
                          Visualize Journey
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-800">
            Guided Root Cause Analysis
          </h1>
          {activeSession && (
            <p className="text-sm text-slate-600 mt-1">
              Exploring: <span className="font-medium">{activeSession.initialEmotion}</span>
            </p>
          )}
        </div>

        {/* Chat Interface */}
        <div className="flex-1 p-6">
          <ChatInterface
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            isLoading={isProcessing}
            isComplete={activeSession?.status === 'completed'}
            placeholder={
              activeSessionId
                ? "Share more about this..."
                : "What emotion or thought would you like to explore? (e.g., 'I feel anxious about work')"
            }
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onCancel={() => setDeleteConfirm({ isOpen: false, sessionId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Session"
        message="Are you sure you want to delete this session? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
