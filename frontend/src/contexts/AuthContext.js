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

// Updated reducer function to validate user data
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_INIT:
      // Initialize state, typically when auth check completes with no user
      return { ...initialState, loading: false };
    case AUTH_SUCCESS:
      // Enhanced validation of user payload
      const userPayload = action.payload && typeof action.payload === 'object' ? action.payload : null;
      
      // Verify the user object has an ID - if not, reject it
      if (!userPayload || !userPayload.id) {
        console.error('AuthContext: Received invalid user data (missing ID):', userPayload);
        
        // Clear token if the user data is invalid
        localStorage.removeItem('token');
        
        // Don't update the state with invalid data - reset to logged out state
        return {
          ...initialState,
          loading: false,
          error: 'Invalid user data received. Please log in again.'
        };
      }
      
      return {
        ...state,
        user: userPayload,
        loading: false,
        error: null,
        isAuthenticated: true,
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
      dispatch({ type: AUTH_LOADING });
      
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token) {
        console.log('AuthContext: No token found, initializing as logged out');
        dispatch({ type: AUTH_INIT });
        return;
      }
      
      console.log('AuthContext: Token found in localStorage, attempting to restore session');
      
      // If we have a stored user, always use it first to prevent flickering
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.id) {
            console.log('AuthContext: Restoring user from localStorage:', parsedUser.id);
            dispatch({ type: AUTH_SUCCESS, payload: parsedUser });
            
            // We still try to validate with server, but don't wait for it
            validateWithServer(token);
            return;
          }
        } catch (error) {
          console.error('AuthContext: Error parsing stored user:', error);
          localStorage.removeItem('user');
        }
      }
      
      // If no valid stored user but we have a token, validate with server
      await validateWithServer(token);
    };
    
    // Helper function to validate token with server
    const validateWithServer = async (token) => {
      try {
        console.log('AuthContext: Validating token with server...');
        const currentUser = await authService.getCurrentUser(false); // Not quiet mode
        
        if (currentUser && currentUser.id) {
          console.log('AuthContext: Token valid, user authenticated:', currentUser.id);
          
          // Update localStorage with latest user data
          localStorage.setItem('user', JSON.stringify(currentUser));
          
          dispatch({ type: AUTH_SUCCESS, payload: currentUser });
        } else {
          console.warn('AuthContext: Token validation failed, no valid user returned');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: AUTH_INIT });
        }
      } catch (error) {
        console.error('AuthContext: Error validating token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: AUTH_INIT });
      }
    };

    checkAuth();
  }, []);

  // Updated login: accept (email, password) instead of a single credentials object
  const login = async (emailOrCredentials, maybePassword) => {
    dispatch({ type: AUTH_LOADING });
    
    // Support backward-compatibility: if first arg is an object, extract fields; else treat args as email/password
    let email, password;
    
    if (typeof emailOrCredentials === 'object' && emailOrCredentials !== null) {
      // First argument is a credentials object
      email = emailOrCredentials.email;
      password = emailOrCredentials.password;
    } else {
      // First argument is email, second is password
      email = emailOrCredentials;
      password = maybePassword;
    }

    try {
      console.log('AuthContext: Logging in user', { email });
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response;
      
      // Validate that we received proper user data
      if (!user || !user.id) {
        throw new Error('Invalid user data received from server');
      }
      
      // Ensure we have complete user profile data
      let completeUserData = user;
      
      // If user data is missing essential fields, fetch the complete profile
      if (!user.firstName || !user.lastName) {
        console.log('AuthContext: User data incomplete, fetching complete profile');
        try {
          // Set token first so the request is authenticated
          localStorage.setItem('token', token);
          
          // Fetch complete user data
          const userResponse = await apiClient.get('/auth/me');
          
          if (userResponse && userResponse.id) {
            completeUserData = userResponse;
            console.log('AuthContext: Successfully fetched complete user data');
          } else {
            console.warn('AuthContext: Failed to fetch complete user data');
          }
        } catch (profileError) {
          console.error('AuthContext: Error fetching complete profile:', profileError);
          // Continue with the limited user data we have
        }
      }
      
      // Set token in localStorage
      localStorage.setItem('token', token);
      
      // Always store the most complete user object we have
      localStorage.setItem('user', JSON.stringify(completeUserData)); 
      
      // Update state with SUCCESS action
      dispatch({ type: AUTH_SUCCESS, payload: completeUserData });
      
      // After login, make a separate call to get user teams
      try {
        if (completeUserData && completeUserData.id) {
          console.log(`AuthContext: Fetching teams for newly logged in user ${completeUserData.id}`);
          // FIXED: Removed duplicate /api prefix
          const teamsResponse = await apiClient.get(`/teams/user/${completeUserData.id}`);
          
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
      
      return { success: true, user: completeUserData };
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

      // If the registration was successful
      if (registerResponse && registerResponse.success) {
        const userObject = registerResponse.user;
        
        // If we have valid user data with ID, update auth state
        if (userObject && userObject.id) {
          console.log('AuthContext: Registration successful with complete user data');
          dispatch({ type: AUTH_SUCCESS, payload: userObject });
        } else {
          console.log('AuthContext: Registration successful but no complete user data returned');
          // Just clear loading state without updating auth state
          dispatch({ type: AUTH_INIT });
        }
        
        // Return the response regardless of user data completeness
        return registerResponse;
      } else {
        console.error('AuthContext: Registration response not successful:', registerResponse);
        throw new Error(registerResponse?.message || 'Registration failed');
      }
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
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
      // FIXED: Removed duplicate /api prefix
      const teamsResponse = await apiClient.get(`/teams/user/${state.user.id}`);
      
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
  
  // Add an improved version of verifyUserData that can force a refresh
  const verifyUserData = async (forceRefresh = false) => {
    // If user data exists and is valid and we're not forcing refresh, return it
    if (state.user && state.user.id && !forceRefresh) {
      return state.user;
    }
    
    console.warn('AuthContext: User data is incomplete or missing, attempting to refresh');
    try {
      dispatch({ type: AUTH_LOADING });
      
      // Check if we have a token first
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('AuthContext: No authentication token available');
        dispatch({ type: AUTH_INIT });
        return null;
      }
      
      // Try to get current user data from API
      const response = await apiClient.get('/auth/me');
      
      if (response && response.id) {
        console.log('AuthContext: Successfully refreshed user data:', response);
        dispatch({ type: AUTH_SUCCESS, payload: response });
        return response;
      } else {
        console.error('AuthContext: Invalid user data received from server:', response);
        // Clear token to prevent infinite refresh loops
        localStorage.removeItem('token');
        dispatch({ type: AUTH_INIT });
        return null;
      }
    } catch (err) {
      console.error('AuthContext: Failed to refresh user data:', err);
      // Clear potentially invalid token
      localStorage.removeItem('token');
      dispatch({ type: AUTH_INIT });
      return null;
    }
  };

  // Validate auth state on initial load
  useEffect(() => {
    const validateAuthState = async () => {
      // If user is null but we're authenticated according to state, try refreshing
      if (state.isAuthenticated && (!state.user || !state.user.id)) {
        console.warn('AuthContext: Inconsistent auth state detected, refreshing user data');
        await verifyUserData(true);
      }
    };
    
    validateAuthState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isAuthenticated, state.user]);

  const value = {
    ...state,
    login,
    logout,
    registerUser,  // Add new registerUser function
    hasRole,
    hasAnyRole,
    refreshUserTeams, // Add this to the context
    verifyUserData, // Add this new method
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
