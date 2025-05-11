import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';
import apiClient from '../services/apiClient'; // Add this import

// Define action types
const AUTH_INIT = 'AUTH_INIT';
const AUTH_SUCCESS = 'AUTH_SUCCESS';
const AUTH_ERROR = 'AUTH_ERROR';
const AUTH_LOGOUT = 'AUTH_LOGOUT';
const AUTH_LOADING = 'AUTH_LOADING';

// Initial state
const initialState = {
  user: null,
  loading: true, // Change this to true initially
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
    console.log('AuthContext: Logging out user');
    // Clear auth state immediately
    dispatch({ type: AUTH_LOGOUT });
    
    // Remove localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('lastTeamId'); // Remove team ID on logout
    
    // Send the API call in the background
    authService.logout().catch(error => {
      console.error('Logout API error:', error);
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

  // Updated login: accept (email, password) instead of a single credentials object
  const login = async (emailOrCredentials, maybePassword) => {
    dispatch({ type: AUTH_LOADING });

    // Support backward-compatibility: if first arg is an object, extract fields; else treat args as email/password.
    let email, password;
    if (typeof emailOrCredentials === 'object' && emailOrCredentials !== null) {
      ({ email, password } = emailOrCredentials);
    } else {
      email = emailOrCredentials;
      password = maybePassword;
    }

    try {
      console.log('AuthContext: Logging in user', { email });
      const response = await apiClient.post('/api/auth/login', { email, password });
      const { token, user } = response;
      
      // Set token in localStorage
      localStorage.setItem('token', token);
      
      // Update state with SUCCESS action
      dispatch({ type: AUTH_SUCCESS, payload: user });
      
      // After login, make a separate call to get user teams
      try {
        if (user && user.id) {
          console.log(`AuthContext: Fetching teams for newly logged in user ${user.id}`);
          const teamsResponse = await apiClient.get(`/api/teams/user/${user.id}`);
          
          if (teamsResponse && teamsResponse.teams && teamsResponse.teams.length > 0) {
            const firstTeam = teamsResponse.teams[0];
            if (firstTeam && firstTeam.id) {
              console.log(`AuthContext: Saving team ID ${firstTeam.id} after login`);
              localStorage.setItem('lastTeamId', firstTeam.id.toString());
            }
          }
        }
      } catch (teamErr) {
        console.error('AuthContext: Error fetching user teams after login:', teamErr);
        // Non-fatal error, continue with login
      }
      
      return { success: true, user };
    } catch (err) {
      // err may come from apiClient interceptor and already be normalized {status, message, code}
      // Fall back to nested axios error shape if not.
      const errorMessage =
        err?.message ||
        err?.response?.data?.message ||
        'Failed to login. Please check your credentials.';
      
      // Dispatch error action
      dispatch({ type: AUTH_ERROR, payload: errorMessage });
      
      // Clean up localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('lastTeamId'); // Remove team ID on failed login
      
      return { success: false, error: errorMessage };
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

  // Add a utility function to ensure team state is loaded
  const refreshUserTeams = async () => {
    if (!state.user || !state.user.id) return [];
    
    try {
      console.log(`AuthContext: Refreshing teams for user ${state.user.id}`);
      const teamsResponse = await apiClient.get(`/api/teams/user/${state.user.id}`);
      if (teamsResponse && teamsResponse.teams) {
        if (teamsResponse.teams.length > 0) {
          const firstTeam = teamsResponse.teams[0];
          if (firstTeam && firstTeam.id) {
            localStorage.setItem('lastTeamId', firstTeam.id.toString());
          }
        }
        return teamsResponse.teams;
      }
      return [];
    } catch (err) {
      console.error('AuthContext: Error refreshing user teams:', err);
      return [];
    }
  };

  const value = {
    ...state,
    login,
    logout,
    registerUser,  // Add new registerUser function
    hasRole,
    hasAnyRole,
    refreshUserTeams, // Add this to the context
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
