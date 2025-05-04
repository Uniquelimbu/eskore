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
  loading: true, // Start loading initially to check auth status
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

  // Logout function (defined early to be used in checkAuth error handling)
  const logout = async () => {
    try {
      dispatch({ type: AUTH_LOADING });
      await authService.logout(); // Call API logout
    } catch (error) {
      console.error('Logout API error:', error);
      // Still proceed with local logout even if API fails
    } finally {
      // Ensure local state is always cleared on logout attempt
      dispatch({ type: AUTH_LOGOUT });
    }
  };


  // Effect to check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      // No need to dispatch loading here, initial state is loading: true
      try {
        const currentUser = await authService.getCurrentUser();

        if (currentUser && typeof currentUser === 'object') {
          // User is authenticated
          dispatch({ type: AUTH_SUCCESS, payload: currentUser });
        } else {
          // No user data returned (likely 401 handled by authService returning null)
          // Or getCurrentUser returned null/undefined explicitly
          dispatch({ type: AUTH_INIT }); // Initialize without user, loading becomes false
        }
      } catch (error) {
        // Handle errors during initial check (e.g., network error)
        console.error('Initial auth check error:', error.message || error);
        // Initialize state without user, mark loading as false
        dispatch({ type: AUTH_INIT });
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_LOADING });
      // Step 1: Call the login API endpoint
      const loginResponse = await authService.login({ email, password });

      // Check if login was successful (backend sets cookie, response has user data)
      if (loginResponse && loginResponse.success && loginResponse.user) {
        // Use the user data directly from the login response
        dispatch({ type: AUTH_SUCCESS, payload: loginResponse.user });
        
        // Ensure we redirect to the dashboard page
        return { success: true, redirectUrl: '/dashboard' };
      } else {
        throw new Error(loginResponse?.message || 'Login failed');
      }
    } catch (error) {
      // Handle errors from login API call
      dispatch({
        type: AUTH_ERROR,
        payload: error.message || 'Login failed'
      });
      throw error; // Re-throw for the component to handle if needed
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
