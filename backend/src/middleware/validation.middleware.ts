import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './error.middleware.js';

export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const error = new AppError('Validation failed', 400);
    (error as any).errors = errors.array();
    return next(error);
  }
  
  next();
};
