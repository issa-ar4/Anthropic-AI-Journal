import { apiClient } from '../lib/api-client';
import { JournalEntry, EntriesResponse } from '../types/api.types';

export const entryService = {
  async create(title: string | undefined, content: string): Promise<{ entry: JournalEntry }> {
    const response = await apiClient.post('/entries', {
      title,
      content,
    });
    return response.data;
  },

  async getAll(page = 1, limit = 20): Promise<EntriesResponse> {
    const response = await apiClient.get('/entries', {
      params: { page, limit },
    });
    return response.data;
  },

  async getById(id: string): Promise<{ entry: JournalEntry }> {
    const response = await apiClient.get(`/entries/${id}`);
    return response.data;
  },

  async update(id: string, title: string | undefined, content: string): Promise<{ entry: JournalEntry }> {
    const response = await apiClient.put(`/entries/${id}`, {
      title,
      content,
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/entries/${id}`);
  },
};
