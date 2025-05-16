/**
 * Route Error Handler Middleware
 * 
 * Catches errors in route handlers to prevent unhandled promise rejections
 * and Express middleware chain issues.
 */
const logger = require('../utils/logger');
const { ApiError } = require('./errorHandler');

/**
 * Wraps async route handlers to catch unhandled promise rejections
 * 
 * @param {Function} handler - The route handler function to wrap
 * @returns {Function} Wrapped handler that forwards errors to Express error middleware
 */
const asyncHandler = (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      // Pass error to next middleware
      next(error);
    }
  };
};

/**
 * Express middleware to handle and log route errors
 */
const routeErrorHandler = (err, req, res, next) => {
  const requestId = req.requestId || 'unknown';
  
  // Log route error details
  logger.error(`Route error [${requestId}]: ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    statusCode: err.status || err.statusCode || 500,
    errorName: err.name,
    errorCode: err.code
  });
  
  // Forward to the next error handler
  next(err);
};

/**
 * Handler for 404 API routes
 */
const apiNotFoundHandler = (req, res, next) => {
  const requestId = req.requestId || 'unknown';
  logger.warn(`API 404 [${requestId}]: ${req.method} ${req.originalUrl}`);
  
  next(new ApiError('API endpoint not found', 404, 'NOT_FOUND'));
};

module.exports = {
  asyncHandler,
  routeErrorHandler,
  apiNotFoundHandler
};
