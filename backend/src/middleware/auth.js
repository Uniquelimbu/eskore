// src/middleware/auth.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');
const logger = require('../utils/logger');
const User = require('../models/User');
const Athlete = require('../models/Athlete');
const Team = require('../models/Team');
const Manager = require('../models/Manager');
const { sanitizeUserData } = require('../utils/userUtils'); // Import sanitizeUserData

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

/**
 * requireAuth:
 * Middleware to verify JWT token from Authorization header or cookie.
 * Decodes token, finds user based on role, attaches sanitized user to req.user.
 */
async function requireAuth(req, res, next) {
  let token;

  // 1. Extract token from Authorization header or cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token) {
    // No token found, user is not authenticated
    return next(new ApiError('Authentication required', 401, 'NO_TOKEN'));
  }

  try {
    // 2. Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET);
    logger.debug(`Token decoded: userId=${decoded.userId}, role=${decoded.role}`);

    if (!decoded.userId || !decoded.role) {
      // Token is invalid or doesn't contain required fields
      throw new ApiError('Invalid token payload', 401, 'INVALID_TOKEN');
    }

    // 3. Fetch user based on role from token
    let userInstance = null;
    const userId = decoded.userId;
    const role = decoded.role; // Role from the token

    // TODO: In the future, this can be simplified to only check the User table
    // once all athlete/manager/team data is migrated
    switch (role) {
      case 'user':
      case 'admin':
      case 'athlete_admin':
        userInstance = await User.findByPk(userId, { 
          attributes: [...commonAttributes, 'role', 'firstName', 'lastName', 'dob', 'height', 'position', 'country'] 
        });
        break;
      case 'athlete':
        userInstance = await Athlete.findByPk(userId, { attributes: [...commonAttributes, ...nameAttributes, 'position', 'country'] });
        break;
      case 'team':
        userInstance = await Team.findByPk(userId, { attributes: [...commonAttributes, 'name', 'logoUrl'] });
        break;
      case 'manager':
        userInstance = await Manager.findByPk(userId, { attributes: [...commonAttributes, ...nameAttributes, 'teamId'] });
        break;
      default:
        logger.warn(`Authentication failed: Unknown role in token: ${role}`);
        throw new ApiError('Invalid user role in token', 401, 'INVALID_ROLE');
    }

    if (!userInstance) {
      logger.warn(`Authentication failed: User not found for id=${userId}, role=${role}. Token might be stale.`);
      // Clear potentially invalid cookie
      res.clearCookie('auth_token', { path: '/' }); // Use basic clearing options
      throw new ApiError('User not found or invalid token', 401, 'USER_NOT_FOUND');
    }

    // 4. Attach SANITIZED user data to req.user
    // Use sanitizeUserData, passing the role from the TOKEN to ensure correct sanitization logic
    req.user = sanitizeUserData(userInstance.toJSON(), role);

    // Double-check sanitization result
    if (!req.user) {
        logger.error(`Authentication failed: Could not sanitize user data for id=${userId}, role=${role}`);
        throw new ApiError('Internal server error during authentication', 500, 'AUTH_SANITIZE_ERROR');
    }

    // Ensure the role attached matches the token's role for consistency
    req.user.role = role;

    logger.debug(`User authenticated: id=${req.user.id}, role=${req.user.role}`);
    next(); // Proceed to the next middleware or route handler

  } catch (error) {
    // Handle JWT errors specifically
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      logger.warn(`Authentication failed: Invalid or expired token: ${error.message}`);
      res.clearCookie('auth_token', { path: '/' }); // Clear bad token cookie
      return next(new ApiError('Invalid or expired token', 401, 'INVALID_TOKEN'));
    }
    // Handle known ApiErrors
    if (error instanceof ApiError) {
      return next(error);
    }
    // Handle unexpected errors
    logger.error(`Unexpected authentication error: ${error.message}`, error);
    return next(new ApiError('Authentication failed due to an internal error', 500, 'AUTH_ERROR'));
  }
}

/**
 * requireAdmin:
 * Extends requireAuth (user must be authenticated) AND checks user's role.
 * Only allows if user.role === "admin".
 */
function requireAdmin(req, res, next) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    
    // Check admin role
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    
    logger.warn(`Admin access denied for user ${req.user.id} at ${req.path}`);
    return next(new ApiError('Forbidden - Admins only', 403, 'FORBIDDEN'));
  });
}

/**
 * requireAthleteAdmin:
 * Middleware to check for admin or athlete_admin role
 */
function requireAthleteAdmin(req, res, next) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    
    // Check for admin or athlete_admin role
    if (req.user && (req.user.role === 'admin' || req.user.role === 'athlete_admin')) {
      return next();
    }
    
    logger.warn(`Athlete Admin access denied for user ${req.user.id} with role ${req.user.role}`);
    return next(new ApiError('Forbidden - Athlete Admins only', 403, 'FORBIDDEN'));
  });
}

module.exports = { requireAuth, requireAdmin, requireAthleteAdmin };
