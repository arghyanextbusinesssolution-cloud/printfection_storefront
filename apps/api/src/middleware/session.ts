import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { env } from '../config/env';

declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
    }
  }
}

const SESSION_COOKIE = 'pf_session';

export function sessionMiddleware(req: Request, res: Response, next: NextFunction): void {
  let sessionId =
    req.headers['x-session-id'] as string ||
    req.cookies?.[SESSION_COOKIE];

  if (!sessionId) {
    sessionId = randomUUID();
    const isProd = env.NODE_ENV === 'production';
    res.cookie(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  req.sessionId = sessionId;
  next();
}
