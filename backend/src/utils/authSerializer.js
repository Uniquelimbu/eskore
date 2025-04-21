/**
 * Special serialization utilities for authentication operations
 * These are simplified versions optimized for security and reliability
 */
const logger = require('./logger');

/**
 * Special direct response function for auth operations
 * Completely bypasses regular serialization middleware
 * 
 * @param {object} res - Express response object
 * @param {object} data - Data to send (only primitive values) 
 * @param {number} status - HTTP status code
 * @returns {object} Express response
 */
function sendAuthResponse(res, data, status = 200) {
  try {
    // Set status and content type
    res.status(status).setHeader('Content-Type', 'application/json');
    
    // Create a very safe object with only essential fields
    const safeData = {
      success: status < 400
    };
    
    // Only add fields we're certain are safe
    if (data) {
      // Success data
      if (typeof data.message === 'string') {
        safeData.message = data.message.substring(0, 100);
      }
      
      // For successful logins, handle token correctly
      if (data.token && typeof data.token === 'string') {
        safeData.token = data.token;
      }
      
      // For user data, create a minimal safe object
      if (data.user && typeof data.user === 'object') {
        safeData.user = {};
        
        // Add common user fields
        if (data.user.id) safeData.user.id = Number(data.user.id);
        if (data.user.email) safeData.user.email = String(data.user.email).substring(0, 100);
        if (data.user.role) safeData.user.role = String(data.user.role).substring(0, 50);
        
        // Add optional fields if they exist
        if (data.user.firstName) safeData.user.firstName = String(data.user.firstName).substring(0, 50);
        if (data.user.lastName) safeData.user.lastName = String(data.user.lastName).substring(0, 50);
      }
      
      // For errors, add a minimal error object
      if (data.error && typeof data.error === 'object') {
        safeData.error = {
          message: typeof data.error.message === 'string' ? 
            data.error.message.substring(0, 100) : 
            'Unknown error'
        };
        
        if (data.error.code) {
          safeData.error.code = String(data.error.code).substring(0, 50);
        }
      }
    }
    
    // Send direct string response
    return res.end(JSON.stringify(safeData));
  } catch (error) {
    // Absolute fallback for any serialization errors
    logger.error('Auth serialization error:', error);
    return res.status(500).end('{"success":false,"message":"Internal server error"}');
  }
}

module.exports = {
  sendAuthResponse
};
