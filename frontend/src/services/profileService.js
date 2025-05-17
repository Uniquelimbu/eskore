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
      // Get the current user's ID from localStorage or context
      const userData = localStorage.getItem('user');
      let userId;
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          userId = parsedUser.id;
        } catch (e) {
          console.error('Error parsing user data from localStorage:', e);
        }
      }
      
      if (!userId) {
        // Fallback: try to get user ID from profile data
        userId = profileData.id;
      }
      
      if (!userId) {
        // If we still don't have a user ID, try to fetch it
        const currentUser = await apiClient.get('/api/auth/me');
        userId = currentUser?.id;
      }
      
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      console.log(`Updating profile for user ${userId} with data:`, profileData);
      
      // Use PATCH method on the correct endpoint with user ID
      const response = await apiClient.patch(`/api/users/${userId}`, profileData);
      
      // After successful update, update the user in localStorage to keep it in sync
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          const updatedUser = { ...parsedUser, ...profileData };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (e) {
          console.error('Error updating user data in localStorage:', e);
        }
      }
      
      return response.data || response;
    } catch (error) {
      console.error('Error updating user profile:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Update current authenticated user's profile image
  updateProfileImage: async (formData) => { // formData should contain the image file
    try {
      const responseData = await apiClient.put('/api/users/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return responseData; // apiClient.put() returns data directly
    } catch (error) {
      console.error('Error updating profile image:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }
  // Add other profile related services if needed, e.g., for stats, activity, specific to a user
};

export default profileService;
