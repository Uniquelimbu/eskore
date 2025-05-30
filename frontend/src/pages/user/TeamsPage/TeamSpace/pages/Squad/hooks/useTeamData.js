import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiClient } from '../../../../../../../services';
import { useAuth } from '../../../../../../../contexts/AuthContext';

/**
 * Hook for fetching and managing team data
 * 
 * @param {string} teamId - ID of the team to fetch
 * @returns {Object} - Team data, loading state, error state, and manager status
 */
const useTeamData = (teamId) => {
  const { isManager: contextIsManager } = useOutletContext() || {};
  const { user } = useAuth();
  
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isManager, setIsManager] = useState(contextIsManager || false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to refresh data
  const refresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  // Fetch team data
  useEffect(() => {
    const fetchTeam = async () => {
      if (!teamId || !user?.id) return;
      
      try {
        console.log(`Squad: Fetching team data for team ${teamId}`);
        const teamResponse = await apiClient.get(`/teams/${teamId}`);
        
        if (teamResponse) {
          console.log('Squad: Team data fetched successfully:', teamResponse);
          setTeam(teamResponse);
          
          // Set isManager if the user is the team creator as a fallback
          if (teamResponse.createdBy === user.id && !isManager) {
            console.log('Squad: User is team creator, setting as manager');
            setIsManager(true);
          }
        }
      } catch (err) {
        console.error('Error fetching team:', err);
        let errorMessage = 'Failed to load team information';
        
        if (err.status === 404) {
          errorMessage = 'Team not found. It may have been deleted.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeam();
  }, [teamId, user?.id, isManager, refreshKey]);

  return {
    team,
    loading,
    error,
    isManager,
    setIsManager,
    refresh
  };
};

export default useTeamData;
