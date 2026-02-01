import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config/environment';

export interface ErrorResponse {
  status: 'error';
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Handle known errors
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      status: 'error',
      message: err.message,
      code: err.code,
    };

    if (err instanceof ValidationError) {
      response.errors = err.errors;
    }

    if (!config.isProduction) {
      response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Knex/database errors
  if (err.name === 'KnexError' || (err as { code?: string }).code?.startsWith('2')) {
    const response: ErrorResponse = {
      status: 'error',
      message: 'Database error occurred',
      code: 'DATABASE_ERROR',
    };

    if (!config.isProduction) {
      response.message = err.message;
      response.stack = err.stack;
    }

    res.status(500).json(response);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
    });
    return;
  }

  // Handle Stripe errors
  if ((err as { type?: string }).type?.startsWith('Stripe')) {
    res.status(400).json({
      status: 'error',
      message: 'Payment processing error',
      code: 'PAYMENT_ERROR',
    });
    return;
  }

  // Handle unknown errors
  const response: ErrorResponse = {
    status: 'error',
    message: config.isProduction ? 'An unexpected error occurred' : err.message,
    code: 'INTERNAL_ERROR',
  };

  if (!config.isProduction) {
    response.stack = err.stack;
  }

  res.status(500).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.path} not found`,
    code: 'NOT_FOUND',
  });
};

export const asyncHandler = <T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
