import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

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
    res.cookie(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  req.sessionId = sessionId;
  next();
}
