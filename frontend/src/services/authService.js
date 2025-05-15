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
    console.log("Auth service: login called with:", credentials.email);
    return withRetry(async () => {
      try {
        console.log("Auth service: sending login request to API");
        const response = await apiClient.post('/api/auth/login', credentials);
        console.log("Auth service: received login response:", response);
        
        // Validate response structure
        if (!response) {
          console.error("Auth service: Empty response received");
          throw new Error('Empty response received from server');
        }
        
        if (response && response.success && response.user) {
          console.log("Auth service: Login successful");
          // Add redirectUrl to response if not present
          if (!response.redirectUrl) {
            response.redirectUrl = '/dashboard';
          }
          return response;
        }
        
        console.error("Auth service: Invalid response format:", response);
        throw new Error(response?.message || 'Login failed: Invalid response from server');
      } catch (error) {
        console.error("Auth service: Login error:", error);
        if (error.status === 401 || error.code === 'INVALID_CREDENTIALS') {
          throw new Error("Invalid email or password.");
        } else if (error.status === 429 || error.code === 'RATE_LIMIT_EXCEEDED') {
          throw new Error("Too many login attempts. Please try again later.");
        }
        throw error instanceof Error ? error : new Error(error.message || 'Login failed');
      }
    });
  },

  // Register a user with the unified user system
  registerUser: async (userData) => {
    return withRetry(async () => {
      try {
        const response = await apiClient.post('/api/auth/register', userData);
        if (response && response.success && response.user) {
          // Store token in localStorage if it's included in the response
          if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
          }
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

  // Optimized logout with faster timeout
  logout: async () => {
    try {
      // Use a timeout to prevent long-running network calls
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2-second timeout
      
      // Send an empty object as the body instead of null
      const response = await apiClient.post('/api/auth/logout', {}, { 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      console.error('Logout API error:', error);
      return { success: true, message: 'Logged out locally' };
    }
  },

  // Improved getCurrentUser with better error handling
  getCurrentUser: async (quietMode = false) => {
    // Always add a cache-busting parameter for auth requests
    const cacheParam = `_nocache=${Date.now()}`;
    
    // Check if token exists first to avoid unnecessary API calls
    const token = localStorage.getItem('token');
    if (!token) {
      if (!quietMode) {
        console.log('Auth Service: No authentication token found, skipping getCurrentUser API call');
      }
      return null;
    }
    
    try {
      // Using cache-busting to ensure we don't get cached responses
      const response = await apiClient.get(`/api/auth/me?${cacheParam}`);
      
      // Log the actual response data for debugging
      console.log('Auth Service: /auth/me response data:', response);
      
      // Verify response has a valid user with ID
      if (!response || typeof response !== 'object') {
        console.error('Auth Service: Invalid response format from /auth/me:', response);
        return null;
      }
      
      // Check for user ID directly
      if (!response.id) {
        console.warn('Auth Service: User ID missing in /auth/me response:', response);
        
        // Fallback: If we don't have a proper user but the server accepted our token,
        // try to get stored user data from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && parsedUser.id) {
              console.warn('Auth Service: Using localStorage user data as fallback');
              return parsedUser;
            }
          } catch (parseError) {
            console.error('Auth Service: Error parsing stored user:', parseError);
          }
        }
        return null;
      }
      
      // Store the user data in localStorage
      localStorage.setItem('user', JSON.stringify(response));
      
      return response;
    } catch (error) {
      // Log the error for debugging
      if (!quietMode) {
        console.error('Auth Service: Error getting current user:', error);
        
        // Add specific logging for token issues
        if (error.status === 401) {
          console.warn('Auth Service: Invalid or expired token. Status 401 Unauthorized');
        }
      }
      
      return null;
    }
  },

  // Check if an email is already registered
  checkEmailExists: async (email) => {
    try {
      const response = await apiClient.get(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
      return response.exists;
    } catch (error) {
      console.error('Email check error:', error);
      return false; // Fail safe - assume email doesn't exist to allow registration attempt
    }
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    return apiClient.patch(`/api/users/${userId}`, profileData);
  },

  // Change password
  changePassword: async (userId, passwordData) => {
    return apiClient.post(`/api/users/${userId}/change-password`, passwordData);
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
