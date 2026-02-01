import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from '../utils/errors';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const formattedErrors: Record<string, string[]> = {};
    errors.array().forEach((error) => {
      if (error.type === 'field') {
        const field = error.path;
        if (!formattedErrors[field]) {
          formattedErrors[field] = [];
        }
        formattedErrors[field].push(error.msg);
      }
    });

    next(new ValidationError(formattedErrors));
  };
};

export const validateParams = (validations: ValidationChain[]) => {
  return validate(validations.map((v) => v.bail()));
};

export const validateQuery = (validations: ValidationChain[]) => {
  return validate(validations.map((v) => v.bail()));
};

export const validateBody = (validations: ValidationChain[]) => {
  return validate(validations.map((v) => v.bail()));
};
