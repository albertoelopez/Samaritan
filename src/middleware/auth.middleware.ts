import { Request, Response, NextFunction, RequestHandler } from 'express';
import passport from 'passport';
import { UnauthorizedError } from '../utils/errors';
import { User } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticate: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error | null, user: User | false) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    req.user = user;
    next();
  })(req, res, next);
};

export const optionalAuth: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error | null, user: User | false) => {
    if (err) {
      return next(err);
    }

    if (user) {
      req.user = user;
    }

    next();
  })(req, res, next);
};
