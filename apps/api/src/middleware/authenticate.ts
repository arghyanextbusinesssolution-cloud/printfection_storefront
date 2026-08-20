import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { Admin, IAdmin } from '../models/Admin';

export interface AuthPayload {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      admin?: IAdmin;
      auth?: AuthPayload;
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) {
      throw ApiError.unauthorized('Authentication required');
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    const admin = await Admin.findById(payload.id).select('-passwordHash');

    if (!admin || !admin.isActive) {
      throw ApiError.unauthorized('Invalid or inactive account');
    }

    req.auth = payload;
    req.admin = admin;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized('Invalid or expired token'));
    }
  }
}

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.admin) {
    next(ApiError.unauthorized('Admin access required'));
    return;
  }
  next();
}
