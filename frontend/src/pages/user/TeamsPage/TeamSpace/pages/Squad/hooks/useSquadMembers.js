import { useState, useEffect, useCallback } from 'react';
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
  const [initialLoad, setInitialLoad] = useState(true); // Track initial data loading
  const [error, setError] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [team, setTeam] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isManager, setIsManager] = useState(contextIsManager || false);

  // Function to refresh data
  const refresh = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);
  
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
      }
    };
    
    fetchTeam();
  }, [teamId, user?.id, isManager, refreshKey]);
  
  // Extract members from API response with robust parsing
  const extractMembersFromResponse = useCallback((response) => {
    if (!response) return [];
    
    // Try different paths where members might be located in the response
    const possiblePaths = [
      response.members,
      response.Users,
      response.data?.members,
      response.data?.Users,
      response.team?.members,
      response.team?.Users
    ];
    
    // Find the first path that contains an array of members
    for (const path of possiblePaths) {
      if (Array.isArray(path) && path.length > 0) {
        console.log(`Squad: Found ${path.length} members in response`);
        return path;
      }
    }
    
    // If no valid path is found
    console.warn('Squad: Could not find members array in response. Response structure:', 
      Object.keys(response).join(', '));
    return [];
  }, []);
  
  // Check if the current user is a member of the team
  const checkIfUserIsMember = useCallback((members, userId) => {
    if (!members || !userId) return false;
    
    // Check both possible ID fields
    return members.some(member => 
      member.userId === userId || 
      member.id === userId ||
      member.User?.id === userId
    );
  }, []);
  
  // Process member data and organize by role
  const processMembersByRole = useCallback((members, currentUser, isUserManager) => {
    if (!Array.isArray(members)) {
      console.error('Squad: Members is not an array:', members);
      return { managerMembers: [], athleteMembers: [], coachMembers: [] };
    }
    
    // Helper function to normalize member data
    const normalizeMember = (member) => {
      // Get user data which could be directly on member or nested
      const userData = member.User || member;
      return {
        id: member.id || member.userId || userData.id,
        userId: member.userId || member.id || userData.id,
        firstName: userData.firstName || member.firstName || '',
        lastName: userData.lastName || member.lastName || '',
        email: userData.email || member.email || '',
        role: member.role || userData.role || 'athlete',
        Player: member.Player || userData.Player || null,
        profileImageUrl: userData.profileImageUrl || member.profileImageUrl || null
      };
    };
    
    // Normalize and categorize all members
    const normalizedMembers = members.map(normalizeMember);
    
    // Group members by role
    const managerMembers = normalizedMembers.filter(m => 
      m.role === 'manager' || m.role === 'assistant_manager');
    const athleteMembers = normalizedMembers.filter(m => 
      m.role === 'athlete');
    const coachMembers = normalizedMembers.filter(m => 
      m.role === 'coach');
    
    // Add current user as manager if marked as manager but not in the list
    if (isUserManager && currentUser && 
        !managerMembers.some(m => m.id === currentUser.id || m.userId === currentUser.id)) {
      console.log('Squad: Adding current user as manager (not found in API response)');
      managerMembers.push({
        id: currentUser.id,
        userId: currentUser.id,
        firstName: currentUser.firstName || 'Team',
        lastName: currentUser.lastName || 'Manager',
        email: currentUser.email,
        role: 'manager'
      });
    }
    
    return { managerMembers, athleteMembers, coachMembers };
  }, []);
  
  // Fetch squad members
  useEffect(() => {
    if (!teamId || !user?.id) return;
    
    const fetchSquad = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Squad: Fetching members for team ${teamId}`);
        
        // Replace direct API call with specialized method
        const membersResponse = await apiClient.getTeamMembers(teamId);
        
        console.log('Squad: Members response received:', membersResponse);
        
        // Extract members array using robust parsing helper
        const membersArray = extractMembersFromResponse(membersResponse);
        
        // Check if current user is a member
        const userIsMember = checkIfUserIsMember(membersArray, user.id);
        setIsMember(userIsMember || isManager); // If user is manager, they're definitely a member
        
        // Process members by role using helper function
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
          // Check if the team itself exists
          try {
            const teamCheckResponse = await apiClient.get(`/teams/${teamId}`);
            if (!teamCheckResponse || !teamCheckResponse.id) {
              errorMessage = 'This team does not exist or has been deleted.';
            } else {
              errorMessage = 'Server error loading roster. The server team has been notified.';
            }
          } catch (teamErr) {
            if (teamErr.status === 404) {
              errorMessage = 'This team does not exist or has been deleted.';
            }
          }
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
  }, [teamId, user?.id, isManager, refreshKey, extractMembersFromResponse, checkIfUserIsMember, processMembersByRole]);
  
  // Handle joining team
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
        refresh();
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
  
  // Handle removing a member
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
        refresh();
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
  
  // Handle adding a new member
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
      
      // This should be implemented with your actual API endpoint
      // Here's a placeholder for the API call:
      const response = await apiClient.post(`/teams/${teamId}/invite`, {
        email: data.email,
        role: data.role
      });
      
      console.log('Squad: Add member response:', response);
      
      if (response && response.success) {
        refresh();
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
    isLoading: loading,
    initialLoad,
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
