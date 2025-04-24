/**
 * Utility functions for handling user data
 */
const logger = require('./logger');

/**
 * Creates a sanitized user object safe for sending to the client.
 * Removes sensitive fields like passwords and ensures consistent structure.
 *
 * @param {Object} user - User object (plain JSON, e.g., from userInstance.toJSON())
 * @param {String} userType - Type of user (role from token: 'athlete', 'team', 'manager', 'user', 'admin', 'athlete_admin')
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

    // Add user-specific fields based on role/type, ensuring no sensitive data
    // Use optional chaining and default values for safety
    switch (userType) {
      case 'athlete':
      case 'admin': // Admins might have associated athlete data merged in
      case 'athlete_admin':
        userData.firstName = String(user.firstName || '').substring(0, 100);
        userData.lastName = String(user.lastName || '').substring(0, 100);
        userData.position = String(user.position || '').substring(0, 10);
        userData.country = String(user.country || '').substring(0, 100);
        // Add other relevant non-sensitive athlete fields if needed
        break;
      case 'team':
        userData.name = String(user.name || '').substring(0, 200);
        userData.logoUrl = String(user.logoUrl || '').substring(0, 500);
        break;
      case 'manager':
        userData.firstName = String(user.firstName || '').substring(0, 100);
        userData.lastName = String(user.lastName || '').substring(0, 100);
        userData.teamId = user.teamId ? parseInt(user.teamId, 10) : null;
        break;
      case 'user':
        // Basic user might not have extra fields, or add them if applicable
        // e.g., userData.displayName = String(user.displayName || '');
        break;
      default:
        // Unknown role, stick to base data
        break;
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
