import { body, param, query } from 'express-validator';

export const createJobValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
  body('jobType')
    .isIn(['one_time', 'recurring', 'contract'])
    .withMessage('Invalid job type'),
  body('paymentType')
    .isIn(['hourly', 'fixed', 'milestone'])
    .withMessage('Invalid payment type'),
  body('budgetMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget minimum must be a positive number'),
  body('budgetMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget maximum must be a positive number')
    .custom((value, { req }) => {
      if (req.body.budgetMin && value < req.body.budgetMin) {
        throw new Error('Budget maximum must be greater than minimum');
      }
      return true;
    }),
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
  body('estimatedHours')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Estimated hours must be a positive integer'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('isRemote')
    .optional()
    .isBoolean()
    .withMessage('isRemote must be a boolean'),
  body('requiredWorkers')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Required workers must be at least 1'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date')
    .toDate(),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date')
    .toDate()
    .custom((value, { req }) => {
      if (req.body.startDate && value < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('visibility')
    .optional()
    .isIn(['public', 'private', 'invited'])
    .withMessage('Invalid visibility'),
];

export const updateJobValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid job ID'),
  ...createJobValidator.map((validator) => validator.optional()),
];

export const jobIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid job ID'),
];

export const searchJobsValidator = [
  query('categoryId')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
  query('jobType')
    .optional()
    .isIn(['one_time', 'recurring', 'contract'])
    .withMessage('Invalid job type'),
  query('paymentType')
    .optional()
    .isIn(['hourly', 'fixed', 'milestone'])
    .withMessage('Invalid payment type'),
  query('minBudget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum budget must be a positive number'),
  query('maxBudget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum budget must be a positive number'),
  query('isRemote')
    .optional()
    .isBoolean()
    .withMessage('isRemote must be a boolean'),
  query('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  query('radiusKm')
    .optional()
    .isFloat({ min: 1, max: 500 })
    .withMessage('Radius must be between 1 and 500 km'),
  query('query')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Search query must be less than 255 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const applyForJobValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid job ID'),
  body('proposedRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Proposed rate must be a positive number'),
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Cover letter must be less than 5000 characters'),
  body('estimatedCompletionTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Estimated completion time must be a positive integer'),
];
