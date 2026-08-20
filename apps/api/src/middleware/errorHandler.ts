import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { sendError } from '../utils/ApiResponse';
import { isProduction } from '../config/env';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (err instanceof ApiError) {
    return sendError(res, err.message, err.statusCode, err.code, err.errors);
  }

  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const path = e.path.join('.');
      if (!errors[path]) errors[path] = [];
      errors[path].push(e.message);
    });
    return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors);
  }

  logger.error('Unhandled error', {
    message: err.message,
    stack: isProduction ? undefined : err.stack,
  });

  return sendError(
    res,
    isProduction ? 'Internal server error' : err.message,
    500,
    'INTERNAL_ERROR'
  );
}
