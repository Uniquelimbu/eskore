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
const { sendSafeJson } = require('../utils/safeSerializer');

// For generating tokens
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10; // used by bcrypt

// Validation middleware for athlete registration
const validateAthleteRegistration = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('dob').isDate().withMessage('Valid date of birth is required'),
  body('height').isNumeric().withMessage('Height must be a number'),
  body('position').isIn(['FW', 'MD', 'DF', 'GK']).withMessage('Valid position is required'),
  body('country').isIn(['Nepal', 'Canada']).withMessage('Country must be Nepal or Canada'),
  body('province').notEmpty().withMessage('Province is required'),
  body('city').notEmpty().withMessage('City is required'),
  
  // Add validation results middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR');
    }
    next();
  }
];

/**
 * POST /api/auth/register
 * Body: { "email": "test@example.com", "password": "secret", "role": "admin" (optional) }
 */
router.post('/register', catchAsync(async (req, res) => {
  const { email, password, role } = req.body;

  // Basic validation
  if (!email || !password) {
    throw new ApiError('Email and password required', 400, 'MISSING_CREDENTIALS');
  }

  // Check if user with the same email already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ApiError('Email is already in use', 409, 'EMAIL_IN_USE');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const newUser = await User.create({
    email,
    password: hashedPassword,
    role: role || 'user'
  });

  return res.status(201).json({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role
  });
}));

/**
 * POST /api/auth/login
 * Body: { "email": "test@example.com", "password": "secret" }
 * Returns: { token: <jwt>, user: { id, email, role } }
 */
router.post('/login', catchAsync(authController.login));

/**
 * POST /api/auth/register/athlete
 * Registers a new athlete with additional fields
 */
router.post('/register/athlete', validateAthleteRegistration, catchAsync(authController.registerAthlete));

/**
 * GET /api/auth/me
 * Returns the current logged-in user based on their token
 */
router.get('/me', requireAuth, catchAsync(async (req, res) => {
  const { userId, role } = req.user;
  
  // Create a minimal safe user object as fallback
  const safeMinimalUser = {
    id: parseInt(userId, 10) || 0,
    role: String(role).substring(0, 50)
  };
  
  try {
    let userInstance = null;
    
    // SELECT ONLY NEEDED FIELDS - this is crucial
    const selectFields = {
      athlete: ['id', 'firstName', 'lastName', 'email', 'position'],
      user: ['id', 'email', 'role'],
      team: ['id', 'name', 'email', 'logoUrl'],
      manager: ['id', 'firstName', 'lastName', 'email', 'teamId']
    };
    
    // Fetch user data based on role with minimal fields
    switch (role) {
      case 'athlete':
        userInstance = await Athlete.findByPk(userId, {
          attributes: selectFields.athlete
        });
        break;
      case 'user':
        userInstance = await User.findByPk(userId, {
          attributes: selectFields.user
        });
        break;
      case 'team':
        userInstance = await Team.findByPk(userId, {
          attributes: selectFields.team
        });
        break;
      case 'manager':
        userInstance = await Manager.findByPk(userId, {
          attributes: selectFields.manager
        });
        break;
    }
    
    if (!userInstance) {
      logger.warn(`[/me] User not found for ID: ${userId}, Role: ${role}`);
      return sendSafeJson(res, {
        success: false,
        error: { 
          message: 'User not found', 
          code: 'USER_NOT_FOUND' 
        }
      }, 404);
    }
    
    // Convert to plain object
    const userObject = userInstance.toJSON ? userInstance.toJSON() : userInstance;
    
    // Sanitize the object
    const userData = sanitizeUserData(userObject, role);
    
    if (!userData) {
      logger.error(`[/me] Failed to sanitize user data for ID: ${userId}`);
      return sendSafeJson(res, safeMinimalUser);
    }

    logger.debug('[/me] User data retrieved and sanitized successfully');
    
    // Use the safe direct JSON response
    return sendSafeJson(res, userData);
    
  } catch (error) {
    logger.error(`[/me] Error: ${error.message}`);
    return sendSafeJson(res, safeMinimalUser);
  }
}));

/**
 * POST /api/auth/logout
 * Clears the auth cookie
 */
router.post('/logout', (req, res) => {
  // Direct implementation to avoid going through catchAsync
  return authController.logout(req, res);
});

/**
 * OAuth routes for authentication
 */
router.get('/google', catchAsync(authController.googleAuth));
router.get('/facebook', catchAsync(authController.facebookAuth));

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
