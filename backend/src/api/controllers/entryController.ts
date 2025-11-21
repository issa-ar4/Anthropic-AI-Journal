import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware';

const prisma = new PrismaClient();

export const createEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { title, content } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const entry = await prisma.journalEntry.create({
      data: {
        userId,
        title,
        content,
      },
    });

    res.status(201).json({ entry });
  } catch (error) {
    next(error);
  }
};

export const getEntries = async (
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

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.journalEntry.count({ where: { userId } }),
    ]);

    res.json({
      entries,
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

export const getEntry = async (
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

    const entry = await prisma.journalEntry.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!entry) {
      throw new AppError('Entry not found', 404);
    }

    res.json({ entry });
  } catch (error) {
    next(error);
  }
};

export const updateEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { title, content } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    // Check if entry exists and belongs to user
    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingEntry) {
      throw new AppError('Entry not found', 404);
    }

    const entry = await prisma.journalEntry.update({
      where: { id },
      data: {
        title,
        content,
      },
    });

    res.json({ entry });
  } catch (error) {
    next(error);
  }
};

export const deleteEntry = async (
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

    // Check if entry exists and belongs to user
    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingEntry) {
      throw new AppError('Entry not found', 404);
    }

    await prisma.journalEntry.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Get list of unanalyzed entries
 * GET /api/entries/unanalyzed
 */
export const getUnanalyzedEntries = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    // Find entries without any analysis
    const unanalyzedEntries = await prisma.journalEntry.findMany({
      where: {
        userId,
        analyses: {
          none: {},
        },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    });

    res.json({
      count: unanalyzedEntries.length,
      entries: unanalyzedEntries,
    });
  } catch (error) {
    next(error);
  }
};
