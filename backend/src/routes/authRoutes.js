const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/auth');
const logger = require('../utils/logger');
const { sanitizeUserData } = require('../utils/userUtils');
const { sendSafeJson } = require('../utils/safeSerializer');
// Import directly from the rateLimiters module
const { failedLoginLimiter } = require('../utils/rateLimiters');

// For generating tokens
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10; // used by bcrypt

// Validation middleware for user registration
const validateUserRegistration = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('dob')
    .optional()
    .custom((value) => {
      if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Date of birth must be in YYYY-MM-DD format');
      if (value) {
        const date = new Date(value);
        if (isNaN(date.getTime())) throw new Error('Date of birth is not a valid date');
        const year = date.getFullYear();
        if (year < 1900 || year > new Date().getFullYear() - 5) throw new Error('Date of birth year is out of range');
      }
      return true;
    }),
  // Removed validation for height, position, and country
  // Add validation results middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return all validation errors for better frontend UX - with standardized format
      const formattedErrors = {};
      errors.array().forEach(error => {
        if (!formattedErrors[error.path]) {
          formattedErrors[error.path] = [error.msg]; 
        } else {
          formattedErrors[error.path].push(error.msg);
        }
      });
      
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: formattedErrors
        }
      });
    }
    next();
  }
];

/**
 * POST /api/auth/register
 * Unified registration endpoint for all users
 */
router.post('/register', validateUserRegistration, catchAsync(authController.registerUser));

/**
 * POST /api/auth/login
 * Body: { "email": "...", "password": "..." }
 * Returns: { success: true, user: { ... }, redirectUrl: "..." }
 */
router.post('/login', failedLoginLimiter, catchAsync(authController.login));

/**
 * GET /api/auth/me
 * Returns the current logged-in user based on their token (populated by requireAuth middleware)
 * Returns: { id, email, role, ...other sanitized fields }
 */
router.get('/me', requireAuth, (req, res) => {
  // requireAuth middleware verifies token and attaches sanitized user data to req.user
  logger.debug(`[/me] Sending sanitized user data from req.user for UserID: ${req.user?.id}`);
  // Use sendSafeJson to ensure the response is safe, even though req.user should already be sanitized
  return sendSafeJson(res, req.user); // Send the req.user object directly
});

/**
 * POST /api/auth/logout
 * Clears the auth cookie
 * Returns: { success: true, message: "Logged out successfully" }
 */
router.post('/logout', (req, res, next) => {
  // Call controller directly, bypassing catchAsync if it handles errors internally
  authController.logout(req, res).catch(next); // Ensure potential errors are passed to error handler
});

/**
 * OAuth routes for authentication
 */
router.get('/google', catchAsync(authController.googleAuth));
router.get('/facebook', catchAsync(authController.facebookAuth));

/**
 * GET /api/auth/check-email?email=someone@example.com
 * Returns: { exists: true/false }
 * Checks User table
 */
router.get('/check-email', async (req, res) => {
  try {
    const email = String(req.query.email || '').toLowerCase().trim();
    // Basic email format validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      logger.debug(`[/check-email] Invalid email format received: ${req.query.email}`);
      return res.status(400).json({ exists: false, error: 'Invalid email format' });
    }

    // Check User table for the email
    const existingUser = await User.findOne({ 
      where: { email }, 
      attributes: ['id'] 
    });

    return res.json({ exists: existingUser !== null });

  } catch (err) {
    // Log the error for debugging, but don't leak details to the client
    logger.error('Error in /api/auth/check-email:', err);
    // Return a generic error and assume email doesn't exist to avoid blocking user
    return res.status(500).json({ exists: false, error: 'Internal server error during email check' });
  }
});

/**
 * GET /api/auth/debug
 * Returns authentication debug information (development only)
 */
if (process.env.NODE_ENV !== 'production') {
  router.get('/debug', (req, res) => {
    // Only available in non-production environments
    const cookies = req.cookies || {};
    const token = cookies.auth_token || req.headers.authorization?.split(' ')[1] || null;
    
    let decodedToken = null;
    if (token) {
      try {
        decodedToken = jwt.decode(token);
      } catch (e) {
        decodedToken = { error: 'Invalid token format' };
      }
    }
    
    return res.json({
      envMode: process.env.NODE_ENV,
      hasToken: !!token,
      decodedToken,
      cookieSettings: getCookieOptions()
    });
  });
}

module.exports = router;
