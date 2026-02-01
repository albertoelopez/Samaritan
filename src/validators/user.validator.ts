import { body, param, query } from 'express-validator';

export const userIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID'),
];

export const updateUserValidator = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('First name must be less than 100 characters'),
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Last name must be less than 100 characters'),
  body('phoneNumber')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),
];

export const updateWorkerProfileValidator = [
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Bio must be less than 5000 characters'),
  body('hourlyRateMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum hourly rate must be a positive number'),
  body('hourlyRateMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum hourly rate must be a positive number')
    .custom((value, { req }) => {
      if (req.body.hourlyRateMin && value < req.body.hourlyRateMin) {
        throw new Error('Maximum rate must be greater than minimum rate');
      }
      return true;
    }),
  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Years of experience must be a non-negative integer'),
  body('availableForWork')
    .optional()
    .isBoolean()
    .withMessage('availableForWork must be a boolean'),
  body('serviceRadiusKm')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Service radius must be between 1 and 500 km'),
];

export const updateContractorProfileValidator = [
  body('companyName')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Company name must be less than 255 characters'),
  body('companyDescription')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Company description must be less than 5000 characters'),
  body('companySize')
    .optional()
    .isIn(['1-10', '10-50', '50-200', '200-500', '500+'])
    .withMessage('Invalid company size'),
  body('industry')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Industry must be less than 100 characters'),
  body('websiteUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid website URL'),
];

export const updateLocationValidator = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
];

export const searchWorkersValidator = [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
  query('radiusKm')
    .optional()
    .isFloat({ min: 1, max: 500 })
    .withMessage('Radius must be between 1 and 500 km'),
  query('categoryId')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
  query('available')
    .optional()
    .isBoolean()
    .withMessage('available must be a boolean'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const listUsersValidator = [
  query('role')
    .optional()
    .isIn(['worker', 'contractor', 'admin', 'moderator'])
    .withMessage('Invalid role'),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'pending_verification'])
    .withMessage('Invalid status'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
