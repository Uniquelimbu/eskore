import apiClient from './apiClient';

// Helper for retry logic (keep as is or refine if needed)
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
        const response = await apiClient.post('/api/auth/login', credentials);
        if (response && response.success && response.user) {
          return response;
        }
        throw new Error(response?.message || 'Login failed: Invalid response from server');
      } catch (error) {
        if (error.status === 401 || error.code === 'INVALID_CREDENTIALS') {
          throw new Error("Invalid email or password.");
        } else if (error.status === 429 || error.code === 'RATE_LIMIT_EXCEEDED') {
          throw new Error("Too many login attempts. Please try again later.");
        }
        throw error instanceof Error ? error : new Error(error.message || 'Login failed');
      }
    });
  },

  // Register a user (replaces registerAthlete)
  registerUser: async (userData) => {
    return withRetry(async () => {
      try {
        const response = await apiClient.post('/api/auth/register', userData);
        if (response && response.success && response.user) {
          return response;
        }
        throw new Error(response?.message || 'Registration failed: Invalid response from server');
      } catch (error) {
        if (error.status === 409 || error.code === 'EMAIL_IN_USE') {
          throw new Error("An account with this email already exists.");
        } else if (error.status === 400 && error.fields) {
          const fieldErrors = Object.values(error.fields).map(e => e.msg).join(' ');
          throw new Error(`Registration failed: ${fieldErrors}`);
        }
        throw error instanceof Error ? error : new Error(error.message || 'Registration failed');
      }
    });
  },

  // Logout the current user
  logout: async () => {
    try {
      return await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
      return { success: true, message: 'Logged out locally despite API error' };
    }
  },

  // Get the current user's profile
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/api/auth/me');
      return response;
    } catch (error) {
      if (error.status === 401 || error.code === 'NO_TOKEN' || error.code === 'INVALID_TOKEN') {
        return null;
      }
      throw error instanceof Error ? error : new Error(error.message || 'Get current user failed');
    }
  },

  // Reset password request
  requestPasswordReset: async (email) => {
    try {
      return await apiClient.post('/api/auth/reset-password-request', { email });
    } catch (error) {
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
        throw new Error("Invalid or expired reset token");
      }
      throw error;
    }
  }
};

export default authService;
