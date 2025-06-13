// Main exports
export { AuthProvider, AuthContext } from './AuthContext';
export { useAuth } from './hooks/useAuth';
export { useAuthActions } from './hooks/useAuthActions';
export { useAuthValidation } from './hooks/useAuthValidation';

// Utility exports
export * from './utils/authValidation';
export * from './utils/tokenManager';
export * from './utils/authHelpers';
export * from './constants/authConstants';

// Re-export commonly used functions
export { 
  validateUserData, 
  sanitizeUserData, 
  checkUserRole,
  checkUserAnyRole,
  isUserDataComplete 
} from './utils/authValidation';

export {
  getStoredToken,
  setStoredToken,
  clearAllAuthStorage,
  getStoredUser,
  setStoredUser
} from './utils/tokenManager';

export {
  formatUserDisplayName,
  getUserInitials,
  isTokenExpired,
  validatePassword,
  validateEmail
} from './utils/authHelpers';