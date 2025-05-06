const logger = require('../utils/logger');

class ApiError extends Error {
  constructor(message, statusCode, errorCode = 'UNKNOWN', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details; // Can be an object with more specific error info (e.g., validation errors)
    Error.captureStackTrace(this, this.constructor);
  }
}

// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, next) => {
  // Log the full error details, especially for unexpected errors
  logger.error('--- GLOBAL ERROR HANDLER CAUGHT AN ERROR ---');
  logger.error(`Request: ${req.method} ${req.originalUrl}`);
  if (req.user) {
    logger.error(`User: ${req.user.email} (ID: ${req.user.id})`);
  }
  logger.error(`Error Name: ${err.name}`);
  logger.error(`Error Message: ${err.message}`);
  if (err.statusCode) logger.error(`Error StatusCode: ${err.statusCode}`);
  if (err.errorCode) logger.error(`Error ErrorCode: ${err.errorCode}`);
  if (err.details) logger.error(`Error Details: ${JSON.stringify(err.details)}`);
  
  // Always log the stack for debugging any type of error
  logger.error(`Error Stack: ${err.stack || 'No stack available'}`);
  logger.error('--- END OF GLOBAL ERROR HANDLER LOG ---');


  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      // Ensure 'errors' field is used if details are validation-like
      ...(err.details && typeof err.details === 'object' ? { errors: err.details } : null)
    });
  }

  // Specific handling for Sequelize errors if they weren't caught and wrapped earlier
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const formattedErrors = err.errors.reduce((acc, e) => {
      acc[e.path] = e.message;
      return acc;
    }, {});
    return res.status(400).json({
      success: false,
      message: err.errors.map(e => e.message).join(', ') || 'Database validation failed.',
      errorCode: 'VALIDATION_ERROR',
      errors: formattedErrors
    });
  }
  
  // For any other non-ApiError, return a generic 500
  return res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred. Our team has been notified.',
    errorCode: 'INTERNAL_SERVER_ERROR'
  });
};

const catchAsync = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(err => {
      logger.error(`CATCH_ASYNC: Error caught in async route handler for ${req.method} ${req.originalUrl}: ${err.message}`, err.stack);
      next(err); // Pass to global error handler
    });
  };
};

module.exports = {
  ApiError,
  globalErrorHandler,
  catchAsync
};