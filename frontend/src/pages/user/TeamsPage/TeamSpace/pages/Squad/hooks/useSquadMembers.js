import { useCallback } from 'react';
import useTeamData from './useTeamData';
import useMemberData from './useMemberData';
import useMemberOperations from './useMemberOperations';

/**
 * Main hook for squad member management
 * Composes multiple specialized hooks for team data, member data, and operations
 * 
 * @param {string} teamId - ID of the team
 * @returns {Object} - Combined state and functions from all hooks
 */
const useSquadMembers = (teamId) => {
  // Get team data
  const {
    team,
    loading: teamLoading,
    error: teamError,
    isManager,
    refresh: refreshTeam
  } = useTeamData(teamId);

  // Get member data
  const {
    managers,
    athletes,
    coaches,
    loading: membersLoading,
    initialLoad,
    error: membersError,
    isMember,
    refresh: refreshMembers
  } = useMemberData(teamId, team, isManager);

  // Combined refresh function
  const refresh = useCallback(() => {
    refreshTeam();
    refreshMembers();
  }, [refreshTeam, refreshMembers]);

  // Get member operations
  const {
    loading: operationsLoading,
    error: operationsError,
    handleJoinTeamSubmit,
    handleRemoveMember,
    handleAddMemberSubmit
  } = useMemberOperations(teamId, isManager, refresh);

  // Combine errors, prioritizing the first one found
  const error = teamError || membersError || operationsError;
  
  // Combine loading states
  const loading = teamLoading || membersLoading || operationsLoading;

  return {
    // Team data
    team,
    isManager,
    
    // Member data
    managers,
    athletes,
    coaches,
    isMember,
    initialLoad,
    
    // Operations
    handleJoinTeamSubmit,
    handleRemoveMember,
    handleAddMemberSubmit,
    
    // Status
    isLoading: loading,
    error,
    
    // Utility
    refresh
  };
};

export default useSquadMembers;
