const logger = require('../utils/logger');

/**
 * Centralized error handler middleware with improved handling for recursion-related errors
 */
exports.errorHandler = (err, req, res, next) => {
  // Check for JSON serialization errors
  const isSerializationError = err.message && (
    err.message.includes('circular') || 
    err.message.includes('string length') ||
    err.message.includes('too large')
  );
  
  if (isSerializationError) {
    console.error('Serialization error detected:', err.message);

    // Send a basic response with minimal properties
    res.status(500).setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      error: {
        message: 'Failed to process response data',
        code: 'SERIALIZATION_ERROR',
        path: req.path
      }
    }));
  }
  
  // Log error safely - prevent circular reference issues
  try {
    const safeErrorLog = {
      message: err.message,
      code: err.code || 'INTERNAL_ERROR',
      statusCode: err.statusCode || 500,
      path: req.path,
      method: req.method,
      requestId: req.id,
      userId: req.user?.id,
    };

    // Only include these in development
    if (process.env.NODE_ENV === 'development') {
      safeErrorLog.stack = err.stack;
      safeErrorLog.body = req.method !== 'GET' ? req.body : undefined;
      safeErrorLog.params = req.params;
      safeErrorLog.query = req.query;
    }

    logger.error(safeErrorLog);
  } catch (logError) {
    console.error('Failed to log error:', logError.message);
    // Continue with the response - logging shouldn't stop error handling
  }

  // Determine status code (default to 500 if not specified)
  const statusCode = err.statusCode || 500;
  
  // Error response structure
  const errorResponse = {
    success: false,
    error: {
      message: statusCode === 500 && process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message || 'Something went wrong',
      code: err.code || 'INTERNAL_ERROR',
    }
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Send the response with safety checks
  try {
    res.status(statusCode).json(errorResponse);
  } catch (responseError) {
    // If we can't even JSON stringify the error response, use a direct string approach
    console.error('Failed to send error response:', responseError.message);
    res.status(500).setHeader('Content-Type', 'application/json');
    res.end('{"error":{"message":"Internal server error","code":"RESPONSE_FAILED"}}');
  }
};

/**
 * Custom error class with status code
 */
exports.ApiError = class ApiError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
};

/**
 * Catch async errors in route handlers (eliminates try-catch blocks)
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
exports.catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
