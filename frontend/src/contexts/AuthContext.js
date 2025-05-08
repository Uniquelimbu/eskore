import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService'; // Assumes authService uses apiClient

// Define action types
const AUTH_INIT = 'AUTH_INIT';
const AUTH_SUCCESS = 'AUTH_SUCCESS';
const AUTH_ERROR = 'AUTH_ERROR';
const AUTH_LOGOUT = 'AUTH_LOGOUT';
const AUTH_LOADING = 'AUTH_LOADING';

// Initial state
const initialState = {
  user: null,
  loading: false, // Change this to false initially
  error: null,
  isAuthenticated: false
};

// Reducer function to manage state updates
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_INIT:
      // Initialize state, typically when auth check completes with no user
      return { ...initialState, loading: false };
    case AUTH_SUCCESS:
      // Ensure payload is the user object itself
      const userPayload = action.payload && typeof action.payload === 'object' ? action.payload : null;
      return {
        ...state,
        user: userPayload, // Store the user object directly
        loading: false,
        error: null,
        isAuthenticated: !!userPayload, // Set isAuthenticated based on userPayload presence
      };
    case AUTH_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        // Keep user potentially, but mark as not authenticated if error implies it
        // isAuthenticated: false // Consider if errors should always de-authenticate
      };
    case AUTH_LOGOUT:
      return {
        ...initialState, // Reset to initial state on logout
        loading: false, // Ensure loading is false after logout
      };
    case AUTH_LOADING:
      return { ...state, loading: true, error: null };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext(initialState);

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Updated logout function for immediate response
  const logout = () => {
    // Clear auth state immediately
    dispatch({ type: AUTH_LOGOUT });
    
    // Send the API call in the background, don't wait for it
    authService.logout().catch(error => {
      console.error('Logout API error:', error);
      // Error already handled by returning { success: true } in authService
    });
  };

  // Effect to check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch({ type: AUTH_LOADING });
        const currentUser = await authService.getCurrentUser();

        if (currentUser && typeof currentUser === 'object') {
          dispatch({ type: AUTH_SUCCESS, payload: currentUser });
        } else {
          dispatch({ type: AUTH_INIT });
        }
      } catch (error) {
        console.error('Initial auth check error:', error.message || error);
        dispatch({ type: AUTH_INIT });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    console.log("AuthContext: login called with email:", email);
    dispatch({ type: AUTH_LOADING }); // Set loading to true
    try {
      // Add a client-side timeout to prevent hanging requests
      console.log("AuthContext: calling auth service login");
      const loginPromise = authService.login({ email, password });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login request timed out')), 10000)
      );
      
      // Race between actual login and timeout
      const loginResponse = await Promise.race([loginPromise, timeoutPromise]);
      console.log("AuthContext: received login response:", loginResponse);

      if (loginResponse && loginResponse.success && loginResponse.user) {
        console.log("AuthContext: login successful, updating state");
        dispatch({ type: AUTH_SUCCESS, payload: loginResponse.user }); // Resets loading to false
        return { success: true, redirectUrl: loginResponse.redirectUrl || '/dashboard' };
      } else {
        // This case should ideally not be reached if authService.login always throws on non-success
        const errorMessage = loginResponse?.message || 'Login failed: Unexpected response';
        console.error("AuthContext: Unexpected response format:", loginResponse);
        dispatch({ type: AUTH_ERROR, payload: errorMessage });
        throw new Error(errorMessage); // Ensure an error is thrown here
      }
    } catch (error) {
      console.error("AuthContext: Login error:", error.message || error);
      dispatch({
        type: AUTH_ERROR,
        payload: error.message || 'Login failed'
      });
      throw error;
    }
  };

  // Register user function for the unified user system
  const registerUser = async (userData) => {
    try {
      dispatch({ type: AUTH_LOADING });
      // Call the unified register API endpoint
      const registerResponse = await authService.registerUser(userData);

      if (registerResponse && registerResponse.success && registerResponse.user) {
         // Use the user data from registration response
         dispatch({ type: AUTH_SUCCESS, payload: registerResponse.user });
         return registerResponse.user; // Return the registered user data
      } else {
        throw new Error(registerResponse?.message || 'Registration failed');
      }
    } catch (error) {
      dispatch({
        type: AUTH_ERROR,
        payload: error.message || 'Registration failed'
      });
      throw error;
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!state.user) return false;
    
    // Check main role
    if (state.user.role === role) return true;
    
    // Check additional roles array if it exists
    if (state.user.roles && Array.isArray(state.user.roles)) {
      return state.user.roles.includes(role);
    }
    
    return false;
  };

  // Check if user has any of the provided roles
  const hasAnyRole = (roles) => {
    if (!state.user || !roles || !Array.isArray(roles)) return false;
    
    // Check main role
    if (roles.includes(state.user.role)) return true;
    
    // Check additional roles array if it exists
    if (state.user.roles && Array.isArray(state.user.roles)) {
      return roles.some(role => state.user.roles.includes(role));
    }
    
    return false;
  };

  const value = {
    ...state,
    login,
    logout,
    registerUser,  // Add new registerUser function
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
