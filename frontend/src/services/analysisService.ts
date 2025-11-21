import { apiClient } from '../lib/api-client';
import {
  AnalyzeResponse,
  BatchAnalyzeResponse,
  InsightData,
  DetectPatternsResponse,
  Pattern,
} from '../types/analysis.types';

export const analysisService = {
  /**
   * Analyze a single journal entry
   */
  async analyzeEntry(entryId: string): Promise<AnalyzeResponse> {
    const response = await apiClient.post<AnalyzeResponse>(`/analyze/${entryId}`);
    return response.data;
  },

  /**
   * Analyze multiple entries in batch
   */
  async analyzeBatch(entryIds: string[]): Promise<BatchAnalyzeResponse> {
    const response = await apiClient.post<BatchAnalyzeResponse>('/analyze/batch', {
      entryIds,
    });
    return response.data;
  },

  /**
   * Get aggregated insights
   */
  async getInsights(days: number = 30): Promise<InsightData> {
    const response = await apiClient.get<InsightData>('/insights', {
      params: { days },
    });
    return response.data;
  },

  /**
   * Detect patterns across entries
   */
  async detectPatterns(limit: number = 20): Promise<DetectPatternsResponse> {
    const response = await apiClient.post<DetectPatternsResponse>('/patterns/detect', null, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get all patterns for user
   */
  async getPatterns(): Promise<{ patterns: Pattern[] }> {
    const response = await apiClient.get<{ patterns: Pattern[] }>('/patterns');
    return response.data;
  },
};

export default analysisService;
