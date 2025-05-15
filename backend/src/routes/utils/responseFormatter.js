/**
 * Standardized response formatter for API endpoints
 * 
 * This utility ensures consistent response structure across all API endpoints.
 * It handles success and error cases with proper status codes and message formatting.
 */

/**
 * Format a successful response
 * @param {object} data - The data to return
 * @param {string} message - Optional success message
 * @param {object} meta - Optional metadata (pagination, etc.)
 * @returns {object} Formatted response object
 */
const formatSuccess = (data = null, message = 'Operation successful', meta = {}) => {
  return {
    success: true,
    message,
    data,
    ...meta
  };
};

/**
 * Format an error response
 * @param {string|Error} error - Error message or Error object
 * @param {number} statusCode - HTTP status code
 * @param {string} errorCode - Optional application-specific error code
 * @returns {object} Formatted error response
 */
const formatError = (error, statusCode = 500, errorCode = null) => {
  // Extract message if error is an Error object
  const message = error instanceof Error ? error.message : error;
  
  // In production, don't expose internal errors
  const safeMessage = process.env.NODE_ENV === 'production' && statusCode >= 500
    ? 'Internal server error'
    : message;
  
  return {
    success: false,
    statusCode,
    message: safeMessage,
    errorCode: errorCode || `ERR_${statusCode}`,
    ...(process.env.NODE_ENV !== 'production' && error instanceof Error ? {
      stack: error.stack,
      name: error.name
    } : {})
  };
};

/**
 * Express middleware to standardize controller error handling
 * @param {Function} controller - Async controller function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (controller) => async (req, res, next) => {
  try {
    await controller(req, res, next);
  } catch (error) {
    console.error('Controller error:', error);
    
    // Determine appropriate status code
    let statusCode = error.statusCode || 500;
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      statusCode = 400;
    } else if (error.name === 'UnauthorizedError') {
      statusCode = 401;
    } else if (error.name === 'ForbiddenError') {
      statusCode = 403;
    }
    
    const errorResponse = formatError(error, statusCode);
    res.status(statusCode).json(errorResponse);
  }
};

module.exports = {
  formatSuccess,
  formatError,
  asyncHandler
};
