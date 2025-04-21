/**
 * Utility functions for handling user data
 */
const logger = require('./logger');

/**
 * Creates a sanitized user object safe for sending to the client
 * Removes any potentially problematic properties
 * 
 * @param {Object} user - User object from the database
 * @param {String} userType - Type of user (athlete, team, manager, user)
 * @returns {Object} Sanitized user object
 */
function sanitizeUserData(user, userType) {
  if (!user) {
    return null;
  }
  
  try {
    // Base user data (minimal safe version)
    const userData = {
      id: parseInt(user.id, 10) || 0,
      email: String(user.email || '').substring(0, 255),
      role: String(userType || '').substring(0, 50)
    };
    
    // Add user-specific fields based on role/type
    if (userType === 'athlete') {
      userData.firstName = String(user.firstName || '').substring(0, 100);
      userData.lastName = String(user.lastName || '').substring(0, 100);
      userData.position = String(user.position || '').substring(0, 10);
      // Only add essential fields (exclude binary/large fields)
    } else if (userType === 'team') {
      userData.name = String(user.name || '').substring(0, 200);
      userData.logoUrl = String(user.logoUrl || '').substring(0, 500);
    } else if (userType === 'manager') {
      userData.firstName = String(user.firstName || '').substring(0, 100);
      userData.lastName = String(user.lastName || '').substring(0, 100);
      userData.teamId = user.teamId ? parseInt(user.teamId, 10) : null;
    }
    
    return userData;
  } catch (error) {
    logger.error('Error sanitizing user data:', error);
    // Return minimal safe user object as fallback
    return {
      id: parseInt(user.id, 10) || 0,
      role: String(userType || '').substring(0, 50)
    };
  }
}

module.exports = { sanitizeUserData };
