/**
 * Request validation utility using Joi
 * 
 * This module provides middleware to validate requests against schemas.
 */
const Joi = require('joi');

/**
 * Generate validation middleware for different request parts
 * @param {object} schema - Joi schema for validation
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true, // Remove unknown fields
      errors: {
        wrap: {
          label: false // Don't wrap labels in quotes
        }
      }
    });
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        message: detail.message,
        path: detail.path.join('.')
      }));
      
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Validation Error',
        errors: errorDetails
      });
    }
    
    // Replace request data with validated and sanitized data
    req[property] = value;
    return next();
  };
};

/**
 * Common validation schemas
 */
const schemas = {
  // Pagination schema
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('DESC')
  }),
  
  // UUID schema
  id: Joi.object({
    id: Joi.string().guid({ version: 'uuidv4' }).required()
  }),
  
  // Add more common schemas as needed
};

module.exports = {
  validate,
  schemas,
};
