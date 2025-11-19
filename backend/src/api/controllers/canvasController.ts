import { Request, Response, NextFunction } from 'express';
import { canvasService } from '../../services/canvasService.js';
import { AppError } from '../../middleware/error.middleware.js';

/**
 * Generate canvas graph from user's data
 * POST /api/canvas/generate
 */
export const generateCanvas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const {
      includeEntries = true,
      includeEmotions = true,
      includeThemes = true,
      includePatterns = true,
      includeDistortions = true,
      days = 30,
      maxNodes = 100,
    } = req.body;

    const timeRange = days ? {
      start: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      end: new Date(),
    } : undefined;

    // Check if user has enough data before attempting generation
    const entriesCount = await canvasService.getAnalyzedEntriesCount(userId);
    
    if (entriesCount < 1) {
      throw new AppError(
        'Not enough data to generate canvas. You have ' + entriesCount + ' analyzed entries. Requirements: At least 3 journal entries with analyses.',
        400
      );
    }

    const graph = await canvasService.generateGraph({
      userId,
      includeEntries,
      includeEmotions,
      includeThemes,
      includePatterns,
      includeDistortions,
      timeRange,
      maxNodes,
      minConnectionWeight: 0.1,
    });

    // Check if we have enough data
    if (graph.nodes.length === 0) {
      throw new AppError(
        'Not enough data to generate canvas. You have ' + entriesCount + ' analyzed entries. Please create more journal entries and analyze them first.',
        400
      );
    }

    res.json({ 
      graph,
      message: graph.nodes.length < 5 
        ? 'Canvas generated with limited data. Create more journal entries for richer visualization.'
        : undefined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save canvas graph
 * POST /api/canvas/save
 */
export const saveCanvas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { graph } = req.body;

    if (!graph || !graph.nodes || !graph.edges) {
      throw new AppError('Invalid graph data', 400);
    }

    await canvasService.saveGraph(userId, graph);

    res.json({ message: 'Canvas saved successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Load saved canvas graph
 * GET /api/canvas
 */
export const loadCanvas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;

    const graph = await canvasService.loadGraph(userId);

    if (!graph) {
      // Check if user has enough data before attempting generation
      const entriesCount = await canvasService.getAnalyzedEntriesCount(userId);
      
      if (entriesCount < 1) {
        return res.json({ 
          graph: null, 
          generated: false,
          message: 'No analyzed entries found. Create journal entries and analyze them first.',
          requirementsNotMet: true,
          stats: {
            entriesWithAnalysis: entriesCount,
            required: 3,
          }
        });
      }

      // Generate new graph if none exists
      try {
        const newGraph = await canvasService.generateGraph({
          userId,
          includeEntries: true,
          includeEmotions: true,
          includeThemes: true,
          includePatterns: true,
          includeDistortions: true,
          maxNodes: 100,
        });
        
        if (newGraph.nodes.length === 0) {
          return res.json({ 
            graph: null, 
            generated: false,
            message: 'Not enough data to generate canvas. You have ' + entriesCount + ' analyzed entries. Create at least 3 journal entries and analyze them.',
            requirementsNotMet: true,
            stats: {
              entriesWithAnalysis: entriesCount,
              required: 3,
            }
          });
        }
        
        return res.json({ graph: newGraph, generated: true });
      } catch (genError) {
        console.error('Canvas generation error:', genError);
        return res.json({ 
          graph: null, 
          generated: false,
          message: 'Unable to generate canvas. Please ensure you have at least 3 journal entries with analyses.',
          requirementsNotMet: true,
          stats: {
            entriesWithAnalysis: entriesCount,
            required: 3,
          }
        });
      }
    } else {
      return res.json({ graph, generated: false });
    }
  } catch (error) {
    return next(error);
  }
};

/**
 * Generate canvas graph from a session
 * GET /api/canvas/session/:sessionId
 */
export const generateSessionCanvas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { sessionId } = req.params;

    if (!sessionId) {
      throw new AppError('Session ID is required', 400);
    }

    const graph = await canvasService.generateSessionGraph(sessionId, userId);

    res.json({ graph });
  } catch (error) {
    next(error);
  }
};
