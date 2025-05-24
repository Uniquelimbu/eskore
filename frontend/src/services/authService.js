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
    
    try {
      // Call the login API
      const response = await apiClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      // Verify we received proper user data with essential fields
      if (!response.user || !response.token) {
        throw new Error('Invalid response from authentication server');
      }
      
      // If user data is incomplete, make a follow-up request for complete data
      if (!response.user.firstName || !response.user.lastName) {
        console.log('Auth service: User profile incomplete, fetching complete profile');
        
        // Set the token first so the request is authenticated
        localStorage.setItem('token', response.token);
        
        try {
          const profileResponse = await apiClient.get('/auth/me');
          
          if (profileResponse && profileResponse.id) {
            // Combine the responses, preferring the more complete data
            response.user = {
              ...response.user,
              ...profileResponse
            };
            
            // Update localStorage with complete user data
            localStorage.setItem('user', JSON.stringify(response.user));
          }
        } catch (profileError) {
          console.error('Auth service: Error fetching complete profile:', profileError);
          // Continue with incomplete data
        }
      }
      
      return response;
    } catch (error) {
      console.error('Auth service: Login error:', error);
      throw error;
    }
  },

  // Register a user with the unified user system
  registerUser: async (userData) => {
    return withRetry(async () => {
      try {
        const response = await apiClient.post('/auth/register', userData);
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
      // FIXED: Removed duplicate /api prefix
      const response = await apiClient.post('/auth/logout', {}, { 
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
    try {
      // First check localStorage for cached user data
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          
          // If we have complete user data in localStorage, use it initially
          // to prevent flickering, but still refresh in the background
          if (user && user.id && user.firstName && user.lastName) {
            // Make a background request to refresh the data
            apiClient.get('/auth/me')
              .then(updatedUser => {
                if (updatedUser && updatedUser.id) {
                  localStorage.setItem('user', JSON.stringify(updatedUser));
                }
              })
              .catch(err => {
                console.error('Background user refresh failed:', err);
              });
            
            return user;
          }
        } catch (e) {
          console.error('Error parsing user data from localStorage:', e);
        }
      }
      
      // If we don't have valid cached data, make a fresh request
      const response = await apiClient.get('/auth/me');
      
      if (response && response.id) {
        // Cache the user data for next time
        localStorage.setItem('user', JSON.stringify(response));
        return response;
      }
      
      return null;
    } catch (error) {
      if (!quietMode) {
        console.error('Error getting current user:', error);
      }
      return null;
    }
  },

  // Check if an email is already registered
  checkEmailExists: async (email) => {
    try {
      const response = await apiClient.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
      return response.exists;
    } catch (error) {
      console.error('Email check error:', error);
      return false; // Fail safe - assume email doesn't exist to allow registration attempt
    }
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    return apiClient.patch(`/users/${userId}`, profileData);
  },

  // Change password
  changePassword: async (userId, passwordData) => {
    return apiClient.post(`/users/${userId}/change-password`, passwordData);
  },

  // Reset password request
  requestPasswordReset: async (email) => {
    try {
      return await apiClient.post('/auth/reset-password-request', { email });
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
      return await apiClient.post('/auth/reset-password', { token, newPassword });
    } catch (error) {
      if (error.status === 400) {
        throw new Error("Invalid or expired reset token");
      }
      throw error;
    }
  }
};

export default authService;
