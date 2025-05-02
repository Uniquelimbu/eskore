require('dotenv').config();
const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');
const logger = require('../utils/logger');
const User = require('../models/User');
const Role = require('../models/Role');
const { sanitizeUserData } = require('../utils/userUtils');

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

/**
 * requireAuth:
 * Middleware to verify JWT token from Authorization header or cookie.
 * Decodes token, finds user in the unified User table, attaches sanitized user to req.user.
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

    // 3. Fetch user from User table
    const userInstance = await User.findByPk(decoded.userId, {
      attributes: [
        'id', 'email', 'firstName', 'lastName', 'role', 'status', 
        'dob', 'country', 'height', 'position'
      ],
      include: [{
        model: Role,
        through: { attributes: [] }, // Don't include junction table
        attributes: ['name']
      }]
    });

    if (!userInstance || userInstance.status !== 'active') {
      logger.warn(`Authentication failed: User not found or inactive for id=${decoded.userId}`);
      // Clear potentially invalid cookie
      res.clearCookie('auth_token', { path: '/' });
      throw new ApiError('User not found or inactive', 401, 'USER_NOT_FOUND');
    }

    // 4. Attach sanitized user data to req.user
    const userData = userInstance.toJSON();
    req.user = sanitizeUserData(userData, decoded.role);

    // Double-check sanitization result
    if (!req.user) {
      logger.error(`Authentication failed: Could not sanitize user data for id=${decoded.userId}`);
      throw new ApiError('Internal server error during authentication', 500, 'AUTH_SANITIZE_ERROR');
    }

    // Add roles array to user object from the included Role relationship
    if (userData.Roles && userData.Roles.length > 0) {
      req.user.roles = userData.Roles.map(role => role.name);
    } else {
      req.user.roles = [decoded.role]; // Fallback to the main role
    }

    logger.debug(`User authenticated: id=${req.user.id}, role=${req.user.role}, roles=${req.user.roles.join(',')}`);
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
 * requireRole:
 * Middleware to check if user has a specific role or array of roles
 * @param {string|string[]} roles - Role(s) to check
 */
function requireRole(roles) {
  return (req, res, next) => {
    requireAuth(req, res, (err) => {
      if (err) return next(err);
      
      const rolesToCheck = Array.isArray(roles) ? roles : [roles];
      
      // Check if user has any of the required roles
      const hasRole = req.user.roles.some(role => rolesToCheck.includes(role));
      
      if (hasRole) {
        return next();
      }
      
      logger.warn(`Role access denied for user ${req.user.id}. Required roles: ${rolesToCheck.join(',')}. User roles: ${req.user.roles.join(',')}`);
      return next(new ApiError(`Forbidden - Requires one of these roles: ${rolesToCheck.join(', ')}`, 403, 'FORBIDDEN'));
    });
  };
}

/**
 * requireAdmin:
 * Middleware to check for admin role
 */
function requireAdmin(req, res, next) {
  return requireRole('admin')(req, res, next);
}

/**
 * requireOrganizer:
 * Middleware to check for organizer role (for tournament creation)
 */
function requireOrganizer(req, res, next) {
  return requireRole(['admin', 'organizer'])(req, res, next);
}

/**
 * requireTeamManager:
 * Middleware to check for team manager role
 */
function requireTeamManager(req, res, next) {
  return requireRole(['admin', 'manager'])(req, res, next);
}

module.exports = { 
  requireAuth, 
  requireAdmin, 
  requireOrganizer,
  requireTeamManager,
  requireRole
};
