/**
 * User API extensions for the API client
 */
export const applyUserExtensions = (apiClient) => {
  /**
   * Get the current authenticated user
   * 
   * @returns {Promise<Object>} - The current user data
   */
  apiClient.getCurrentUser = async function() {
    try {
      return await this.get('/auth/me');
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  };

  /**
   * Update user profile
   * 
   * @param {Object} userData - User profile data to update
   * @returns {Promise<Object>} - The updated user data
   */
  apiClient.updateUserProfile = async function(userData) {
    try {
      return await this.put('/users/profile', userData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  /**
   * Upload user profile image
   * 
   * @param {File} imageFile - The image file to upload
   * @returns {Promise<Object>} - The response with image URL
   */
  apiClient.uploadProfileImage = async function(imageFile) {
    try {
      const formData = new FormData();
      formData.append('profileImage', imageFile);
      
      return await this.post('/users/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  };

  /**
   * Get user teams
   * 
   * @returns {Promise<Array>} - The user's teams
   */
  apiClient.getUserTeams = async function() {
    try {
      return await this.get('/users/teams');
    } catch (error) {
      console.error('Error fetching user teams:', error);
      throw error;
    }
  };
};

export default applyUserExtensions;
