/**
 * Centralized Error Handling Middleware
 * Handles all errors from routes and returns consistent error responses
 */

/**
 * Custom Error Classes for different error types
 */
class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  class ValidationError extends AppError {
    constructor(message) {
      super(message, 400);
      this.name = 'ValidationError';
    }
  }
  
  class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
      super(message, 401);
      this.name = 'AuthenticationError';
    }
  }
  
  class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
      super(message, 403);
      this.name = 'AuthorizationError';
    }
  }
  
  class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
      super(message, 404);
      this.name = 'NotFoundError';
    }
  }
  
  /**
   * Handle MongoDB duplicate key errors
   */
  const handleDuplicateKeyError = (error) => {
    const field = Object.keys(error.keyPattern)[0];
    const message = `${field} already exists`;
    return new ValidationError(message);
  };
  
  /**
   * Handle MongoDB validation errors
   */
  const handleValidationError = (error) => {
    const errors = Object.values(error.errors).map(err => err.message);
    const message = errors.join(', ');
    return new ValidationError(message);
  };
  
  /**
   * Handle MongoDB cast errors (invalid ID format)
   */
  const handleCastError = (error) => {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new ValidationError(message);
  };
  
  /**
   * Handle JWT errors
   */
  const handleJWTError = (error) => {
    if (error.message.includes('expired')) {
      return new AuthenticationError('Token has expired. Please login again.');
    }
    return new AuthenticationError('Invalid token. Please login again.');
  };
  
  /**
   * Main Error Handler Middleware
   * Must be used after all routes
   */
  const errorHandler = (err, req, res, next) => {
    // Set default error values
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
  
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Details:', {
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method
      });
    }
  
    // Handle specific error types
    if (err.name === 'MongoServerError' && err.code === 11000) {
      err = handleDuplicateKeyError(err);
    }
  
    if (err.name === 'ValidationError' && err.errors) {
      err = handleValidationError(err);
    }
  
    if (err.name === 'CastError') {
      err = handleCastError(err);
    }
  
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      err = handleJWTError(err);
    }
  
    // Handle express-validator errors
    if (err.array && typeof err.array === 'function') {
      const errors = err.array();
      const message = errors.map(e => e.msg).join(', ');
      err = new ValidationError(message);
    }
  
    // Send error response
    const response = {
      success: false,
      message: err.message || 'An error occurred',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };
  
    // Add error details in development mode
    if (process.env.NODE_ENV === 'development') {
      response.error = {
        name: err.name,
        statusCode: err.statusCode
      };
    }
  
    res.status(err.statusCode).json(response);
  };
  
  /**
   * Handle 404 Not Found errors
   */
  const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
  };
  
  /**
   * Async error wrapper
   * Wraps async route handlers to catch errors automatically
   */
  const asyncHandler = (fn) => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };
  
  module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError
  };