import apiClient from './apiClient';

const profileService = {
  // Get athlete profile
  getAthleteProfile: async (athleteId) => {
    try {
      // If athleteId is provided, get that athlete's profile
      // Otherwise get the current user's profile
      const endpoint = athleteId ? 
        `/api/athletes/${athleteId}/profile` : 
        `/api/athletes/profile`;
      
      return await apiClient.get(endpoint);
    } catch (error) {
      console.error('Error fetching athlete profile:', error);
      throw error;
    }
  },
  
  // Update athlete profile
  updateAthleteProfile: async (profileData) => {
    try {
      // Check if profileData includes file (for image upload)
      if (profileData instanceof FormData) {
        return await apiClient.put('/api/athletes/profile/image', profileData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      // Regular profile update
      return await apiClient.put('/api/athletes/profile', profileData);
    } catch (error) {
      console.error('Error updating athlete profile:', error);
      throw error;
    }
  }
};

export default profileService;
