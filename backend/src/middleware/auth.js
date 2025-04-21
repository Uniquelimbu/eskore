// src/middleware/auth.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');
const logger = require('../utils/logger');

/**
 * requireAuth:
 * Checks for a valid JWT in cookies or Authorization header.
 * If valid, attaches decoded payload (user info) to req.user.
 * If invalid, returns 401.
 */
function requireAuth(req, res, next) {
  try {
    let token;
    
    // Log authentication details for debugging
    logger.debug('Auth check - Headers:', {
      cookies: Object.keys(req.cookies || {}),
      hasAuthHeader: !!req.headers.authorization,
      method: req.method,
      path: req.path
    });
    
    // First check for cookie (preferred method)
    if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
      logger.debug('Using token from cookie');
    } 
    // Fall back to Authorization header
    else if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      
      // Handle Bearer token format
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        logger.debug('Using token from Authorization header');
      } else {
        logger.warn('Malformed Authorization header:', authHeader);
        throw new ApiError('Malformed authorization header', 401, 'UNAUTHORIZED');
      }
    }
    
    // No token found
    if (!token) {
      logger.warn('No authentication token found');
      throw new ApiError('No token provided', 401, 'UNAUTHORIZED');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret');
    
    // Attach the decoded user data to the request object
    req.user = decoded; 
    
    // Log the decoded token information
    logger.debug('Authentication successful:', {
      userId: decoded.userId,
      role: decoded.role
    });
    
    return next();
  } catch (error) {
    logger.warn(`Authentication failed: ${error.message}`);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new ApiError('Invalid or expired token', 401, 'TOKEN_INVALID'));
    }
    
    return next(error);
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
 * requireRole:
 * Middleware factory to check for specific roles
 * @param {string|Array} roles - Single role or array of allowed roles
 * @returns {function} Express middleware
 */
function requireRole(roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    requireAuth(req, res, (err) => {
      if (err) return next(err);
      
      if (req.user && allowedRoles.includes(req.user.role)) {
        return next();
      }
      
      logger.warn(`Role-based access denied for user ${req.user.id} at ${req.path} - Required: ${allowedRoles.join(', ')}, Found: ${req.user.role}`);
      return next(new ApiError('Forbidden - Insufficient permissions', 403, 'FORBIDDEN'));
    });
  };
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

module.exports = {
  requireAuth,
  requireAdmin,
  requireRole,
  requireAthleteAdmin  // Add the new middleware
};
