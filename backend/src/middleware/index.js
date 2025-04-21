/**
 * Centralized exports for all middleware
 */
const { errorHandler, ApiError, catchAsync } = require('./errorHandler');
const { requestLogger, responseHandler } = require('./requestMiddleware');
const { safeJsonMiddleware } = require('./safeResponseMiddleware');
const { requireAuth, requireAdmin } = require('./auth');
const corsErrorHandler = require('./corsErrorHandler');

module.exports = {
  // Error handling
  errorHandler,
  ApiError,
  catchAsync,
  corsErrorHandler,
  
  // Request processing
  requestLogger,
  responseHandler,
  
  // Authentication
  requireAuth,
  requireAdmin,
  
  // Response safety
  safeJsonMiddleware
};
