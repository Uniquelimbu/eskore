import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { apiClient } from '../services';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { showError, showSuccess } = useNotification();
  
  // Core team state
  const [currentTeam, setCurrentTeam] = useState(null);
  const [userTeams, setUserTeams] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Team role and permissions
  const [userRole, setUserRole] = useState(null);
  const [isManager, setIsManager] = useState(false);
  const [isPlayer, setIsPlayer] = useState(false);

  // Load user teams when user authentication changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadUserTeams();
    } else {
      // Clear team data when user logs out
      setCurrentTeam(null);
      setUserTeams([]);
      setTeamMembers([]);
      setUserRole(null);
      setIsManager(false);
      setIsPlayer(false);
      localStorage.removeItem('lastTeamId');
    }
  }, [isAuthenticated, user?.id]);

  // Load user's teams
  const loadUserTeams = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/teams/user/${user.id}`);
      const teams = response?.teams || [];
      
      setUserTeams(teams);
      
      // Set current team from localStorage or first team
      const lastTeamId = localStorage.getItem('lastTeamId');
      let teamToSelect = null;
      
      if (lastTeamId && teams.length > 0) {
        teamToSelect = teams.find(t => t.id.toString() === lastTeamId);
      }
      
      // Fallback to first team if no valid lastTeamId
      if (!teamToSelect && teams.length > 0) {
        teamToSelect = teams[0];
      }
      
      if (teamToSelect) {
        await switchToTeam(teamToSelect, false); // false = don't save to localStorage again
      }
      
    } catch (err) {
      console.error('Error loading user teams:', err);
      setError('Failed to load teams');
      showError('Failed to load your teams');
    } finally {
      setLoading(false);
    }
  };

  // Switch to a specific team
  const switchToTeam = async (team, saveToStorage = true) => {
    if (!team) return;
    
    try {
      setLoading(true);
      
      // Set current team
      setCurrentTeam(team);
      
      // Save to localStorage
      if (saveToStorage) {
        localStorage.setItem('lastTeamId', team.id.toString());
      }
      
      // Determine user role in this team
      const userTeamData = userTeams.find(ut => ut.id === team.id);
      const role = userTeamData?.role || team.userRole || null;
      
      setUserRole(role);
      setIsManager(role === 'manager' || role === 'assistant_manager');
      setIsPlayer(role === 'athlete');
      
      // Load team members
      await loadTeamMembers(team.id);
      
    } catch (err) {
      console.error('Error switching to team:', err);
      setError('Failed to switch team');
    } finally {
      setLoading(false);
    }
  };

  // Load team members
  const loadTeamMembers = async (teamId) => {
    if (!teamId) return;
    
    try {
      const response = await apiClient.getTeamMembers(teamId);
      const members = response?.members || [];
      setTeamMembers(members);
    } catch (err) {
      console.error('Error loading team members:', err);
      // Don't show error to user for this, as it's not critical
    }
  };

  // Refresh current team data
  const refreshCurrentTeam = async () => {
    if (!currentTeam?.id) return;
    
    try {
      const response = await apiClient.get(`/teams/${currentTeam.id}`);
      const updatedTeam = response;
      
      setCurrentTeam(updatedTeam);
      
      // Update the team in userTeams array as well
      setUserTeams(prev => 
        prev.map(team => 
          team.id === updatedTeam.id ? { ...team, ...updatedTeam } : team
        )
      );
      
    } catch (err) {
      console.error('Error refreshing team:', err);
      setError('Failed to refresh team data');
    }
  };

  // Create a new team and switch to it
  const createAndSwitchToTeam = async (teamData) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/teams', teamData);
      const newTeam = response.team || response;
      
      // Reload user teams to include the new team
      await loadUserTeams();
      
      // Switch to the new team
      await switchToTeam(newTeam);
      
      showSuccess(`Team "${newTeam.name}" created successfully!`);
      return newTeam;
      
    } catch (err) {
      console.error('Error creating team:', err);
      showError('Failed to create team');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Join a team and refresh user teams
  const joinTeam = async (teamId, joinData) => {
    try {
      setLoading(true);
      const response = await apiClient.joinTeam(teamId, joinData);
      
      if (response.success && !response.isPending) {
        // If successfully joined (not pending approval), reload teams
        await loadUserTeams();
        showSuccess('Successfully joined the team!');
      } else if (response.isPending) {
        showSuccess('Join request sent! Waiting for team manager approval.');
      }
      
      return response;
      
    } catch (err) {
      console.error('Error joining team:', err);
      const errorMessage = err.response?.data?.message || 'Failed to join team';
      showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Utility functions for role checking
  const isCurrentUserManager = useMemo(() => {
    return isManager || (currentTeam && user && currentTeam.createdBy === user.id);
  }, [isManager, currentTeam, user]);

  const isCurrentUserPlayer = useMemo(() => {
    return isPlayer;
  }, [isPlayer]);

  const hasRoleInCurrentTeam = (role) => {
    return userRole === role;
  };

  const hasAnyRoleInCurrentTeam = (roles) => {
    return roles.includes(userRole);
  };

  // Get team member by user ID
  const getTeamMember = (userId) => {
    return teamMembers.find(member => member.userId === userId || member.id === userId);
  };

  // Check if user is member of current team
  const isUserMemberOfCurrentTeam = (userId = user?.id) => {
    if (!userId || !currentTeam) return false;
    return teamMembers.some(member => member.userId === userId || member.id === userId);
  };

  const value = useMemo(() => ({
    // Core state
    currentTeam,
    userTeams,
    teamMembers,
    loading,
    error,
    
    // User role in current team
    userRole,
    isManager: isCurrentUserManager,
    isPlayer: isCurrentUserPlayer,
    
    // Team management functions
    switchToTeam,
    refreshCurrentTeam,
    createAndSwitchToTeam,
    joinTeam,
    loadUserTeams,
    loadTeamMembers,
    
    // Utility functions
    hasRoleInCurrentTeam,
    hasAnyRoleInCurrentTeam,
    getTeamMember,
    isUserMemberOfCurrentTeam,
    
  }), [
    currentTeam,
    userTeams,
    teamMembers,
    loading,
    error,
    userRole,
    isCurrentUserManager,
    isCurrentUserPlayer,
  ]);

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

export default TeamContext;