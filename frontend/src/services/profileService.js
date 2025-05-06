import apiClient from './apiClient';

const profileService = {
  // Get user profile (either current authenticated user or by ID)
  getUserProfile: async (userId) => {
    try {
      // If userId is provided, get that user's public profile
      // Otherwise get the current authenticated user's profile
      const endpoint = userId ? 
        `/api/users/${userId}/profile` : 
        `/api/users/profile`; // Endpoint for authenticated user's own profile
      
      const response = await apiClient.get(endpoint);
      return response.data; // Assuming backend sends data directly or under a 'data' key
    } catch (error) {
      console.error('Error fetching user profile:', error.response?.data || error.message);
      throw error.response?.data || error;
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
