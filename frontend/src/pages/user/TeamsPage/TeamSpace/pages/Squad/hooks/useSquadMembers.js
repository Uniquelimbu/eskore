import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import apiClient from '../../../../../../../services/apiClient';
import { useAuth } from '../../../../../../../contexts/AuthContext';

const useSquadMembers = (teamId) => {
  const { isManager: contextIsManager } = useOutletContext() || {};
  const { user } = useAuth();
  
  // State variables
  const [managers, setManagers] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [team, setTeam] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isManager] = useState(contextIsManager || false);

  // Fetch team data
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        // Add leading slash for consistency
        const teamResponse = await apiClient.get(`/teams/${teamId}`);
        setTeam(teamResponse);
      } catch (err) {
        console.error('Error fetching team:', err);
        setError('Failed to load team information');
      }
    };
    
    fetchTeam();
  }, [teamId, refreshKey]);
  
  // Fetch squad members
  useEffect(() => {
    const fetchSquad = async () => {
      try {
        setLoading(true);
        console.log(`Squad: Fetching members for team ${teamId}`);
        
        // Add leading slash for consistency
        const membersUrl = `/teams/${teamId}/members`;
        console.log(`Squad: Request URL: ${membersUrl}`);
        
        const membersResponse = await apiClient.get(membersUrl, { 
          timeout: 10000 // 10 seconds timeout
        });
        console.log('Squad: Members fetched:', membersResponse);
        
        // Improved response handling with more detailed logging
        let membersArray = [];
        
        if (membersResponse && Array.isArray(membersResponse.members)) {
          membersArray = membersResponse.members;
          console.log('Squad: Found members array with', membersArray.length, 'members');
        } else if (membersResponse && typeof membersResponse === 'object') {
          // Try to find members in other properties
          if (Array.isArray(membersResponse.Users)) {
            membersArray = membersResponse.Users;
            console.log('Squad: Found members in Users property', membersArray.length, 'members');
          } else {
            console.warn('Squad: Response missing members array. Response structure:', Object.keys(membersResponse));
          }
        } else {
          console.warn('Squad: Invalid response format. Response:', membersResponse);
        }
        
        // Check if current user is a member
        const userIsMember = membersArray.some(
          member => member.userId === user.id || member.id === user.id
        );
        setIsMember(userIsMember || isManager); // If user is manager, they're definitely a member
        
        // Categorize members by role
        const managerMembers = membersArray.filter(m => 
          m.role === 'manager' || m.role === 'assistant_manager');
        const athleteMembers = membersArray.filter(m => 
          m.role === 'athlete');
        const coachMembers = membersArray.filter(m => 
          m.role === 'coach');
          
        // IMPORTANT: Ensure the current user as manager is displayed even if API response is missing them
        if (isManager && !managerMembers.some(m => m.id === user.id || m.userId === user.id)) {
          console.log('Squad: Adding current user as manager because isManager=true but user not in members list');
          managerMembers.push({
            id: user.id,
            userId: user.id,
            firstName: user.firstName || 'Team',
            lastName: user.lastName || 'Manager',
            email: user.email,
            role: 'manager'
          });
        }
        
        setManagers(managerMembers);
        setAthletes(athleteMembers);
        setCoaches(coachMembers);
        
        console.log(`Squad: Categorized ${managerMembers.length} managers, ${athleteMembers.length} athletes, ${coachMembers.length} coaches`);
      } catch (err) {
        console.error('Error fetching squad:', err);
        let errorMessage = 'Failed to load squad information. Please try again later.';
        
        if (err.status === 500) {
          errorMessage = 'The server encountered an error processing this request. Our team has been notified.';
          try {
            await apiClient.get(`/teams/${teamId}`);
          } catch (teamErr) {
            if (teamErr.status === 404) {
              errorMessage = 'This team does not exist or has been deleted.';
            }
          }
        } else if (err.status === 404) {
          errorMessage = 'Team roster not found. This team may not have any members yet.';
        } else if (err.status === 403) {
          errorMessage = 'You do not have permission to view this team\'s roster.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSquad();
  }, [teamId, user.id, isManager, user, refreshKey]);

  // Function to refresh data
  const refresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  // Handle joining team
  const handleJoinTeamSubmit = async (joinData) => {
    try {
      const joinResponse = await apiClient.post(`/teams/${teamId}/members`, {
        role: joinData.role
      });
      
      if (joinResponse && joinResponse.success) {
        if (joinData.playerData) {
          await apiClient.post('/players', {
            ...joinData.playerData,
            teamId
          });
        }
        refresh();
        return true;
      } else {
        console.error('Team join failed:', joinResponse);
        setError('Failed to join team. Please try again.');
        return false;
      }
    } catch (err) {
      console.error('Error joining team:', err);
      setError('Failed to join team: ' + (err.message || 'Unknown error'));
      return false;
    }
  };
  
  // Handle removing a member
  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member from the team?')) {
      try {
        const response = await apiClient.delete(`/teams/${teamId}/members/${memberId}`);
        if (response && response.success) {
          refresh();
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error removing team member:', err);
        setError('Failed to remove team member: ' + (err.message || 'Unknown error'));
        return false;
      }
    }
  };
  
  // Handle adding a new member
  const handleAddMemberSubmit = async (data) => {
    try {
      // This would need to be implemented with an actual API endpoint
      console.log('Adding new member:', data);
      // Refresh after successful addition
      refresh();
      return true;
    } catch (err) {
      console.error('Error adding team member:', err);
      setError('Failed to add team member: ' + (err.message || 'Unknown error'));
      return false;
    }
  };

  return {
    isLoading: loading,
    error,
    team,
    managers,
    athletes,
    coaches,
    isManager,
    isMember,
    handleJoinTeamSubmit,
    handleRemoveMember,
    handleAddMemberSubmit,
    refresh
  };
};

export default useSquadMembers;
