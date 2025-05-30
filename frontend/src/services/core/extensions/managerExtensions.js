import { API_URL, TIMEOUT_CONFIG } from '../config';

export const applyManagerExtensions = (apiClient) => {
  // Add explicit method for manager profile creation
  apiClient.createManagerProfile = async function(data) {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Creating manager profile with data:', data);
      console.log('Using API URL:', API_URL + '/managers');
      
      const response = await this.post('/managers', data, {
        baseURL: API_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true,
        timeout: TIMEOUT_CONFIG.MANAGER_PROFILE
      });
      
      console.log('Manager profile creation response:', response);
      return response;
    } catch (error) {
      console.error('Error creating manager profile:', error);
      throw error;
    }
  };
  
  return apiClient;
};

export default applyManagerExtensions;
