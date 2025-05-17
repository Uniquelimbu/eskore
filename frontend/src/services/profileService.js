import apiClient from './apiClient';

const profileService = {
  // Get user profile (either current authenticated user or by ID)
  getUserProfile: async (userId) => {
    try {
      // Check for token first to prevent unnecessary API calls
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // If userId is provided, get that user's public profile
      // Otherwise get the current authenticated user's profile
      // The endpoint structure appears to be incorrect - let's fix it
      const endpoint = userId ? 
        `/api/users/${userId}` : 
        `/api/auth/me`; // Use /api/auth/me for the current user's profile
      
      console.log(`Fetching user profile from: ${endpoint}`);
      
      const response = await apiClient.get(endpoint);
      
      // The response structure might be different than expected
      if (!response) {
        throw new Error('Invalid response format from server');
      }
      
      return response; // Return the complete response
    } catch (error) {
      console.error('Error fetching user profile:', error.status, error.message);
      
      // Enhanced error handling with specific messages based on status codes
      if (error.status === 400) {
        throw new Error('Invalid request. Please check your credentials and try again.');
      } else if (error.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      } else if (error.status === 404) {
        throw new Error('User profile not found.');
      }
      
      throw error;
    }
  },
  
  // Update current authenticated user's profile
  updateUserProfile: async (profileData) => {
    try {
      // Regular profile update (non-image data)
      const response = await apiClient.put('/api/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Update current authenticated user's profile image
  updateProfileImage: async (formData) => { // formData should contain the image file
    try {
      const response = await apiClient.put('/api/users/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating profile image:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }
  // Add other profile related services if needed, e.g., for stats, activity, specific to a user
};

export default profileService;
