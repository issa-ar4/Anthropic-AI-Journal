import api from './api';
import type { Session, CreateSessionRequest, ContinueSessionRequest, SessionResponse } from '../types/session.types';

export const sessionService = {
  /**
   * Create a new guided root cause analysis session
   */
  async create(initialEmotion: string): Promise<SessionResponse> {
    const response = await api.post<SessionResponse>('/sessions', {
      initialEmotion,
    } as CreateSessionRequest);
    return response.data;
  },

  /**
   * Continue an existing session with a new user message
   */
  async continue(sessionId: string, userMessage: string): Promise<SessionResponse> {
    const response = await api.post<SessionResponse>(`/sessions/${sessionId}/continue`, {
      userMessage,
    } as ContinueSessionRequest);
    return response.data;
  },

  /**
   * Get all sessions
   */
  async getAll(page = 1, limit = 20): Promise<{
    sessions: Session[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get('/sessions', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get a specific session
   */
  async getById(sessionId: string): Promise<{ session: Session }> {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Delete a session
   */
  async delete(sessionId: string): Promise<void> {
    await api.delete(`/sessions/${sessionId}`);
  },
};
