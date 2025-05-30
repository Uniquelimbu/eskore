import ManagerRegistrationForm from './ManagerRegistrationForm';
import { apiClient } from '../../../../../services'; // Updated import path

// Updated function to submit manager data to backend
export const submitManagerProfile = async (managerData, teamId) => {
  try {
    // Ensure we have properly formatted data
    const dataToSubmit = {
      playingStyle: managerData.playingStyle || 'balanced',
      preferredFormation: managerData.preferredFormation || '4-3-3',
      experience: managerData.experience !== undefined && managerData.experience !== '' ? 
                 parseInt(managerData.experience, 10) : 0,
      teamId
    };
    
    // Use apiClient instead of direct axios
    const response = await apiClient.post('/managers', dataToSubmit);
    
    return response;
  } catch (error) {
    console.error('Error submitting manager profile:', error);
    throw error;
  }
};

export default ManagerRegistrationForm;
