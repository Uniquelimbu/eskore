import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';

// Define action types
const AUTH_INIT = 'AUTH_INIT';
const AUTH_SUCCESS = 'AUTH_SUCCESS';
const AUTH_ERROR = 'AUTH_ERROR';
const AUTH_LOGOUT = 'AUTH_LOGOUT';
const AUTH_LOADING = 'AUTH_LOADING';

// Initial state
const initialState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false
};

// Reducer function to manage state updates
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_INIT:
      return { ...state, loading: false, error: null };
    case AUTH_SUCCESS:
      return { 
        ...state, 
        user: action.payload, 
        loading: false, 
        error: null,
        isAuthenticated: true 
      };
    case AUTH_ERROR:
      return { 
        ...state, 
        error: action.payload, 
        loading: false 
      };
    case AUTH_LOGOUT:
      return { 
        ...state, 
        user: null, 
        loading: false, 
        error: null,
        isAuthenticated: false 
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

  // Effect to check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch({ type: AUTH_LOADING });
        const response = await authService.getCurrentUser();
        
        if (response && response.user) {
          dispatch({ type: AUTH_SUCCESS, payload: response.user });
        } else {
          dispatch({ type: AUTH_INIT });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        dispatch({ type: AUTH_INIT });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_LOADING });
      const response = await authService.login({ email, password });
      
      if (response && response.user) {
        dispatch({ type: AUTH_SUCCESS, payload: response.user });
        return response;
      } else {
        throw new Error('Login response missing user data');
      }
    } catch (error) {
      dispatch({ 
        type: AUTH_ERROR, 
        payload: error.message || 'Login failed' 
      });
      throw error;
    }
  };

  // Register athlete function
  const registerAthlete = async (userData) => {
    try {
      dispatch({ type: AUTH_LOADING });
      const response = await authService.registerAthlete(userData);
      
      if (response && (response.user || response.athlete)) {
        dispatch({ type: AUTH_SUCCESS, payload: response.user || response.athlete });
        return response;
      } else {
        throw new Error('Registration response missing user data');
      }
    } catch (error) {
      dispatch({ 
        type: AUTH_ERROR, 
        payload: error.message || 'Registration failed' 
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      dispatch({ type: AUTH_LOADING });
      await authService.logout();
      dispatch({ type: AUTH_LOGOUT });
    } catch (error) {
      // Still logout locally even if server logout fails
      dispatch({ type: AUTH_LOGOUT });
      console.error('Logout error:', error);
    }
  };

  const value = {
    ...state,
    login,
    logout,
    registerAthlete
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
