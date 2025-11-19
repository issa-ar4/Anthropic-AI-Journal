import { apiClient } from '../lib/api-client';
import { AuthResponse } from '../types/api.types';

export const authService = {
  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
    });
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async me() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
