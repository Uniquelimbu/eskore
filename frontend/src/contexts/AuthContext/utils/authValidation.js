import { REQUIRED_USER_FIELDS } from '../constants/authConstants';

/**
 * Validate user data structure
 */
export const validateUserData = (user) => {
  if (!user || typeof user !== 'object') {
    return { valid: false, reason: 'User data is not an object' };
  }

  // Check required fields
  for (const field of REQUIRED_USER_FIELDS) {
    if (!user[field]) {
      return { valid: false, reason: `Missing required field: ${field}` };
    }
  }

  return { valid: true };
};

/**
 * Check if user data is complete (has optional fields)
 */
export const isUserDataComplete = (user) => {
  if (!user) return false;
  
  const validation = validateUserData(user);
  if (!validation.valid) return false;

  // Check if essential profile fields are present
  return !!(user.firstName && user.lastName);
};

/**
 * Sanitize user data for storage
 */
export const sanitizeUserData = (user) => {
  if (!user) return null;

  const validation = validateUserData(user);
  if (!validation.valid) {
    console.warn('AuthValidation: User data validation failed:', validation.reason);
    return null;
  }

  // Return clean user object with only needed fields
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    role: user.role || 'user',
    roles: user.roles || [],
    profileImageUrl: user.profileImageUrl || null,
    bio: user.bio || '',
    location: user.location || '',
    lastLogin: user.lastLogin || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    // Additional fields that might be useful
    isEmailVerified: user.isEmailVerified || false,
    preferences: user.preferences || {},
    settings: user.settings || {}
  };
};

/**
 * Check if user has specific role
 */
export const checkUserRole = (user, role) => {
  if (!user || !role) return false;
  
  // Check main role
  if (user.role === role) return true;
  
  // Check additional roles array if it exists
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.includes(role);
  }
  
  return false;
};

/**
 * Check if user has any of the provided roles
 */
export const checkUserAnyRole = (user, roles) => {
  if (!user || !roles || !Array.isArray(roles)) return false;
  
  return roles.some(role => checkUserRole(user, role));
};

/**
 * Enhanced role checking with hierarchy
 */
export const checkUserRoleHierarchy = (user, requiredRole) => {
  if (!user || !requiredRole) return false;
  
  // Define role hierarchy (higher index = higher privilege)
  const roleHierarchy = ['user', 'athlete', 'assistant_manager', 'manager', 'admin'];
  
  const userRole = user.role || 'user';
  const userRoleIndex = roleHierarchy.indexOf(userRole);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
  
  if (userRoleIndex === -1 || requiredRoleIndex === -1) {
    // If role not in hierarchy, fall back to exact match
    return checkUserRole(user, requiredRole);
  }
  
  // User has required role if their role index is >= required role index
  return userRoleIndex >= requiredRoleIndex;
};

/**
 * Check if user can perform specific action
 */
export const checkUserPermission = (user, permission, context = {}) => {
  if (!user || !permission) return false;
  
  // Define permission mappings
  const permissions = {
    'team.create': ['manager', 'admin'],
    'team.edit': ['manager', 'assistant_manager', 'admin'],
    'team.delete': ['manager', 'admin'],
    'team.view': ['athlete', 'assistant_manager', 'manager', 'admin'],
    'formation.edit': ['manager', 'assistant_manager', 'admin'],
    'formation.view': ['athlete', 'assistant_manager', 'manager', 'admin'],
    'member.add': ['manager', 'assistant_manager', 'admin'],
    'member.remove': ['manager', 'admin'],
    'stats.view': ['athlete', 'assistant_manager', 'manager', 'admin'],
    'stats.edit': ['manager', 'admin']
  };
  
  const allowedRoles = permissions[permission];
  if (!allowedRoles) {
    console.warn(`AuthValidation: Unknown permission: ${permission}`);
    return false;
  }
  
  // Check if user has any of the allowed roles
  const hasPermission = checkUserAnyRole(user, allowedRoles);
  
  // Additional context-based checks
  if (hasPermission && context.teamId && context.checkTeamMembership) {
    // This would integrate with TeamContext to verify team membership
    // For now, return the basic permission check
    return hasPermission;
  }
  
  return hasPermission;
};

/**
 * Validate user profile update data
 */
export const validateProfileUpdate = (updateData) => {
  const errors = {};
  
  if (updateData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updateData.email)) {
      errors.email = 'Invalid email format';
    }
  }
  
  if (updateData.firstName && updateData.firstName.length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  }
  
  if (updateData.lastName && updateData.lastName.length < 2) {
    errors.lastName = 'Last name must be at least 2 characters';
  }
  
  if (updateData.bio && updateData.bio.length > 500) {
    errors.bio = 'Bio must be less than 500 characters';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Check if user account is in good standing
 */
export const isAccountInGoodStanding = (user) => {
  if (!user) return false;
  
  // Check if account is not suspended/banned
  if (user.status === 'suspended' || user.status === 'banned') {
    return false;
  }
  
  // Check if email is verified (if required)
  if (user.isEmailVerified === false && user.requireEmailVerification) {
    return false;
  }
  
  return true;
};