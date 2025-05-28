const { body } = require('express-validator');

// Update the updateProfileSchema to remove height, position, and bio
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
    .optional()
    .isString().withMessage('Country must be a string')
    .isLength({ min: 1, max: 100 }).withMessage('Country must be between 1 and 100 characters')
];

module.exports = {
  updateProfileSchema,
  // ...other schemas
};