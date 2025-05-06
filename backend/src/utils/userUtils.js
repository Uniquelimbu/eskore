/**
 * Utility functions for handling user data
 */
const logger = require('./logger');

/**
 * Sanitizes user data, removing sensitive information.
 * @param {object} user - The user object (toJSON() recommended).
 * @param {string} requestingUserRole - The role of the user making the request (e.g., 'admin', 'user', 'manager').
 * @param {boolean} isPublicProfile - Whether this is for a public profile view (more restrictive).
 * @returns {object|null} Sanitized user data or null if input is invalid.
 */
function sanitizeUserData(user, requestingUserRole = 'user', isPublicProfile = false) {
  if (!user || typeof user !== 'object') {
    logger.warn('[sanitizeUserData] Attempted to sanitize invalid user data:', user);
    return null;
  }

  const {
    password, // Always remove
    passwordHash, // Always remove
    resetPasswordToken, // Always remove
    resetPasswordExpires, // Always remove
    verificationToken, // Always remove
    // Potentially other sensitive fields internal to the system
    ...userData
  } = user;


  // Fields always allowed if they exist (core identity)
  const publicSafeData = {
    id: userData.id,
    firstName: userData.firstName,
    lastName: userData.lastName,
    middleName: userData.middleName, // Often public
    username: userData.username, // If you use usernames and they are public
    profileImageUrl: userData.profileImageUrl,
    bio: userData.bio,
    country: userData.country,
    position: userData.position, // e.g., for athletes
    // socialLinks and gameSpecificStats are complex objects, include them as is
    // if they are intended to be public or semi-public.
    socialLinks: userData.socialLinks,
    gameSpecificStats: userData.gameSpecificStats,
    createdAt: userData.createdAt, // Generally safe
    // Include 'role' (primary role) and 'Roles' (array of role objects/names)
    // if they are meant to be public or visible to certain users.
    // This might depend on `isPublicProfile` and `requestingUserRole`.
  };
  
  if (isPublicProfile) {
    // For public profiles, only return a very restricted set of fields.
    // Email is often hidden on public profiles unless explicitly shared.
    // dob, height might be sensitive.
    // status, lastLogin are usually not public.
    // Remove fields not suitable for public view from publicSafeData if necessary.
    // e.g. delete publicSafeData.email;
    // For now, assume the fields in publicSafeData are acceptable for public view.
    // If user.Roles exists, map to names for public view
    if (userData.Roles && Array.isArray(userData.Roles)) {
        publicSafeData.roles = userData.Roles.map(r => r.name || r);
    } else if (userData.role) { // Fallback to primary role if Roles array isn't populated
        publicSafeData.role = userData.role;
    }
    return publicSafeData;
  }

  // For authenticated views (not public)
  const authenticatedSafeData = {
    ...publicSafeData, // Start with public fields
    email: userData.email,
    dob: userData.dob, // Date of Birth
    height: userData.height,
    // 'role' is the primary role string, 'Roles' is the array of associated role objects/names
    role: userData.role, // Primary role string
    status: userData.status,
    lastLogin: userData.lastLogin,
    updatedAt: userData.updatedAt,
    // Add other fields visible to self or specific roles
  };

  if (userData.Roles && Array.isArray(userData.Roles)) {
    authenticatedSafeData.roles = userData.Roles.map(r => r.name || r); // Send role names
  }


  // Admin gets all non-sensitive fields from userData directly
  if (requestingUserRole === 'admin') {
    // Admins get everything that wasn't explicitly removed (password, tokens)
    // This means `userData` (which has password/tokens spread out) is mostly fine.
    // We ensure `roles` is an array of names if `Roles` was populated.
    const adminData = { ...userData }; // userData already has password/tokens removed
    if (userData.Roles && Array.isArray(userData.Roles)) {
        adminData.roles = userData.Roles.map(r => r.name || r);
    }
    return adminData;
  }
  
  // For non-admin, non-public views (e.g., user viewing their own profile)
  return authenticatedSafeData;
}

module.exports = {
  sanitizeUserData
};
