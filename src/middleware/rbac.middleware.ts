import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ForbiddenError } from '../utils/errors';
import { UserRole, User } from '../models/User';

export const requireRole = (...allowedRoles: UserRole[]): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user as User | undefined;
    if (!user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (!allowedRoles.includes(user.role)) {
      return next(new ForbiddenError(`Access denied. Required role: ${allowedRoles.join(' or ')}`));
    }

    next();
  };
};

export const requireWorker = requireRole('worker');
export const requireContractor = requireRole('contractor');
export const requireAdmin = requireRole('admin');
export const requireModerator = requireRole('admin', 'moderator');
export const requireWorkerOrContractor = requireRole('worker', 'contractor');

export const requireVerified: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const user = req.user as User | undefined;
  if (!user) {
    return next(new ForbiddenError('Authentication required'));
  }

  if (!user.email_verified) {
    return next(new ForbiddenError('Email verification required'));
  }

  next();
};

export const requireActiveAccount: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const user = req.user as User | undefined;
  if (!user) {
    return next(new ForbiddenError('Authentication required'));
  }

  if (user.status !== 'active') {
    return next(new ForbiddenError('Account is not active'));
  }

  next();
};

export const requireOwnerOrAdmin = (userIdParam: string): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user as User | undefined;
    if (!user) {
      return next(new ForbiddenError('Authentication required'));
    }

    const targetUserId = req.params[userIdParam];

    if (user.id !== targetUserId && user.role !== 'admin') {
      return next(new ForbiddenError('Access denied'));
    }

    next();
  };
};
