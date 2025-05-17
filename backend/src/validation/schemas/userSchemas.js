const { body } = require('express-validator');

// Update the updateProfileSchema to make height, country, and bio optional
const updateProfileSchema = [
  body('firstName')
    .optional()
    .isString().withMessage('First name must be a string')
    .isLength({ min: 1, max: 100 }).withMessage('First name must be between 1 and 100 characters'),
  
  body('lastName')
    .optional()
    .isString().withMessage('Last name must be a string')
    .isLength({ min: 1, max: 100 }).withMessage('Last name must be between 1 and 100 characters'),
  
  body('dob')
    .optional()
    .isISO8601().withMessage('Date of birth must be a valid date in ISO format (YYYY-MM-DD)'),
  
  body('country')
    .optional() // Make country optional
    .isString().withMessage('Country must be a string')
    .isLength({ min: 1, max: 100 }).withMessage('Country must be between 1 and 100 characters'),
  
  body('height')
    .optional() // Make height optional
    .isNumeric().withMessage('Height must be a number')
    .customSanitizer(val => val === '' ? null : val), // Convert empty string to null
  
  body('position')
    .optional()
    .isString().withMessage('Position must be a string')
    .isLength({ min: 1, max: 50 }).withMessage('Position must be between 1 and 50 characters'),
  
  body('bio')
    .optional() // Make bio optional
    .isString().withMessage('Bio must be a string')
    .isLength({ max: 1000 }).withMessage('Bio must be less than 1000 characters')
];

module.exports = {
  updateProfileSchema,
  // ...other schemas
};