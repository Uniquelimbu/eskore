import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../../../../../services';
import { useAuth } from '../../../../../../../contexts/AuthContext';
import { 
  extractMembersFromResponse, 
  checkIfUserIsMember,
  processMembersByRole 
} from './utils/memberUtils';

/**
 * Hook for fetching and processing team member data
 * 
 * @param {string} teamId - ID of the team
 * @param {Object} team - Team data object
 * @param {boolean} isManager - Whether current user is a manager
 * @returns {Object} - Member data, loading state, error state and related functions
 */
const useMemberData = (teamId, team, isManager) => {
  const { user } = useAuth();
  
  // State variables
  const [managers, setManagers] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Function to refresh data
  const refresh = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);
  
  // Fetch squad members
  useEffect(() => {
    if (!teamId || !user?.id) return;
    
    const fetchSquad = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Squad: Fetching members for team ${teamId}`);
        
        // First, verify the team exists to provide better error messages
        if (!team || !team.id) {
          try {
            const teamResponse = await apiClient.get(`/teams/${teamId}`);
            if (!teamResponse || !teamResponse.id) {
              throw { status: 404, message: 'This team does not exist or has been deleted.' };
            }
          } catch (teamError) {
            if (teamError.status === 404) {
              throw { status: 404, message: 'This team does not exist or has been deleted.' };
            }
          }
        }
        
        // Implement the fetch with fallback mechanisms
        let membersResponse;
        let fetchError;
        
        try {
          // Try specialized team members method first
          membersResponse = await apiClient.getTeamMembers(teamId);
        } catch (primaryError) {
          fetchError = primaryError;
          console.warn('Primary fetch method failed, trying fallback:', primaryError);
          
          // Fallback: Try direct API call
          try {
            membersResponse = await apiClient.get(`/teams/${teamId}/members`);
            fetchError = null; // Clear error if fallback succeeds
          } catch (fallbackError) {
            console.error('Both primary and fallback methods failed:', fallbackError);
            // Keep the original error if both fail
          }
        }
        
        // If we still have an error after all attempts, throw it
        if (fetchError && !membersResponse) {
          throw fetchError;
        }
        
        console.log('Squad: Members response received:', membersResponse);
        
        // Extract members array using utility function
        const membersArray = extractMembersFromResponse(membersResponse);
        
        // Check if current user is a member
        const userIsMember = checkIfUserIsMember(membersArray, user.id);
        setIsMember(userIsMember || isManager); // If user is manager, they're definitely a member
        
        // Process members by role using utility function
        const { managerMembers, athleteMembers, coachMembers } = 
          processMembersByRole(membersArray, user, isManager);
        
        // Update state with categorized members
        setManagers(managerMembers);
        setAthletes(athleteMembers);
        setCoaches(coachMembers);
        
        console.log(`Squad: Categorized ${managerMembers.length} managers, ${athleteMembers.length} athletes, ${coachMembers.length} coaches`);
      } catch (err) {
        console.error('Error fetching squad:', err);
        let errorMessage = 'Failed to load squad information. Please try again later.';
        
        // Provide specific error messages based on status code
        if (err.status === 404) {
          errorMessage = 'Team roster not found. This team may not have any members yet.';
        } else if (err.status === 403) {
          errorMessage = 'You do not have permission to view this team\'s roster.';
        } else if (err.status === 500 || !err.status) {
          // Add retry mechanism for server errors
          try {
            // Wait a moment before retry
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('Squad: Retrying member fetch after server error');
            
            // Try a direct API call as a last resort
            const retryResponse = await apiClient.get(`/teams/${teamId}/members`, { 
              timeout: 8000 // Shorter timeout for retry
            });
            
            if (retryResponse) {
              // Process the retry response
              const membersArray = extractMembersFromResponse(retryResponse);
              
              if (membersArray.length > 0) {
                // Process with successful retry
                const userIsMember = checkIfUserIsMember(membersArray, user.id);
                setIsMember(userIsMember || isManager);
                
                const { managerMembers, athleteMembers, coachMembers } = 
                  processMembersByRole(membersArray, user, isManager);
                
                setManagers(managerMembers);
                setAthletes(athleteMembers);
                setCoaches(coachMembers);
                
                setLoading(false);
                setInitialLoad(false);
                return; // Success with retry
              }
            }
          } catch (retryError) {
            console.error('Squad: Retry also failed:', retryError);
            // Fall through to error handling
          }
          
          // If the team itself exists, show a cleaner error
          errorMessage = 'Server error loading roster. The server team has been notified. Please try again in a few moments.';
        }
        
        setError(errorMessage);
        
        // Set empty arrays so the UI can still render with no members
        setManagers([]);
        setAthletes([]);
        setCoaches([]);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };
    
    fetchSquad();
  }, [teamId, user?.id, isManager, refreshKey, team]);

  return {
    managers,
    athletes,
    coaches,
    loading,
    initialLoad,
    error,
    isMember,
    refresh
  };
};

export default useMemberData;
