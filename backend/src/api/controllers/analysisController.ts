import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { claudeService } from '../../services/claudeService';
import { AppError } from '../../middleware/error.middleware';
import { InsightData } from '../../types/analysis.types';

const prisma = new PrismaClient();

/**
 * Analyze a single journal entry
 * POST /api/analyze/:entryId
 */
export const analyzeEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { entryId } = req.params;
    const userId = req.user!.userId;

    // Check if entry exists and belongs to user
    const entry = await prisma.journalEntry.findFirst({
      where: { id: entryId, userId },
    });

    if (!entry) {
      throw new AppError('Journal entry not found', 404);
    }

    // Check if analysis already exists
    const existingAnalysis = await prisma.analysis.findFirst({
      where: { entryId },
      orderBy: { createdAt: 'desc' },
    });

    // If analysis exists and is recent (< 1 hour), return it
    if (existingAnalysis && 
        Date.now() - existingAnalysis.createdAt.getTime() < 3600000) {
      return res.json({
        analysis: {
          ...existingAnalysis,
          emotions: existingAnalysis.emotions,
          sentiment: existingAnalysis.sentiment,
          cognitiveDistortions: existingAnalysis.cognitiveDistortions,
          causalLinks: existingAnalysis.causalLinks,
          keyThemes: existingAnalysis.keyThemes,
        },
        cached: true,
      });
    }

    // Perform analysis using Claude
    const analysis = await claudeService.analyzeEntry(
      entryId,
      entry.content,
      entry.title || undefined
    );

    // Save analysis to database
    const savedAnalysis = await prisma.analysis.create({
      data: {
        entryId,
        emotions: analysis.emotions,
        sentiment: analysis.sentiment,
        cognitiveDistortions: analysis.cognitiveDistortions,
        causalLinks: analysis.causalLinks,
        keyThemes: analysis.keyThemes,
        summary: analysis.summary,
      },
    });

    res.json({ analysis: savedAnalysis, cached: false });
  } catch (error) {
    next(error);
  }
};

/**
 * Analyze multiple entries in batch
 * POST /api/analyze/batch
 */
export const analyzeBatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { entryIds } = req.body;
    const userId = req.user!.userId;

    if (!Array.isArray(entryIds) || entryIds.length === 0) {
      throw new AppError('entryIds must be a non-empty array', 400);
    }

    // Get all entries
    const entries = await prisma.journalEntry.findMany({
      where: {
        id: { in: entryIds },
        userId,
      },
    });

    if (entries.length === 0) {
      throw new AppError('No valid entries found', 404);
    }

    // Analyze each entry
    const results = await Promise.all(
      entries.map(async (entry) => {
        // Check for existing analysis
        const existing = await prisma.analysis.findFirst({
          where: { entryId: entry.id },
          orderBy: { createdAt: 'desc' },
        });

        if (existing && Date.now() - existing.createdAt.getTime() < 3600000) {
          return { entryId: entry.id, analysis: existing, cached: true };
        }

        const analysis = await claudeService.analyzeEntry(
          entry.id,
          entry.content,
          entry.title || undefined
        );

        const saved = await prisma.analysis.create({
          data: {
            entryId: entry.id,
            emotions: analysis.emotions,
            sentiment: analysis.sentiment,
            cognitiveDistortions: analysis.cognitiveDistortions,
            causalLinks: analysis.causalLinks,
            keyThemes: analysis.keyThemes,
            summary: analysis.summary,
          },
        });

        return { entryId: entry.id, analysis: saved, cached: false };
      })
    );

    res.json({ results });
  } catch (error) {
    next(error);
  }
};

/**
 * Get aggregated insights for user
 * GET /api/insights
 */
export const getInsights = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { days = 30 } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(days));

    // Get recent entries with analyses
    const entries = await prisma.journalEntry.findMany({
      where: {
        userId,
        createdAt: { gte: daysAgo },
      },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Get patterns
    const patterns = await prisma.pattern.findMany({
      where: { userId },
      orderBy: { frequency: 'desc' },
      take: 10,
    });

    // Build emotional trends
    const emotionalTrends = entries
      .filter((e) => e.analyses.length > 0)
      .map((e) => {
        const analysis = e.analyses[0];
        const emotions = analysis.emotions as any[];
        const emotionMap: { [key: string]: number } = {};
        
        emotions.forEach((emotion: any) => {
          emotionMap[emotion.name] = emotion.intensity;
        });

        return {
          date: e.createdAt.toISOString().split('T')[0],
          emotions: emotionMap,
        };
      });

    // Build sentiment trend
    const overallSentimentTrend = entries
      .filter((e) => e.analyses.length > 0)
      .map((e) => {
        const analysis = e.analyses[0];
        const sentiment = analysis.sentiment as any;
        return {
          date: e.createdAt.toISOString().split('T')[0],
          score: sentiment.score || 0,
        };
      });

    // Count cognitive distortions
    const distortionCounts: { [key: string]: number } = {};
    entries.forEach((e) => {
      if (e.analyses.length > 0) {
        const distortions = e.analyses[0].cognitiveDistortions as any[];
        distortions.forEach((d: any) => {
          distortionCounts[d.type] = (distortionCounts[d.type] || 0) + 1;
        });
      }
    });

    const mostCommonDistortions = Object.entries(distortionCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const insights: InsightData = {
      emotionalTrends,
      topPatterns: patterns.map((p) => ({
        type: p.type as any,
        description: p.description,
        frequency: p.frequency,
        relatedEntryIds: p.relatedEntryIds as string[],
        firstDetected: p.firstDetected,
        lastDetected: p.lastDetected,
      })),
      mostCommonDistortions,
      overallSentimentTrend,
    };

    res.json(insights);
  } catch (error) {
    next(error);
  }
};

/**
 * Find patterns across user's entries
 * POST /api/patterns/detect
 */
export const detectPatterns = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { limit = 20 } = req.query;

    // Get recent entries
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    });

    if (entries.length < 3) {
      return res.json({ 
        patterns: [],
        message: 'Need at least 3 entries to detect patterns' 
      });
    }

    // Use Claude to find patterns
    const result = await claudeService.findPatterns(entries);

    // Save detected patterns
    const savedPatterns = await Promise.all(
      result.patterns.map(async (p) => {
        // Check if similar pattern exists
        const existing = await prisma.pattern.findFirst({
          where: {
            userId,
            type: p.type,
            description: p.description,
          },
        });

        if (existing) {
          // Update existing pattern
          return prisma.pattern.update({
            where: { id: existing.id },
            data: {
              frequency: existing.frequency + p.frequency,
              relatedEntryIds: [...new Set([
                ...(existing.relatedEntryIds as string[]),
                ...p.relatedEntryIds,
              ])],
              lastDetected: new Date(),
            },
          });
        }

        // Create new pattern
        return prisma.pattern.create({
          data: {
            userId,
            type: p.type,
            description: p.description,
            frequency: p.frequency,
            relatedEntryIds: p.relatedEntryIds,
          },
        });
      })
    );

    res.json({ patterns: savedPatterns });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all patterns for user
 * GET /api/patterns
 */
export const getPatterns = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;

    const patterns = await prisma.pattern.findMany({
      where: { userId },
      orderBy: [
        { frequency: 'desc' },
        { lastDetected: 'desc' },
      ],
    });

    res.json({ patterns });
  } catch (error) {
    next(error);
  }
};
