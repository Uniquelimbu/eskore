import apiClient from './apiClient';

const authService = {
  // Login with email and password
  login: async (credentials) => {
    try {
      return await apiClient.post('/api/auth/login', credentials);
    } catch (error) {
      throw error;
    }
  },

  // Register an athlete
  registerAthlete: async (userData) => {
    try {
      return await apiClient.post('/api/auth/register/athlete', userData);
    } catch (error) {
      throw error;
    }
  },

  // Logout the current user
  logout: async () => {
    try {
      return await apiClient.post('/api/auth/logout');
    } catch (error) {
      // We still want to clear local state even if the server logout fails
      console.error('Logout error:', error);
      return { success: true, message: 'Logged out locally' };
    }
  },

  // Get the current user's profile
  getCurrentUser: async () => {
    try {
      return await apiClient.get('/api/auth/me');
    } catch (error) {
      // Return null instead of throwing for 401s (not authenticated)
      if (error.status === 401) {
        return null;
      }
      throw error;
    }
  }
};

export default authService;
