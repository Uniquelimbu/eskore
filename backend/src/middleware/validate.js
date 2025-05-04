const { validationResult } = require('express-validator');
const { ApiError } = require('./errorHandler');

/**
 * Higher-order middleware to validate requests using express-validator
 * @param {Array} validations - Array of express-validator validation chains
 * @returns {Function} Express middleware that runs validations and throws if invalid
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Improved error formatting - group by field but keep all errors
    const formattedErrors = {};
    errors.array().forEach(error => {
      if (!formattedErrors[error.path]) {
        formattedErrors[error.path] = [error.msg];
      } else {
        formattedErrors[error.path].push(error.msg);
      }
    });

    throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', formattedErrors);
  };
};

module.exports = validate;
