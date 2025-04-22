import apiClient from './apiClient';

// Helper for retry logic
const withRetry = async (fn, maxRetries = 2, delay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Only retry on network errors or 5xx server errors
      if (
        !error.status || 
        error.status === 'Network Error' || 
        (error.status >= 500 && error.status < 600)
      ) {
        if (attempt < maxRetries) {
          console.log(`Retrying (${attempt + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
          continue;
        }
      }
      
      // Don't retry for other errors
      break;
    }
  }
  
  throw lastError;
};

const authService = {
  // Login with email and password
  login: async (credentials) => {
    return withRetry(async () => {
      try {
        return await apiClient.post('/api/auth/login', credentials);
      } catch (error) {
        // Enhanced error handling
        if (error.status === 401) {
          throw { ...error, message: "Invalid email or password" };
        } else if (error.status === 429) {
          throw { ...error, message: "Too many login attempts. Please try again later." };
        }
        throw error;
      }
    });
  },

  // Register an athlete
  registerAthlete: async (userData) => {
    return withRetry(async () => {
      try {
        return await apiClient.post('/api/auth/register/athlete', userData);
      } catch (error) {
        // Enhanced error messages based on status codes
        if (error.status === 409) {
          throw { ...error, message: "An account with this email already exists." };
        }
        throw error;
      }
    });
  },

  // Logout the current user
  logout: async () => {
    try {
      return await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      return { success: true, message: 'Logged out locally' };
    }
  },

  // Get the current user's profile
  getCurrentUser: async () => {
    return withRetry(async () => {
      try {
        return await apiClient.get('/api/auth/me');
      } catch (error) {
        // Return null instead of throwing for 401s (not authenticated)
        if (error.status === 401) {
          return null;
        }
        throw error;
      }
    });
  },
  
  // Reset password request
  requestPasswordReset: async (email) => {
    try {
      return await apiClient.post('/api/auth/reset-password-request', { email });
    } catch (error) {
      // Always return success even if email doesn't exist (security best practice)
      if (error.status === 404) {
        return { success: true, message: "If your email exists, you'll receive reset instructions" };
      }
      throw error;
    }
  },

  // Complete password reset
  resetPassword: async (token, newPassword) => {
    try {
      return await apiClient.post('/api/auth/reset-password', { token, newPassword });
    } catch (error) {
      if (error.status === 400) {
        throw { ...error, message: "Invalid or expired reset token" };
      }
      throw error;
    }
  }
};

export default authService;
