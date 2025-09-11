import { body, param, query, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['citizen', 'provider', 'admin'])
    .withMessage('Role must be citizen, provider, or admin'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

// Complaint validation rules
export const validateComplaintCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .isIn(['electricity', 'water', 'roads', 'sanitation', 'street_lights', 'drainage', 'public_transport', 'other'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be low, medium, high, or critical'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be an array of [longitude, latitude]'),
  body('location.coordinates.*')
    .isFloat()
    .withMessage('Coordinates must be valid numbers'),
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('location.region')
    .trim()
    .notEmpty()
    .withMessage('Region is required'),
  body('isEmergency')
    .optional()
    .isBoolean()
    .withMessage('isEmergency must be a boolean'),
  handleValidationErrors
];

export const validateComplaintUpdate = [
  body('status')
    .optional()
    .isIn(['submitted', 'under_review', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be low, medium, high, or critical'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned user must be a valid user ID'),
  handleValidationErrors
];

export const validateComplaintRating = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Feedback cannot be more than 1000 characters'),
  handleValidationErrors
];

// Department validation rules
export const validateDepartmentCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department name must be between 2 and 100 characters'),
  body('code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Department code must be between 2 and 20 characters')
    .matches(/^[A-Z0-9_]+$/)
    .withMessage('Department code must contain only uppercase letters, numbers, and underscores'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('categories')
    .isArray({ min: 1 })
    .withMessage('At least one category is required'),
  body('categories.*')
    .isIn(['electricity', 'water', 'roads', 'sanitation', 'street_lights', 'drainage', 'public_transport', 'other'])
    .withMessage('Invalid category'),
  body('contactInfo.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('contactInfo.phone')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  body('contactInfo.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('head')
    .optional()
    .isMongoId()
    .withMessage('Department head must be a valid user ID'),
  handleValidationErrors
];

// Parameter validation
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Query validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

export const validateComplaintFilters = [
  query('status')
    .optional()
    .isIn(['submitted', 'under_review', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status filter'),
  query('category')
    .optional()
    .isIn(['electricity', 'water', 'roads', 'sanitation', 'street_lights', 'drainage', 'public_transport', 'other'])
    .withMessage('Invalid category filter'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority filter'),
  query('isEmergency')
    .optional()
    .isBoolean()
    .withMessage('isEmergency must be a boolean'),
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Radius must be a positive number'),
  handleValidationErrors
];

// Review validation rules
export const validateReviewCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Content must be between 10 and 1000 characters'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('type')
    .optional()
    .isIn(['system', 'complaint'])
    .withMessage('Type must be system or complaint'),
  // Only require complaint if type is not 'system'
  body('complaint')
    .if(body('type').not().equals('system'))
    .notEmpty()
    .withMessage('Complaint is required for complaint reviews'),
  handleValidationErrors
];