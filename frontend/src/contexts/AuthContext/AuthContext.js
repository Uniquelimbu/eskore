import React, { createContext, useReducer, useEffect, useRef } from 'react';
import { authReducer } from './authReducer';
import { initialState } from './constants/authConstants';
import { 
  initializeAuth, 
  loginUser, 
  logoutUser, 
  registerUser, 
  verifyUserData,
  updateUserProfile,
  changePassword
} from './authActions';
import { checkUserRole, checkUserAnyRole } from './utils/authValidation';
import { getStoredToken, clearAllAuthStorage } from './utils/tokenManager';
import { isTokenExpired } from './utils/authHelpers';

// Create context
export const AuthContext = createContext(initialState);

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const tokenCheckInterval = useRef(null);
  const sessionTimeoutRef = useRef(null);

  // Initialize auth state on mount
  useEffect(() => {
    const init = initializeAuth(dispatch);
    init();
  }, []);

  // Auto-logout on token expiration
  useEffect(() => {
    if (state.isAuthenticated) {
      // Start periodic token validation
      tokenCheckInterval.current = setInterval(() => {
        const token = getStoredToken();
        if (!token || isTokenExpired(token)) {
          console.log('AuthContext: Token expired, logging out');
          const logout = logoutUser(dispatch);
          logout();
        }
      }, 60000); // Check every minute

      // Set session timeout (24 hours)
      sessionTimeoutRef.current = setTimeout(() => {
        console.log('AuthContext: Session timeout, logging out');
        const logout = logoutUser(dispatch);
        logout();
      }, 24 * 60 * 60 * 1000); // 24 hours

    } else {
      // Clear intervals when not authenticated
      if (tokenCheckInterval.current) {
        clearInterval(tokenCheckInterval.current);
        tokenCheckInterval.current = null;
      }
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
    }

    return () => {
      if (tokenCheckInterval.current) clearInterval(tokenCheckInterval.current);
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    };
  }, [state.isAuthenticated]);

  // Validate auth state consistency
  useEffect(() => {
    const validateAuthState = async () => {
      if (state.isAuthenticated && (!state.user || !state.user.id)) {
        console.warn('AuthContext: Inconsistent auth state, refreshing user data');
        const verify = verifyUserData(dispatch);
        await verify(true, state.user);
      }
    };
    
    validateAuthState();
  }, [state.isAuthenticated, state.user]);

  // Handle browser tab visibility change - refresh token when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && state.isAuthenticated) {
        const token = getStoredToken();
        if (token && !isTokenExpired(token)) {
          // Optionally refresh user data when tab becomes active
          const verify = verifyUserData(dispatch);
          await verify(false, state.user);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.isAuthenticated, state.user]);

  // Create action functions bound to dispatch
  const login = loginUser(dispatch);
  const logout = logoutUser(dispatch);
  const register = registerUser(dispatch);
  const verify = verifyUserData(dispatch);
  const updateProfile = updateUserProfile(dispatch);
  const changePass = changePassword(dispatch);

  // Role checking functions
  const hasRole = (role) => checkUserRole(state.user, role);
  const hasAnyRole = (roles) => checkUserAnyRole(state.user, roles);

  // Enhanced auth utilities
  const isTokenValid = () => {
    const token = getStoredToken();
    return token && !isTokenExpired(token);
  };

  const forceLogout = () => {
    console.log('AuthContext: Force logout triggered');
    clearAllAuthStorage();
    const logout = logoutUser(dispatch);
    logout();
  };

  // Refresh current user data
  const refreshUser = async (forceRefresh = false) => {
    try {
      const freshUser = await verify(forceRefresh, state.user);
      return freshUser;
    } catch (error) {
      console.error('AuthContext: Error refreshing user:', error);
      return null;
    }
  };

  const value = {
    // State
    ...state,
    
    // Core Actions
    login,
    logout,
    registerUser: register,
    verifyUserData: verify,
    
    // Profile Management Actions
    updateUserProfile: updateProfile,
    changePassword: changePass,
    refreshUser,
    
    // Role & Permission Utilities
    hasRole,
    hasAnyRole,
    
    // Token & Session Utilities
    isTokenValid,
    forceLogout,
    
    // User Info Helpers
    getUserDisplayName: () => {
      if (!state.user) return 'Unknown User';
      if (state.user.firstName && state.user.lastName) {
        return `${state.user.firstName} ${state.user.lastName}`;
      }
      return state.user.email || 'User';
    },
    
    getUserInitials: () => {
      if (!state.user) return 'U';
      if (state.user.firstName && state.user.lastName) {
        return `${state.user.firstName[0]}${state.user.lastName[0]}`.toUpperCase();
      }
      if (state.user.email) {
        return state.user.email[0].toUpperCase();
      }
      return 'U';
    },
    
    // Status checks
    isProfileComplete: () => {
      return !!(state.user?.firstName && state.user?.lastName && state.user?.email);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};