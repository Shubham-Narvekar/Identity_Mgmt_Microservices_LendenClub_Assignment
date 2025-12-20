const { body, validationResult } = require('express-validator');
const { ValidationError } = require('./errorHandler');

/**
 * Middleware to handle validation results
 * Must be used after validation rules
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Format errors for consistent response
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    // Throw validation error that will be caught by errorHandler
    throw new ValidationError(
      errorMessages.map(e => e.message).join(', ')
    );
  }
  
  next();
};

/**
 * Registration Validation Rules
 */
const validateRegister = [
  // Email validation
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),

  // Password validation
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .isLength({ max: 128 })
    .withMessage('Password cannot exceed 128 characters'),

  // Aadhaar validation
  body('aadhaar')
    .trim()
    .notEmpty()
    .withMessage('Aadhaar number is required')
    .isLength({ min: 12, max: 12 })
    .withMessage('Aadhaar number must be exactly 12 digits')
    .matches(/^\d{12}$/)
    .withMessage('Aadhaar number must contain only digits')
    .custom((value) => {
      // Basic Aadhaar validation - check if not all same digits
      if (/^(\d)\1{11}$/.test(value)) {
        throw new Error('Aadhaar number cannot be all the same digit');
      }
      return true;
    }),

  // Name validation (optional)
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  // Apply validation error handler
  handleValidationErrors
];

/**
 * Login Validation Rules
 */
const validateLogin = [
  // Email validation
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),

  // Password validation
  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  // Apply validation error handler
  handleValidationErrors
];

/**
 * Optional: Profile Update Validation (if needed later)
 */
const validateProfileUpdate = [
  // Name validation (optional)
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  // Email validation (if updating email)
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),

  // Apply validation error handler
  handleValidationErrors
];

/**
 * Optional: Password Change Validation (if needed later)
 */
const validatePasswordChange = [
  // Current password
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  // New password
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .isLength({ max: 128 })
    .withMessage('Password cannot exceed 128 characters')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),

  // Apply validation error handler
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  handleValidationErrors
};