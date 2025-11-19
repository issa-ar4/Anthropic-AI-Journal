import api from '@/services/api';
import { CanvasGraph } from '@/types/canvas.types';

export interface GenerateCanvasOptions {
  includeEntries?: boolean;
  includeEmotions?: boolean;
  includeThemes?: boolean;
  includePatterns?: boolean;
  includeDistortions?: boolean;
  days?: number;
  maxNodes?: number;
}

const canvasService = {
  /**
   * Generate a new canvas graph
   */
  async generateCanvas(options: GenerateCanvasOptions = {}): Promise<CanvasGraph> {
    const response = await api.post('/canvas/generate', options);
    return response.data.graph;
  },

  /**
   * Save canvas graph to database
   */
  async saveCanvas(graph: CanvasGraph): Promise<void> {
    await api.post('/canvas/save', { graph });
  },

  /**
   * Load saved canvas graph
   */
  async loadCanvas(): Promise<{ graph: CanvasGraph; generated: boolean }> {
    const response = await api.get('/canvas');
    return response.data;
  },
};

export default canvasService;
