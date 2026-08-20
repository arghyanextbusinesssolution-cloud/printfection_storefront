import { Response } from 'express';
import type { ApiSuccessResponse, ApiErrorResponse } from '@printfection/types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  code?: string,
  errors?: Record<string, string[]>
): Response {
  const response: ApiErrorResponse = {
    success: false,
    message,
    ...(code && { code }),
    ...(errors && { errors }),
  };
  return res.status(statusCode).json(response);
}
