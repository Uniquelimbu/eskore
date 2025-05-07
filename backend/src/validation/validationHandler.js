const { validationResult } = require('express-validator');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Processes validation results and handles errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  
  if (errors.isEmpty()) {
    return next();
  }
  
  // Format errors as an object with arrays of error messages per field
  const formattedErrors = {};
  errors.array().forEach(error => {
    if (!formattedErrors[error.path]) {
      formattedErrors[error.path] = [error.msg];
    } else {
      formattedErrors[error.path].push(error.msg);
    }
  });
  
  logger.debug(`Validation failed for ${req.method} ${req.path}:`, formattedErrors);
  
  // Throw ApiError to be handled by the global error handler
  throw new ApiError('Validation failed. Please check your input.', 400, 'VALIDATION_ERROR', formattedErrors);
};

/**
 * Creates a validation middleware with provided schema
 * @param {Array} schema - Array of validation rules
 * @returns {Function} Express middleware
 */
const validate = (schema) => {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(schema.map(validation => validation.run(req)));
    
    // Process results
    handleValidation(req, res, next);
  };
};

module.exports = {
  validate,
  handleValidation
};
