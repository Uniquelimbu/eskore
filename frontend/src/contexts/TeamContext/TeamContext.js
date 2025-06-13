import React, { createContext, useReducer, useEffect, useRef, useMemo, useCallback } from 'react';
import { teamReducer } from './teamReducer';
import { initialTeamState, TEAM_ACTIONS } from './constants/teamConstants';
import { 
  initializeTeamState,
  loadUserTeamsAction,
  switchToTeamAction,
  createTeamAction,
  updateTeamAction,
  joinTeamAction,
  leaveTeamAction,
  refreshCurrentTeamAction,
  getTeamByIdAction,
  getTeamMembersByIdAction
} from './teamActions';
import { 
  hasRoleInTeam, 
  hasAnyRoleInTeam, 
  isManagerRole,
  isPlayerRole,
  determineUserRole,
  getUserTeamPermissions
} from './utils/roleManager';
import { getTeamMember, isUserTeamMember } from './utils/teamHelpers';
import { useAuth } from '../AuthContext';
import { useNotification } from '../NotificationContext';

// Create context with error boundary
export const TeamContext = createContext(null);

// Error boundary wrapper for team operations
const TeamErrorBoundary = ({ children, onError }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleError = (event) => {
      if (event.reason || event.error) {
        const errorObj = event.reason || event.error;
        console.error('TeamContext Error:', errorObj);
        setHasError(true);
        setError(errorObj);
        onError?.(errorObj);
      }
    };

    const handleRejection = (event) => {
      console.error('TeamContext Unhandled Promise Rejection:', event.reason);
      onError?.(event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [onError]);

  if (hasError) {
    return (
      <div className="team-context-error" style={{
        padding: '20px',
        margin: '20px',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#c33', marginBottom: '10px' }}>Team System Error</h3>
        <p style={{ marginBottom: '15px' }}>Something went wrong with the team system. Please refresh the page.</p>
        <button 
          onClick={() => {
            setHasError(false);
            setError(null);
            window.location.reload();
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return children;
};

// Provider component with enhanced error handling
export const TeamProvider = ({ children }) => {
  const [state, dispatch] = useReducer(teamReducer, initialTeamState);
  const { user, isAuthenticated } = useAuth();
  const { showError, showSuccess } = useNotification();
  
  // Refs to prevent multiple simultaneous requests
  const initializingRef = useRef(false);
  const switchingTeamRef = useRef(false);
  const operationTimeouts = useRef(new Map());

  // Enhanced error handling with useCallback for stability
  const handleError = useCallback((error, operation) => {
    console.error(`TeamContext ${operation} error:`, error);
    dispatch({ 
      type: TEAM_ACTIONS.SET_ERROR, 
      payload: error.message || `Failed to ${operation}` 
    });
    showError?.(error.message || `Failed to ${operation}`);
  }, [showError]);

  const clearOperationTimeout = useCallback((operation) => {
    const timeout = operationTimeouts.current.get(operation);
    if (timeout) {
      clearTimeout(timeout);
      operationTimeouts.current.delete(operation);
    }
  }, []);

  const setOperationTimeout = useCallback((operation, callback, delay = 30000) => {
    clearOperationTimeout(operation);
    const timeout = setTimeout(() => {
      console.warn(`TeamContext: ${operation} operation timed out`);
      callback();
    }, delay);
    operationTimeouts.current.set(operation, timeout);
  }, [clearOperationTimeout]);

  // Initialize team state when user authentication changes
  useEffect(() => {
    if (isAuthenticated && user?.id && !initializingRef.current) {
      initializingRef.current = true;
      
      const initialize = initializeTeamState(dispatch);
      
      setOperationTimeout('initialization', () => {
        initializingRef.current = false;
        handleError(new Error('Team initialization timed out'), 'initialize teams');
      });

      initialize(user)
        .catch(error => handleError(error, 'initialize teams'))
        .finally(() => {
          initializingRef.current = false;
          clearOperationTimeout('initialization');
        });
    } else if (!isAuthenticated) {
      // Use correct action type
      dispatch({ type: TEAM_ACTIONS.RESET_TEAM_STATE });
      operationTimeouts.current.clear();
    }
  }, [isAuthenticated, user?.id, handleError, setOperationTimeout, clearOperationTimeout]);

  // Handle browser visibility change - refresh data when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && state.currentTeam && user && !state.loading) {
        const refresh = refreshCurrentTeamAction(dispatch);
        refresh(state.currentTeam, user).catch(error => 
          console.warn('TeamContext: Failed to refresh on visibility change:', error)
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.currentTeam, user, state.loading]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      operationTimeouts.current.forEach(timeout => clearTimeout(timeout));
      operationTimeouts.current.clear();
    };
  }, []);

  // Enhanced action functions with error handling
  const loadUserTeams = useCallback(async (forceRefresh = false) => {
    if (!user?.id) return [];
    
    try {
      const action = loadUserTeamsAction(dispatch);
      return await action(user.id, forceRefresh);
    } catch (error) {
      handleError(error, 'load user teams');
      return [];
    }
  }, [user?.id, handleError]);

  const switchToTeam = useCallback(async (team, saveToStorage = true) => {
    if (switchingTeamRef.current) {
      console.warn('TeamContext: Team switch already in progress');
      return;
    }
    
    if (!team?.id) {
      handleError(new Error('Invalid team data'), 'switch team');
      return;
    }

    switchingTeamRef.current = true;
    
    try {
      setOperationTimeout('switch', () => {
        switchingTeamRef.current = false;
        handleError(new Error('Team switch timed out'), 'switch team');
      });

      const action = switchToTeamAction(dispatch);
      await action(team, saveToStorage, user);
      
      showSuccess?.(`Switched to ${team.name}`);
    } catch (error) {
      handleError(error, 'switch team');
    } finally {
      switchingTeamRef.current = false;
      clearOperationTimeout('switch');
    }
  }, [user, handleError, showSuccess, setOperationTimeout, clearOperationTimeout]);

  const createAndSwitchToTeam = useCallback(async (teamData) => {
    try {
      const action = createTeamAction(dispatch);
      const result = await action(teamData, user);
      
      if (result.success) {
        showSuccess?.(`Team "${teamData.name}" created successfully!`);
      }
      
      return result;
    } catch (error) {
      handleError(error, 'create team');
      return { success: false, error: error.message };
    }
  }, [user, handleError, showSuccess]);

  const updateTeam = useCallback(async (teamId, updateData) => {
    try {
      const action = updateTeamAction(dispatch);
      const result = await action(teamId, updateData);
      
      if (result.success) {
        showSuccess?.('Team updated successfully');
      }
      
      return result;
    } catch (error) {
      handleError(error, 'update team');
      return { success: false, error: error.message };
    }
  }, [handleError, showSuccess]);

  const joinTeam = useCallback(async (teamId, joinData = {}) => {
    try {
      const action = joinTeamAction(dispatch);
      const result = await action(teamId, joinData, user);
      
      if (result.success) {
        showSuccess?.(result.isPending ? 'Join request sent!' : 'Successfully joined team!');
      }
      
      return result;
    } catch (error) {
      handleError(error, 'join team');
      throw error;
    }
  }, [user, handleError, showSuccess]);

  const leaveTeam = useCallback(async (teamId) => {
    try {
      const action = leaveTeamAction(dispatch);
      const result = await action(teamId, user);
      
      if (result.success) {
        showSuccess?.('Successfully left team');
      }
      
      return result;
    } catch (error) {
      handleError(error, 'leave team');
      return { success: false, error: error.message };
    }
  }, [user, handleError, showSuccess]);

  const refreshCurrentTeam = useCallback(async () => {
    if (!state.currentTeam) return;
    
    try {
      const action = refreshCurrentTeamAction(dispatch);
      await action(state.currentTeam, user);
    } catch (error) {
      handleError(error, 'refresh team');
    }
  }, [state.currentTeam, user, handleError]);

  const getTeamById = useCallback(async (teamId) => {
    try {
      const action = getTeamByIdAction(dispatch);
      return await action(teamId);
    } catch (error) {
      handleError(error, 'get team');
      throw error;
    }
  }, [handleError]);

  const getTeamMembersById = useCallback(async (teamId) => {
    try {
      const action = getTeamMembersByIdAction(dispatch);
      return await action(teamId);
    } catch (error) {
      handleError(error, 'get team members');
      throw error;
    }
  }, [handleError]);

  // Enhanced role checking functions with caching
  const hasRoleInCurrentTeam = useMemo(() => 
    (role) => hasRoleInTeam(state.userRole, role),
    [state.userRole]
  );

  const hasAnyRoleInCurrentTeam = useMemo(() => 
    (roles) => hasAnyRoleInTeam(state.userRole, roles),
    [state.userRole]
  );

  // Member utilities with error handling
  const getTeamMemberById = useCallback((userId) => {
    try {
      return getTeamMember(state.teamMembers, userId);
    } catch (error) {
      console.warn('TeamContext: Error getting team member:', error);
      return null;
    }
  }, [state.teamMembers]);

  const isUserMemberOfCurrentTeam = useCallback((userId = user?.id) => {
    try {
      return isUserTeamMember(state.teamMembers, userId);
    } catch (error) {
      console.warn('TeamContext: Error checking team membership:', error);
      return false;
    }
  }, [state.teamMembers, user?.id]);

  // Cache management with error handling
  const invalidateCache = useCallback((pattern) => {
    try {
      dispatch({
        type: TEAM_ACTIONS.INVALIDATE_CACHE,
        payload: { pattern }
      });
    } catch (error) {
      console.warn('TeamContext: Error invalidating cache:', error);
    }
  }, []);

  const refreshTeamData = useCallback((teamId) => {
    try {
      invalidateCache(`team_${teamId}`);
      invalidateCache(`members_${teamId}`);
    } catch (error) {
      console.warn('TeamContext: Error refreshing team data:', error);
    }
  }, [invalidateCache]);

  // Enhanced role determination with memoization
  const currentUserRole = useMemo(() => 
    determineUserRole(user, state.currentTeam, state.teamMembers),
    [user, state.currentTeam, state.teamMembers]
  );

  const isCurrentUserManager = useMemo(() => 
    isManagerRole(currentUserRole, user, state.currentTeam),
    [currentUserRole, user, state.currentTeam]
  );

  const isCurrentUserPlayer = useMemo(() => 
    isPlayerRole(currentUserRole),
    [currentUserRole]
  );

  const userPermissions = useMemo(() => 
    getUserTeamPermissions(user, state.currentTeam, state.teamMembers),
    [user, state.currentTeam, state.teamMembers]
  );

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: TEAM_ACTIONS.CLEAR_ERROR });
  }, []);

  // Context value with memoization for performance
  const value = useMemo(() => ({
    // State
    ...state,
    
    // Enhanced role flags
    isManager: isCurrentUserManager,
    isPlayer: isCurrentUserPlayer,
    userPermissions,
    
    // Core Actions
    loadUserTeams,
    switchToTeam,
    createAndSwitchToTeam,
    updateTeam,
    joinTeam,
    leaveTeam,
    refreshCurrentTeam,
    
    // Data Fetching
    getTeamById,
    getTeamMembersById,
    
    // Role Checking
    hasRoleInCurrentTeam,
    hasAnyRoleInCurrentTeam,
    
    // Member Utilities
    getTeamMember: getTeamMemberById,
    isUserMemberOfCurrentTeam,
    
    // Cache Management
    invalidateCache,
    refreshTeamData,
    
    // User Info Helpers
    getCurrentUserRole: () => currentUserRole,
    getCurrentUserDisplayName: () => {
      if (!user) return 'Unknown User';
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';
    },
    
    // Team Helpers
    getTeamDisplayName: (team = state.currentTeam) => {
      if (!team) return 'No Team';
      return team.nickname ? `${team.name} (${team.nickname})` : team.name;
    },
    
    getTeamAbbreviation: (team = state.currentTeam) => {
      if (!team) return 'NT';
      return team.abbreviation || team.name?.substring(0, 3).toUpperCase() || 'TM';
    },

    // Enhanced utilities
    isLoading: state.loading,
    hasError: !!state.error,
    clearError
  }), [
    state,
    isCurrentUserManager,
    isCurrentUserPlayer,
    userPermissions,
    currentUserRole,
    user,
    loadUserTeams,
    switchToTeam,
    createAndSwitchToTeam,
    updateTeam,
    joinTeam,
    leaveTeam,
    refreshCurrentTeam,
    getTeamById,
    getTeamMembersById,
    hasRoleInCurrentTeam,
    hasAnyRoleInCurrentTeam,
    getTeamMemberById,
    isUserMemberOfCurrentTeam,
    invalidateCache,
    refreshTeamData,
    clearError
  ]);

  return (
    <TeamErrorBoundary onError={(error) => handleError(error, 'context operation')}>
      <TeamContext.Provider value={value}>
        {children}
      </TeamContext.Provider>
    </TeamErrorBoundary>
  );
};