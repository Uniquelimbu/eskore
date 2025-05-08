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
  logger.info(`AUTH.JS (requireAuth): ENTERING for ${req.method} ${req.originalUrl}`);
  
  try {
    const authHeader = req.headers.authorization;
    // Also check cookies if you pass tokens via cookies
    const tokenFromCookie = req.cookies?.auth_token; 
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      logger.info('AUTH.JS (requireAuth): Token found in Authorization header.');
    } else if (tokenFromCookie) {
      token = tokenFromCookie;
      logger.info('AUTH.JS (requireAuth): Token found in cookies.');
    } else {
      logger.warn('AUTH.JS (requireAuth): No token found in Authorization header or cookies.');
      return next(new ApiError('Authentication token is required. Please log in.', 401, 'UNAUTHORIZED'));
    }

    logger.info(`AUTH.JS (requireAuth): Token extracted: ${token ? token.substring(0, 20) + '...' : 'N/A'}`);

    const decoded = jwt.verify(token, JWT_SECRET);
    logger.info(`AUTH.JS (requireAuth): Token decoded successfully. Payload: ${JSON.stringify(decoded)}`);

    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: Role,
        attributes: ['name'], // Only need role names
        through: { attributes: [] } // Don't need attributes from the join table UserRole
      }]
    });

    if (!user) {
      logger.warn(`AUTH.JS (requireAuth): User not found in DB for decoded userId: ${decoded.userId}.`);
      return next(new ApiError('User associated with this token not found. Access denied.', 401, 'UNAUTHORIZED'));
    }

    const userRoles = user.Roles ? user.Roles.map(role => role.name) : [];
    
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: userRoles,
      // Determine a primary role. Use the first role from the Roles association, then user.role, then 'user'.
      role: userRoles.length > 0 ? userRoles[0] : (user.role || 'user')
    };
    
    logger.info(`AUTH.JS (requireAuth): User ${req.user.email} (ID: ${req.user.id}) authenticated with primary role: ${req.user.role} and all roles: [${userRoles.join(', ')}]. Calling next().`);
    return next();
  } catch (error) {
    logger.error(`AUTH.JS (requireAuth): JWT verification or user fetch error: ${error.name} - ${error.message}`, error.stack);
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError('Your session has expired. Please log in again.', 401, 'TOKEN_EXPIRED'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError('Invalid authentication token. Please log in again.', 401, 'INVALID_TOKEN'));
    }
    // For other errors during the process
    return next(new ApiError('Authentication failed due to a server error.', 500, 'AUTH_SERVER_ERROR'));
  }
}

/**
 * requireRole:
 * Middleware to check if user has a specific role or array of roles
 * @param {string|string[]} roles - Role(s) to check
 */
function requireRole(roles) {
  return (req, res, next) => {
    logger.info(`AUTH.JS (requireRole): ENTERING for ${req.method} ${req.originalUrl}. Required roles: [${roles.join(', ')}]`);

    if (!req.user || !req.user.roles || !Array.isArray(req.user.roles)) {
      logger.warn('AUTH.JS (requireRole): User object or user.roles array not found on request. This indicates an issue with requireAuth or how it sets req.user.');
      return next(new ApiError('Authentication information is missing or incomplete.', 401, 'UNAUTHORIZED'));
    }

    logger.info(`AUTH.JS (requireRole): User roles: [${req.user.roles.join(', ')}]. Checking against required: [${roles.join(', ')}]`);

    const hasRequiredRole = roles.some(role => req.user.roles.includes(role));

    if (!hasRequiredRole) {
      logger.warn(`AUTH.JS (requireRole): User ${req.user.email} (ID: ${req.user.id}) does NOT have any of the required roles: [${roles.join(', ')}]. Access denied.`);
      return next(new ApiError('Forbidden: You do not have the necessary permissions for this action.', 403, 'FORBIDDEN'));
    }
    
    logger.info(`AUTH.JS (requireRole): User ${req.user.email} (ID: ${req.user.id}) HAS a required role. Access granted. Calling next().`);
    next();
  };
}

/**
 * requireOrganizer:
 * Middleware to check for organizer role (for tournament creation)
 */
function requireOrganizer(req, res, next) {
  return requireRole(['organizer'])(req, res, next);
}

/**
 * requireTeamManager:
 * Middleware to check for team manager role
 */
function requireTeamManager(req, res, next) {
  return requireRole(['manager'])(req, res, next);
}

module.exports = { 
  requireAuth, 
  requireOrganizer,
  requireTeamManager,
  requireRole
};
