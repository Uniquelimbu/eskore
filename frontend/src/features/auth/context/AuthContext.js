import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/authApi';
import { saveToken, clearToken, isTokenValid } from '../../../utils/sessionUtils';
import { STORAGE_KEYS } from '../../../constants'; // Add this import

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Add this state
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Only attempt to verify token if one exists and is valid
        if (isTokenValid()) {
          const response = await authAPI.me();
          setUser(response.data);
        } else {
          // Clean up any invalid tokens
          clearToken();
        }
      } catch (error) {
        console.error('Error verifying authentication:', error);
        clearToken();
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

// Login function with improved error handling and token management
const login = async (credentials, redirectPath = '/') => {
  setLoading(true);
  try {
    // Use realApi directly for critical auth operations
    const response = await authAPI.login(credentials);
    const { token, user } = response.data;
    
    if (!token || !user) {
      throw new Error('Invalid response from server');
    }
    
    // Save token and user data
    saveToken(token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    // Update auth state
    setUser(user);
    setIsAuthenticated(true);
    
    // Determine where to redirect based on user role - simplified approach
    let targetPath = redirectPath;
    
    // Direct users to their respective role-based dashboards
    if (user.role === 'athlete' || user.role === 'athlete_admin' || user.role === 'admin') {
      // Treat all athlete-type users the same - they go to athlete dashboard
      targetPath = '/athlete/home';
    } else if (user.role === 'manager') {
      targetPath = '/manager/home';
    } else if (user.role === 'team') {
      targetPath = '/team/home';
    }
    
    return { success: true, redirectPath: targetPath };
  } catch (error) {
    // Better error handling
    let errorMessage = 'Login failed. Please check your credentials and try again.';
    
    if (error.response) {
      // Server returned an error
      const serverError = error.response.data?.error?.message || 
                          error.response.data?.message || 
                          error.response.statusText;
      errorMessage = serverError || errorMessage;
      
      // Log specific error code for debugging
      console.warn(`Login failed with code: ${error.response.data?.error?.code || 'UNKNOWN'}`);
    } else if (error.request) {
      // No response from server
      errorMessage = 'Unable to connect to server. Please check your internet connection.';
    }
    
    console.error('Authentication error:', error);
    return { success: false, error: errorMessage };
  } finally {
    setLoading(false);
  }
};

// Logout function with improved cleanup
const logout = () => {
  // Call logout API
  authAPI.logout();
  
  // Clear all auth data
  setUser(null);
  setIsAuthenticated(false);
  clearToken();
  localStorage.removeItem(STORAGE_KEYS.USER);
  
  // Redirect to home page - this should be handled by the calling component
};

  // Register function
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authAPI.register(userData);
      const { token, user: registeredUser } = response.data;
      
      saveToken(token);
      setUser(registeredUser);
      return registeredUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading,
        initialized, 
        login, 
        logout, 
        register,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};