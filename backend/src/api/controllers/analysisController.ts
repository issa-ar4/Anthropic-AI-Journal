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
      res.json({
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
      return;
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
        emotions: analysis.emotions as any,
        sentiment: analysis.sentiment as any,
        cognitiveDistortions: analysis.cognitiveDistortions as any,
        causalLinks: analysis.causalLinks as any,
        keyThemes: analysis.keyThemes,
        summary: analysis.summary,
      },
    });

    res.json({ analysis: savedAnalysis, cached: false });
    return;
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
            emotions: analysis.emotions as any,
            sentiment: analysis.sentiment as any,
            cognitiveDistortions: analysis.cognitiveDistortions as any,
            causalLinks: analysis.causalLinks as any,
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
        if (Array.isArray(distortions)) {
          distortions.forEach((d: any) => {
            // Filter out invalid distortions
            if (d && typeof d === 'object' && d.type && typeof d.type === 'string' && d.type.trim() !== '') {
              distortionCounts[d.type] = (distortionCounts[d.type] || 0) + 1;
            }
          });
        }
      }
    });

    const mostCommonDistortions = Object.entries(distortionCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate trigger timing (day of week and hour)
    const triggerTiming: any[] = [];
    entries.forEach((e) => {
      if (e.analyses.length > 0) {
        const sentiment = (e.analyses[0].sentiment as any).score || 0;
        const date = new Date(e.createdAt);
        const dayOfWeek = date.getDay();
        const hourOfDay = date.getHours();
        
        triggerTiming.push({
          dayOfWeek,
          hourOfDay,
          count: 1,
          avgSentiment: sentiment,
        });
      }
    });

    // Calculate distortion impacts
    const distortionImpacts: any[] = [];
    const distortionSentiments: { [key: string]: number[] } = {};
    
    entries.forEach((e) => {
      if (e.analyses.length > 0) {
        const sentiment = (e.analyses[0].sentiment as any).score || 0;
        const distortions = e.analyses[0].cognitiveDistortions as any[];
        
        if (Array.isArray(distortions)) {
          distortions.forEach((d: any) => {
            if (d && d.type) {
              if (!distortionSentiments[d.type]) {
                distortionSentiments[d.type] = [];
              }
              distortionSentiments[d.type].push(sentiment);
            }
          });
        }
      }
    });

    Object.entries(distortionSentiments).forEach(([type, sentiments]) => {
      const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
      distortionImpacts.push({
        type,
        count: sentiments.length,
        avgSentiment,
        severity: Math.abs(avgSentiment) * sentiments.length,
      });
    });

    // Calculate emotion radar (aggregate emotions)
    const emotionAggregates: { [key: string]: { total: number; count: number; category: string } } = {};
    
    entries.forEach((e) => {
      if (e.analyses.length > 0) {
        const emotions = e.analyses[0].emotions as any[];
        if (Array.isArray(emotions)) {
          emotions.forEach((emotion: any) => {
            if (emotion && emotion.name) {
              if (!emotionAggregates[emotion.name]) {
                emotionAggregates[emotion.name] = {
                  total: 0,
                  count: 0,
                  category: emotion.category || 'neutral',
                };
              }
              emotionAggregates[emotion.name].total += emotion.intensity || 0;
              emotionAggregates[emotion.name].count += 1;
            }
          });
        }
      }
    });

    const emotionRadar = Object.entries(emotionAggregates).map(([emotion, data]) => ({
      emotion,
      intensity: data.total / data.count,
      category: data.category as any,
    }));

    // Calculate theme bubbles
    const themeSentiments: { [key: string]: number[] } = {};
    
    entries.forEach((e) => {
      if (e.analyses.length > 0) {
        const sentiment = (e.analyses[0].sentiment as any).score || 0;
        const themes = e.analyses[0].keyThemes as string[];
        
        if (Array.isArray(themes)) {
          themes.forEach((theme: string) => {
            if (!themeSentiments[theme]) {
              themeSentiments[theme] = [];
            }
            themeSentiments[theme].push(sentiment);
          });
        }
      }
    });

    const themeBubbles = Object.entries(themeSentiments).map(([theme, sentiments]) => ({
      theme,
      count: sentiments.length,
      avgSentiment: sentiments.reduce((a, b) => a + b, 0) / sentiments.length,
    }));

    // Calculate recovery metrics
    const recoveryEvents: number[] = [];
    let currentLowPoint: { index: number; score: number } | null = null;
    
    overallSentimentTrend.forEach((point, idx) => {
      if (point.score < -0.3) {
        if (!currentLowPoint || point.score < currentLowPoint.score) {
          currentLowPoint = { index: idx, score: point.score };
        }
      } else if (currentLowPoint && point.score > 0) {
        const recoveryDays = idx - currentLowPoint.index;
        recoveryEvents.push(recoveryDays);
        currentLowPoint = null;
      }
    });

    const recoveryMetrics = {
      averageRecoveryDays: recoveryEvents.length > 0 
        ? recoveryEvents.reduce((a, b) => a + b, 0) / recoveryEvents.length 
        : 0,
      fastestRecoveryDays: recoveryEvents.length > 0 ? Math.min(...recoveryEvents) : 0,
      slowestRecoveryDays: recoveryEvents.length > 0 ? Math.max(...recoveryEvents) : 0,
      totalRecoveryEvents: recoveryEvents.length,
      improvementTrend: 0, // Would need historical comparison
    };

    // Calculate pattern trends (weekly frequency over last 8 weeks)
    const patternTrends = patterns.map((p) => {
      const weeklyFrequency = new Array(8).fill(0);
      const relatedIds = p.relatedEntryIds as string[];
      
      relatedIds.forEach((entryId) => {
        const entry = entries.find(e => e.id === entryId);
        if (entry) {
          const weeksAgo = Math.floor(
            (Date.now() - entry.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000)
          );
          if (weeksAgo < 8) {
            weeklyFrequency[7 - weeksAgo] += 1;
          }
        }
      });
      
      return {
        patternId: p.id,
        weeklyFrequency,
      };
    });

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
      triggerTiming,
      distortionImpacts,
      emotionRadar,
      themeBubbles,
      recoveryMetrics,
      patternTrends,
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
      res.json({ 
        patterns: [],
        message: 'Need at least 3 entries to detect patterns' 
      });
      return;
    }

    // Use Claude to find patterns
    const result = await claudeService.findPatterns(
      entries.map(e => ({
        id: e.id,
        content: e.content,
        title: e.title || undefined,
        createdAt: e.createdAt
      }))
    );

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
