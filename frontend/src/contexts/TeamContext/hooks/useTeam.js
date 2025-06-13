import { useContext } from 'react';
import { TeamContext } from '../TeamContext';

/**
 * Enhanced hook to use the TeamContext with error handling
 */
export const useTeam = () => {
  const context = useContext(TeamContext);
  
  if (context === undefined || context === null) {
    throw new Error(
      'useTeam must be used within a TeamProvider. ' +
      'Wrap your component or a parent component with <TeamProvider>.'
    );
  }
  
  return context;
};

/**
 * Safe hook that returns default values if context is not available
 */
export const useTeamSafe = () => {
  const context = useContext(TeamContext);
  
  if (context === undefined || context === null) {
    console.warn('useTeamSafe: TeamContext not available, returning defaults');
    return {
      currentTeam: null,
      userTeams: [],
      teamMembers: [],
      loading: false,
      error: null,
      userRole: null,
      isManager: false,
      isPlayer: false,
      // Safe defaults for all functions
      loadUserTeams: async () => [],
      switchToTeam: async () => {},
      createAndSwitchToTeam: async () => ({ success: false, error: 'Context not available' }),
      updateTeam: async () => ({ success: false, error: 'Context not available' }),
      joinTeam: async () => { throw new Error('Context not available'); },
      leaveTeam: async () => ({ success: false, error: 'Context not available' }),
      refreshCurrentTeam: async () => {},
      getTeamById: async () => { throw new Error('Context not available'); },
      getTeamMembersById: async () => { throw new Error('Context not available'); },
      hasRoleInCurrentTeam: () => false,
      hasAnyRoleInCurrentTeam: () => false,
      getTeamMember: () => null,
      isUserMemberOfCurrentTeam: () => false,
      invalidateCache: () => {},
      refreshTeamData: () => {},
      getCurrentUserRole: () => null,
      getCurrentUserDisplayName: () => 'Unknown User',
      getTeamDisplayName: () => 'No Team',
      getTeamAbbreviation: () => 'NT',
      isLoading: false,
      hasError: false,
      clearError: () => {}
    };
  }
  
  return context;
};