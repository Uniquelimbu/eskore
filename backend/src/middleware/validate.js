const { validationResult } = require('express-validator');
const { ApiError } = require('./errorHandler');
const logger = require('../utils/logger');

/**
 * Higher-order middleware to validate requests using express-validator
 * @param {Array} validations - Array of express-validator validation chains
 * @returns {Function} Express middleware that runs validations and throws if invalid
 */
const validate = (validations) => {
  return async (req, res, next) => {
    try {
      // Execute all validations
      await Promise.all(validations.map(validation => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      // Improved error formatting - group by field with detailed messages
      const formattedErrors = {};
      errors.array().forEach(error => {
        if (!formattedErrors[error.path]) {
          formattedErrors[error.path] = [error.msg];
        } else if (!formattedErrors[error.path].includes(error.msg)) {
          formattedErrors[error.path].push(error.msg);
        }
      });

      logger.debug(`Validation failed for ${req.method} ${req.originalUrl}`, formattedErrors);
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', formattedErrors);
    } catch (error) {
      if (error instanceof ApiError) {
        return next(error); // Pass ApiError to the error handler middleware
      }
      
      // Log unexpected errors with more details
      logger.error(`Unexpected validation error: ${error.message}`, {
        error: error.stack,
        path: req.path,
        method: req.method,
        body: JSON.stringify(req.body),
        user: req.user ? req.user.id : 'unauthenticated'
      });
      
      // Pass the error to the error handler middleware
      next(new ApiError('Validation processing failed', 500, 'VALIDATION_SYSTEM_ERROR'));
    }
  };
};

module.exports = validate;
