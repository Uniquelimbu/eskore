// src/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const Athlete = require('../models/Athlete');
const Team = require('../models/Team');
const Manager = require('../models/Manager');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/auth');
const logger = require('../utils/logger');
const { sanitizeUserData } = require('../utils/userUtils');
const { sendSafeJson } = require('../utils/safeSerializer'); // Use safe serializer

// For generating tokens
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10; // used by bcrypt

// Validation middleware for athlete registration
const validCountries = ['Nepal', 'Canada', 'np', 'ca'];

const validateAthleteRegistration = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('dob')
    .custom((value) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Date of birth must be in YYYY-MM-DD format');
      const date = new Date(value);
      if (isNaN(date.getTime())) throw new Error('Date of birth is not a valid date');
      const year = date.getFullYear();
      if (year < 1900 || year > new Date().getFullYear() - 5) throw new Error('Date of birth year is out of range');
      return true;
    }),
  body('height').isNumeric().withMessage('Height must be a number'),
  body('position').isIn(['FW', 'MD', 'DF', 'GK']).withMessage('Valid position is required'),
  body('country').custom((value) => {
    if (!['Nepal', 'Canada', 'United States', 'np', 'ca', 'us'].includes(value)) throw new Error('Country must be Nepal, Canada, United States, np, ca, or us');
    return true;
  }),
  // Add validation results middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return all validation errors for better frontend UX
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          fields: errors.mapped()
        }
      });
    }
    next();
  }
];

/**
 * POST /api/auth/register
 * Deprecated or for basic user roles if needed. Athlete registration uses /register/athlete.
 */
// router.post('/register', catchAsync(async (req, res) => { ... })); // Keep or remove based on needs

/**
 * POST /api/auth/login
 * Body: { "email": "...", "password": "..." }
 * Returns: { success: true, user: { ... }, redirectUrl: "..." }
 */
router.post('/login', catchAsync(authController.login));

/**
 * POST /api/auth/register/athlete
 * Registers a new athlete with additional fields
 * Returns: { success: true, message: "...", athlete: { ... } }
 */
router.post('/register/athlete', validateAthleteRegistration, catchAsync(authController.registerAthlete));

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
 * Checks User, Athlete, Team, and Manager tables.
 */
router.get('/check-email', async (req, res) => {
  try {
    const email = String(req.query.email || '').toLowerCase().trim();
    // Basic email format validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      // Return false for invalid email format, but maybe log it
      logger.debug(`[/check-email] Invalid email format received: ${req.query.email}`);
      return res.status(400).json({ exists: false, error: 'Invalid email format' });
    }

    // Check all relevant tables concurrently
    const results = await Promise.allSettled([
      User.findOne({ where: { email }, attributes: ['id'] }),
      Athlete.findOne({ where: { email }, attributes: ['id'] }),
      // Add Team and Manager if they have unique email constraints
      // Team.findOne({ where: { email }, attributes: ['id'] }),
      // Manager.findOne({ where: { email }, attributes: ['id'] }),
    ]);

    // Check if any query found a result
    const exists = results.some(result => result.status === 'fulfilled' && result.value !== null);

    return res.json({ exists });

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
    const sanitizedCookies = Object.keys(cookies).reduce((acc, key) => {
      acc[key] = key.includes('token') ? `${cookies[key].substring(0, 10)}...` : cookies[key];
      return acc;
    }, {});

    res.json({
      cookies: sanitizedCookies,
      headers: {
        authorization: req.headers.authorization ? 'Present (sanitized)' : 'Not present',
        origin: req.headers.origin,
        host: req.headers.host,
      },
      env: {
        nodeEnv: process.env.NODE_ENV || 'not set',
        jwtSecret: process.env.JWT_SECRET ? 'Set (sanitized)' : 'Not set',
        allowedOrigins: process.env.ALLOWED_ORIGINS || 'not set'
      }
    });
  });
}

module.exports = router;
