import { useState } from 'react';
import { apiClient } from '../../../../../../../services';

/**
 * Hook for team member operations (join, remove, add)
 * 
 * @param {string} teamId - ID of the team
 * @param {boolean} isManager - Whether current user is a manager
 * @param {Function} refreshData - Function to refresh member data
 * @returns {Object} - Operations and related state
 */
const useMemberOperations = (teamId, isManager, refreshData) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Join a team with specified role and optional player data
   * 
   * @param {Object} joinData - Data for joining (role, playerData)
   * @returns {boolean} - Whether operation was successful
   */
  const handleJoinTeamSubmit = async (joinData) => {
    if (!teamId) {
      setError('Cannot join team: Missing team ID');
      return false;
    }
    
    setLoading(true);
    
    try {
      console.log('Squad: Joining team with data:', joinData);
      
      // Join the team as the specified role
      const joinResponse = await apiClient.post(`/teams/${teamId}/members`, {
        role: joinData.role
      });
      
      console.log('Squad: Join team response:', joinResponse);
      
      if (joinResponse && joinResponse.success) {
        // If player data was provided, save that as well
        if (joinData.playerData) {
          console.log('Squad: Adding player data:', joinData.playerData);
          await apiClient.post('/players', {
            ...joinData.playerData,
            teamId
          });
        }
        
        // Refresh data
        refreshData();
        return true;
      } else {
        console.error('Team join failed:', joinResponse);
        setError('Failed to join team. Please try again.');
        return false;
      }
    } catch (err) {
      console.error('Error joining team:', err);
      let errorMessage = 'Failed to join team';
      
      if (err.response?.data?.message) {
        errorMessage += `: ${err.response.data.message}`;
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Remove a member from team
   * 
   * @param {string} memberId - ID of member to remove
   * @returns {boolean} - Whether operation was successful
   */
  const handleRemoveMember = async (memberId) => {
    if (!teamId || !memberId) {
      setError('Cannot remove member: Missing team or member ID');
      return false;
    }
    
    if (!isManager) {
      setError('Only managers can remove team members');
      return false;
    }
    
    if (!window.confirm('Are you sure you want to remove this member from the team?')) {
      return false;
    }
    
    setLoading(true);
    
    try {
      console.log(`Squad: Removing member ${memberId} from team ${teamId}`);
      
      const response = await apiClient.delete(`/teams/${teamId}/members/${memberId}`);
      
      console.log('Squad: Remove member response:', response);
      
      if (response && response.success) {
        // If successful, refresh the data
        refreshData();
        return true;
      } else {
        setError('Failed to remove team member. Please try again.');
        return false;
      }
    } catch (err) {
      console.error('Error removing team member:', err);
      let errorMessage = 'Failed to remove team member';
      
      if (err.response?.data?.message) {
        errorMessage += `: ${err.response.data.message}`;
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Add a new member to team
   * 
   * @param {Object} data - New member data
   * @returns {boolean} - Whether operation was successful
   */
  const handleAddMemberSubmit = async (data) => {
    if (!teamId) {
      setError('Cannot add member: Missing team ID');
      return false;
    }
    
    if (!isManager) {
      setError('Only managers can add team members');
      return false;
    }
    
    setLoading(true);
    
    try {
      console.log('Squad: Adding new team member:', data);
      
      // API call to invite a new member
      const response = await apiClient.post(`/teams/${teamId}/invite`, {
        email: data.email,
        role: data.role
      });
      
      console.log('Squad: Add member response:', response);
      
      if (response && response.success) {
        refreshData();
        return true;
      } else {
        setError('Failed to add team member. Please try again.');
        return false;
      }
    } catch (err) {
      console.error('Error adding team member:', err);
      let errorMessage = 'Failed to add team member';
      
      if (err.response?.data?.message) {
        errorMessage += `: ${err.response.data.message}`;
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleJoinTeamSubmit,
    handleRemoveMember,
    handleAddMemberSubmit,
    clearError: () => setError(null)
  };
};

export default useMemberOperations;
