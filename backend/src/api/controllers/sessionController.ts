import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware';
import { claudeService } from '../../services/claudeService';
import type { SessionMessage } from '../../types/session.types';

const prisma = new PrismaClient();

/**
 * Create a new guided root cause analysis session
 */
export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { initialEmotion } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    if (!initialEmotion || initialEmotion.trim().length < 3) {
      throw new AppError('Initial emotion must be at least 3 characters', 400);
    }

    // Create the session
    const session = await prisma.session.create({
      data: {
        userId,
        initialEmotion: initialEmotion.trim(),
        status: 'active',
        turnCount: 0,
        messages: [],
      },
    });

    // Get the first AI response
    const userMessage: SessionMessage = {
      role: 'user',
      content: initialEmotion.trim(),
      timestamp: new Date().toISOString(),
    };

    const aiResult = await claudeService.conductGuidedAnalysis(
      [userMessage],
      0
    );

    const aiMessage: SessionMessage = {
      role: 'assistant',
      content: aiResult.response,
      timestamp: new Date().toISOString(),
    };

    // Update session with messages
    const updatedSession = await prisma.session.update({
      where: { id: session.id },
      data: {
        messages: JSON.stringify([userMessage, aiMessage]),
        turnCount: 1,
      },
    });

    res.status(201).json({
      session: {
        ...updatedSession,
        messages: JSON.parse(updatedSession.messages as any),
      },
      aiResponse: aiResult.response,
      isComplete: aiResult.isComplete,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Continue an existing session with a new user message
 */
export const continueSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { userMessage } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    if (!userMessage || userMessage.trim().length < 1) {
      throw new AppError('Message cannot be empty', 400);
    }

    // Find the session
    const session = await prisma.session.findFirst({
      where: {
        id,
        userId,
        status: 'active',
      },
    });

    if (!session) {
      throw new AppError('Session not found or already completed', 404);
    }

    // Parse existing messages
    const messages: SessionMessage[] = JSON.parse(session.messages as any);

    // Add user's new message
    const newUserMessage: SessionMessage = {
      role: 'user',
      content: userMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    messages.push(newUserMessage);

    // Get AI response
    const aiResult = await claudeService.conductGuidedAnalysis(
      messages,
      session.turnCount
    );

    const aiMessage: SessionMessage = {
      role: 'assistant',
      content: aiResult.response,
      timestamp: new Date().toISOString(),
    };
    messages.push(aiMessage);

    // Update session
    const updateData: any = {
      messages: JSON.stringify(messages),
      turnCount: session.turnCount + 1,
      updatedAt: new Date(),
    };

    // If the session is complete, update status and capture root cause
    if (aiResult.isComplete) {
      updateData.status = 'completed';
      updateData.completedAt = new Date();
      updateData.rootCause = aiResult.rootCause || 'Root cause identified';
      updateData.metadata = JSON.stringify({
        themes: aiResult.themes || [],
      });
    }

    const updatedSession = await prisma.session.update({
      where: { id: session.id },
      data: updateData,
    });

    res.json({
      session: {
        ...updatedSession,
        messages: JSON.parse(updatedSession.messages as any),
        metadata: updatedSession.metadata ? JSON.parse(updatedSession.metadata as any) : undefined,
      },
      aiResponse: aiResult.response,
      isComplete: aiResult.isComplete,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all sessions for the current user
 */
export const getSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.session.count({ where: { userId } }),
    ]);

    res.json({
      sessions: sessions.map(s => ({
        ...s,
        messages: typeof s.messages === 'string' 
          ? (s.messages ? JSON.parse(s.messages) : [])
          : (s.messages || []),
        metadata: s.metadata 
          ? (typeof s.metadata === 'string' ? JSON.parse(s.metadata) : s.metadata)
          : undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific session
 */
export const getSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const session = await prisma.session.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    res.json({
      session: {
        ...session,
        messages: typeof session.messages === 'string'
          ? (session.messages ? JSON.parse(session.messages) : [])
          : (session.messages || []),
        metadata: session.metadata
          ? (typeof session.metadata === 'string' ? JSON.parse(session.metadata) : session.metadata)
          : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a session
 */
export const deleteSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const session = await prisma.session.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    await prisma.session.delete({
      where: { id },
    });

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    next(error);
  }
};
