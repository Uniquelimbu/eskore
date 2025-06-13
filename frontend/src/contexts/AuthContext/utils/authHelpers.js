/**
 * Authentication helper functions
 */

/**
 * Check if token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    return payload.exp < now;
  } catch (error) {
    console.error('AuthHelpers: Error parsing token:', error);
    return true;
  }
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error('AuthHelpers: Error parsing token expiration:', error);
    return null;
  }
};

/**
 * Get user ID from token
 */
export const getUserIdFromToken = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.sub || payload.id;
  } catch (error) {
    console.error('AuthHelpers: Error extracting user ID from token:', error);
    return null;
  }
};

/**
 * Format user display name
 */
export const formatUserDisplayName = (user) => {
  if (!user) return 'Unknown User';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.firstName) {
    return user.firstName;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return `User ${user.id}`;
};

/**
 * Get user initials for avatar
 */
export const getUserInitials = (user) => {
  if (!user) return 'U';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  
  if (user.firstName) {
    return user.firstName[0].toUpperCase();
  }
  
  if (user.email) {
    return user.email[0].toUpperCase();
  }
  
  return 'U';
};

/**
 * Check if user profile is complete
 */
export const isProfileComplete = (user) => {
  if (!user) return false;
  
  const requiredFields = ['firstName', 'lastName', 'email'];
  return requiredFields.every(field => user[field] && user[field].trim() !== '');
};

/**
 * Generate secure password validation
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
    return { valid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
};

/**
 * Calculate password strength
 */
const calculatePasswordStrength = (password) => {
  if (!password) return 0;
  
  let strength = 0;
  
  // Length bonus
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 25;
  
  // Character variety bonus
  if (/[a-z]/.test(password)) strength += 12.5;
  if (/[A-Z]/.test(password)) strength += 12.5;
  if (/\d/.test(password)) strength += 12.5;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 12.5;
  
  return Math.min(100, strength);
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  
  return { valid: true };
};

/**
 * Format last login time
 */
export const formatLastLogin = (lastLogin) => {
  if (!lastLogin) return 'Never';
  
  const date = new Date(lastLogin);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};