/**
 * Utility functions for handling user data
 */
const logger = require('./logger');

/**
 * Creates a sanitized user object safe for sending to the client.
 * Removes sensitive fields like passwords and ensures consistent structure.
 *
 * @param {Object} user - User object (plain JSON, e.g., from userInstance.toJSON())
 * @param {String} userType - Type of user (role from token: 'user', 'admin', 'athlete_admin', etc.)
 * @returns {Object|null} Sanitized user object or null if input is invalid
 */
function sanitizeUserData(user, userType) {
  if (!user || typeof user !== 'object' || !user.id) {
    logger.warn('sanitizeUserData called with invalid input:', user);
    return null; // Return null for invalid input
  }

  try {
    // Base user data - always include id, email, role
    const userData = {
      id: parseInt(user.id, 10), // Ensure ID is number
      email: String(user.email || '').substring(0, 255),
      role: String(userType || 'user').substring(0, 50) // Use role from token/input
    };

    // Always include these fields if they exist
    if (user.firstName) userData.firstName = String(user.firstName).substring(0, 100);
    if (user.lastName) userData.lastName = String(user.lastName).substring(0, 100);
    if (user.middleName) userData.middleName = String(user.middleName).substring(0, 100);
    if (user.dob) userData.dob = user.dob;
    if (user.country) userData.country = String(user.country).substring(0, 100);
    if (user.status) userData.status = String(user.status).substring(0, 20);
    if (user.lastLogin) userData.lastLogin = user.lastLogin;
    
    // Add specific fields based on role
    if (['athlete', 'admin', 'athlete_admin', 'user'].includes(userType)) {
      if (user.height) userData.height = parseFloat(user.height);
      if (user.position) userData.position = String(user.position).substring(0, 10);
    }
    
    if (['manager', 'admin'].includes(userType)) {
      if (user.teamId) userData.teamId = parseInt(user.teamId, 10);
    }
    
    // If Roles array is included from a relationship query
    if (user.Roles && Array.isArray(user.Roles)) {
      userData.roles = user.Roles.map(role => role.name);
    }

    // Explicitly remove any password-related fields that might have slipped through
    delete userData.password;
    delete userData.passwordHash;
    
    // Remove other potentially sensitive or internal fields
    delete userData.createdAt;
    delete userData.updatedAt;

    return userData;

  } catch (error) {
    logger.error(`Error sanitizing user data for user ID ${user.id}:`, error);
    // Return minimal safe user object as fallback in case of unexpected error
    return {
      id: parseInt(user.id, 10) || 0,
      role: String(userType || 'unknown').substring(0, 50)
    };
  }
}

module.exports = { sanitizeUserData };
