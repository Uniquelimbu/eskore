const jwt = require('jsonwebtoken');
const { requireAuth } = require('./auth');
const logger = require('../utils/logger');

/**
 * Middleware to refresh JWT tokens that are close to expiry
 * Uses a sliding window approach to extend sessions for active users
 * while maintaining security best practices
 */
function tokenRefreshMiddleware(req, res, next) {
  // Skip token refresh for non-authenticated routes or non-GET methods
  // This limits token refreshing to reading operations and reduces unnecessary processing
  if (!req.headers.authorization && !req.cookies?.auth_token || req.method !== 'GET') {
    return next();
  }
  
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    
    try {
      // Get token from request (already verified by requireAuth)
      const token = req.cookies.auth_token || 
                   (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') 
                    ? req.headers.authorization.substring(7) : null);
      
      if (!token) return next();
      
      // Decode token to check expiry
      const decodedToken = jwt.decode(token);
      if (!decodedToken) return next();
      
      // Check if token is about to expire (less than 24 hours remaining)
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const tokenExpiryTimeInSeconds = decodedToken.exp;
      const timeRemainingInSeconds = tokenExpiryTimeInSeconds - nowInSeconds;
      const refreshThreshold = 24 * 60 * 60; // 24 hours
      
      // If less than threshold remaining, issue a new token
      if (timeRemainingInSeconds < refreshThreshold) {
        logger.debug('Token refresh: Generating new token', {
          userId: decodedToken.userId,
          role: decodedToken.role,
          remainingTime: `${Math.floor(timeRemainingInSeconds/3600)}h ${Math.floor((timeRemainingInSeconds%3600)/60)}m`
        });
        
        // Generate new token with reset expiry time
        // Preserve all original claims to maintain security context
        const newToken = jwt.sign(
          {
            userId: decodedToken.userId,
            role: decodedToken.role,
            // Preserve any additional claims from original token
            ...(decodedToken.iat ? {} : decodedToken)
          },
          process.env.JWT_SECRET || 'your-default-secret',
          { expiresIn: '7d' }
        );
        
        // Set new cookie with enhanced security options
        const cookieOptions = {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/',
          // In production use strict same-site policy
          sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
          // In production require HTTPS
          secure: process.env.NODE_ENV === 'production'
        };
        
        res.cookie('auth_token', newToken, cookieOptions);
        
        // Also send token in header for API clients
        res.setHeader('X-Auth-Token', newToken);
        
        logger.info('Token refreshed successfully', { 
          userId: decodedToken.userId,
          newExpiry: new Date((nowInSeconds + 7 * 24 * 60 * 60) * 1000).toISOString()
        });
      }
    } catch (error) {
      // Non-critical error - just log and continue
      logger.error('Error in token refresh middleware:', { 
        error: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
    }
    
    next();
  });
}

module.exports = tokenRefreshMiddleware;
