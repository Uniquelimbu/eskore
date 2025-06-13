import { apiClient } from '../../services';
import { TEAM_ACTIONS, TEAM_ENDPOINTS, CACHE_CONFIG } from './constants/teamConstants';
import { determineUserRole, isManagerRole, isPlayerRole } from './utils/roleManager';
import { validateCreateTeamData, validateUpdateTeamData } from './utils/teamValidation';
import { TeamCacheManager } from './utils/cacheManager';

// Initialize cache manager instance
const cacheManager = new TeamCacheManager();

/**
 * Initialize team state for authenticated user
 */
export const initializeTeamState = (dispatch) => {
  return async (user) => {
    if (!user?.id) {
      dispatch({ type: TEAM_ACTIONS.RESET_TEAM_STATE });
      return;
    }

    try {
      dispatch({ type: TEAM_ACTIONS.SET_LOADING, payload: true });
      console.log('TeamActions: Initializing team state for user:', user.id);
      
      // Load user teams
      const teams = await loadUserTeamsAction(dispatch)(user.id);
      
      // Auto-select last team or first team
      if (teams.length > 0) {
        const lastTeamId = localStorage.getItem('lastTeamId');
        const teamToSelect = lastTeamId 
          ? teams.find(t => t.id.toString() === lastTeamId) || teams[0]
          : teams[0];
        
        await switchToTeamAction(dispatch)(teamToSelect, false, user);
      }
      
      console.log('TeamActions: Team state initialized successfully');
    } catch (error) {
      console.error('TeamActions: Failed to initialize team state:', error);
      dispatch({ 
        type: TEAM_ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to initialize team state' 
      });
    } finally {
      dispatch({ type: TEAM_ACTIONS.SET_LOADING, payload: false });
    }
  };
};

/**
 * Load user teams with caching
 */
export const loadUserTeamsAction = (dispatch) => {
  return async (userId, forceRefresh = false) => {
    const cacheKey = `user_teams_${userId}`;
    
    try {
      dispatch({ type: TEAM_ACTIONS.SET_LOADING, payload: true });
      
      // Check cache first
      if (!forceRefresh) {
        const cachedTeams = cacheManager.getCachedData(cacheKey, new Map(), CACHE_CONFIG.USER_TEAMS_CACHE_DURATION);
        if (cachedTeams) {
          console.log('TeamActions: Using cached user teams');
          dispatch({ type: TEAM_ACTIONS.SET_USER_TEAMS, payload: cachedTeams });
          return cachedTeams;
        }
      }
      
      console.log(`TeamActions: Fetching teams for user ${userId}`);
      const response = await apiClient.get(TEAM_ENDPOINTS.GET_USER_TEAMS(userId));
      const teams = response.teams || response.data || response || [];
      
      // Cache the results
      cacheManager.setCachedData(cacheKey, teams, new Map());
      
      dispatch({ type: TEAM_ACTIONS.SET_USER_TEAMS, payload: teams });
      console.log(`TeamActions: Loaded ${teams.length} teams for user`);
      
      return teams;
    } catch (error) {
      console.error('TeamActions: Error loading user teams:', error);
      dispatch({ 
        type: TEAM_ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to load teams' 
      });
      return [];
    } finally {
      dispatch({ type: TEAM_ACTIONS.SET_LOADING, payload: false });
    }
  };
};

/**
 * Switch to a different team
 */
export const switchToTeamAction = (dispatch) => {
  return async (team, saveToStorage = true, currentUser = null) => {
    if (!team?.id) {
      throw new Error('Invalid team provided for switching');
    }

    try {
      dispatch({ type: TEAM_ACTIONS.SET_LOADING, payload: true });
      console.log(`TeamActions: Switching to team ${team.name} (${team.id})`);
      
      // Fetch fresh team data
      const teamResponse = await apiClient.get(TEAM_ENDPOINTS.GET_TEAM(team.id));
      const freshTeamData = teamResponse.team || teamResponse.data || teamResponse;
      
      if (!freshTeamData || !freshTeamData.id) {
        throw new Error('Invalid team data received from server');
      }
      
      // Fetch team members
      const membersResponse = await apiClient.get(TEAM_ENDPOINTS.GET_TEAM_MEMBERS(team.id));
      const members = membersResponse.members || membersResponse.data || membersResponse || [];
      
      // Update state
      dispatch({ type: TEAM_ACTIONS.SET_CURRENT_TEAM, payload: freshTeamData });
      dispatch({ type: TEAM_ACTIONS.SET_TEAM_MEMBERS, payload: members });
      
      // Determine user role and permissions
      if (currentUser) {
        const userRole = determineUserRole(currentUser, freshTeamData, members);
        dispatch({ type: TEAM_ACTIONS.SET_USER_ROLE, payload: userRole });
        dispatch({ type: TEAM_ACTIONS.SET_MANAGER_STATUS, payload: isManagerRole(userRole, currentUser, freshTeamData) });
        dispatch({ type: TEAM_ACTIONS.SET_PLAYER_STATUS, payload: isPlayerRole(userRole) });
      }
      
      // Save to localStorage
      if (saveToStorage) {
        localStorage.setItem('lastTeamId', team.id.toString());
      }
      
      // Update cache
      dispatch({
        type: TEAM_ACTIONS.UPDATE_TEAM_CACHE,
        payload: { key: `team_${team.id}`, data: freshTeamData }
      });
      
      dispatch({
        type: TEAM_ACTIONS.UPDATE_MEMBER_CACHE,
        payload: { key: `members_${team.id}`, data: members }
      });
      
      console.log(`TeamActions: Successfully switched to team ${freshTeamData.name}`);
    } catch (error) {
      console.error('TeamActions: Error switching team:', error);
      dispatch({ 
        type: TEAM_ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to switch team' 
      });
      throw error;
    } finally {
      dispatch({ type: TEAM_ACTIONS.SET_LOADING, payload: false });
    }
  };
};

/**
 * Create a new team and switch to it
 */
export const createTeamAction = (dispatch) => {
  return async (teamData, currentUser) => {
    try {
      dispatch({ type: TEAM_ACTIONS.SET_LOADING, payload: true });
      
      // Validate team data
      const validation = validateCreateTeamData(teamData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      console.log('TeamActions: Creating team:', teamData.name);
      
      // Create team
      const response = await apiClient.post(TEAM_ENDPOINTS.CREATE_TEAM, teamData);
      const newTeam = response.team || response.data || response;
      
      if (!newTeam?.id) {
        throw new Error('Invalid team data received after creation');
      }
      
      // Switch to the new team
      await switchToTeamAction(dispatch)(newTeam, true, currentUser);
      
      // Invalidate user teams cache
      if (currentUser?.id) {
        dispatch({
          type: TEAM_ACTIONS.INVALIDATE_CACHE,
          payload: { pattern: `user_teams_${currentUser.id}` }
        });
      }
      
      console.log('TeamActions: Team created and switched successfully');
      return { success: true, team: newTeam };
    } catch (error) {
      console.error('TeamActions: Error creating team:', error);
      dispatch({ 
        type: TEAM_ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to create team' 
      });
      return { success: false, error: error.message || 'Failed to create team' };
    } finally {
      dispatch({ type: TEAM_ACTIONS.SET_LOADING, payload: false });
    }
  };
};

/**
 * Update team information
 */
export const updateTeamAction = (dispatch) => {
  return async (teamId, updateData) => {
    try {
      dispatch({ type: TEAM_ACTIONS.SET_LOADING, payload: true });
      
      // Validate update data
      const validation = validateUpdateTeamData(updateData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      console.log(`TeamActions: Updating team ${teamId}:`, updateData);
      
      const response = await apiClient.put(TEAM_ENDPOINTS.UPDATE_TEAM(teamId), updateData);
      const updatedTeam = response.team || response.data || response;
      
      // Update current team if it's the one being updated
      dispatch({ type: TEAM_ACTIONS.SET_CURRENT_TEAM, payload: updatedTeam });
      
      // Invalidate caches
      dispatch({
        type: TEAM_ACTIONS.INVALIDATE_CACHE,
        payload: { pattern: `team_${teamId}` }
      });
      
      console.log('TeamActions: Team updated successfully');
      return { success: true, team: updatedTeam };
    } catch (error) {
      console.error('TeamActions: Error updating team:', error);
      dispatch({ 
        type: TEAM_ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to update team' 
      });
      return { success: false, error: error.message || 'Failed to update team' };
    } finally {
      dispatch({ type: TEAM_ACTIONS.SET_LOADING, payload: false });
    }
  };
};

/**
 * Join a team
 */
export const joinTeamAction = (dispatch) => {
  return async (teamId, joinData = {}, currentUser = null) => {
    try {
      dispatch({ type: TEAM_ACTIONS.SET_LOADING, payload: true });
      
      console.log(`TeamActions: Joining team ${teamId}`);
      
      const response = await apiClient.post(TEAM_ENDPOINTS.JOIN_TEAM(teamId), joinData);
      const result = response.data || response;
      
      // If join was successful, invalidate caches and reload data
      if (result.success || result.status === 'joined') {
        // Invalidate user teams cache
        if (currentUser?.id) {
          dispatch({
            type: TEAM_ACTIONS.INVALIDATE_CACHE,
            payload: { pattern: `user_teams_${currentUser.id}` }
          });
        }
        
        // Reload user teams
        await loadUserTeamsAction(dispatch)(currentUser.id, true);
        
        console.log('TeamActions: Successfully joined team');
        return { success: true, isPending: result.status === 'pending' };
      }
      
      return result;
    } catch (error) {
      console.error('TeamActions: Error joining team:', error);
      dispatch({ 
        type: TEAM_ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to join team' 
      });
      throw error;
    } finally {
      dispatch({ type: TEAM_ACTIONS.SET_LOADING, payload: false });
    }
  };
};

/**
 * Leave a team
 */
export const leaveTeamAction = (dispatch) => {
  return async (teamId, currentUser = null) => {
    try {
      dispatch({ type: TEAM_ACTIONS.SET_LOADING, payload: true });
      
      console.log(`TeamActions: Leaving team ${teamId}`);
      
      const response = await apiClient.post(TEAM_ENDPOINTS.LEAVE_TEAM(teamId));
      const result = response.data || response;
      
      // If leave was successful, invalidate caches and reload data
      if (result.success) {
        // Invalidate user teams cache
        if (currentUser?.id) {
          dispatch({
            type: TEAM_ACTIONS.INVALIDATE_CACHE,
            payload: { pattern: `user_teams_${currentUser.id}` }
          });
        }
        
        // Reload user teams
        const remainingTeams = await loadUserTeamsAction(dispatch)(currentUser.id, true);
        
        // Switch to first available team or clear current team
        if (remainingTeams.length > 0) {
          await switchToTeamAction(dispatch)(remainingTeams[0], true, currentUser);
        } else {
          dispatch({ type: TEAM_ACTIONS.SET_CURRENT_TEAM, payload: null });
          dispatch({ type: TEAM_ACTIONS.SET_TEAM_MEMBERS, payload: [] });
          dispatch({ type: TEAM_ACTIONS.SET_USER_ROLE, payload: null });
        }
        
        console.log('TeamActions: Successfully left team');
      }
      
      return result;
    } catch (error) {
      console.error('TeamActions: Error leaving team:', error);
      dispatch({ 
        type: TEAM_ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to leave team' 
      });
      return { success: false, error: error.message || 'Failed to leave team' };
    } finally {
      dispatch({ type: TEAM_ACTIONS.SET_LOADING, payload: false });
    }
  };
};

/**
 * Refresh current team data
 */
export const refreshCurrentTeamAction = (dispatch) => {
  return async (currentTeam, currentUser = null) => {
    if (!currentTeam?.id) return;
    
    try {
      console.log(`TeamActions: Refreshing team data for ${currentTeam.name}`);
      
      // Re-fetch team and member data
      const [teamResponse, membersResponse] = await Promise.all([
        apiClient.get(TEAM_ENDPOINTS.GET_TEAM(currentTeam.id)),
        apiClient.get(TEAM_ENDPOINTS.GET_TEAM_MEMBERS(currentTeam.id))
      ]);
      
      const freshTeamData = teamResponse.team || teamResponse.data || teamResponse;
      const members = membersResponse.members || membersResponse.data || membersResponse || [];
      
      // Update state
      dispatch({ type: TEAM_ACTIONS.SET_CURRENT_TEAM, payload: freshTeamData });
      dispatch({ type: TEAM_ACTIONS.SET_TEAM_MEMBERS, payload: members });
      
      // Update user role if user is provided
      if (currentUser) {
        const userRole = determineUserRole(currentUser, freshTeamData, members);
        dispatch({ type: TEAM_ACTIONS.SET_USER_ROLE, payload: userRole });
        dispatch({ type: TEAM_ACTIONS.SET_MANAGER_STATUS, payload: isManagerRole(userRole, currentUser, freshTeamData) });
        dispatch({ type: TEAM_ACTIONS.SET_PLAYER_STATUS, payload: isPlayerRole(userRole) });
      }
      
      // Update cache
      dispatch({
        type: TEAM_ACTIONS.UPDATE_TEAM_CACHE,
        payload: { key: `team_${currentTeam.id}`, data: freshTeamData }
      });
      
      dispatch({
        type: TEAM_ACTIONS.UPDATE_MEMBER_CACHE,
        payload: { key: `members_${currentTeam.id}`, data: members }
      });
      
      console.log('TeamActions: Team data refreshed successfully');
    } catch (error) {
      console.error('TeamActions: Error refreshing team data:', error);
      dispatch({ 
        type: TEAM_ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to refresh team data' 
      });
    }
  };
};

/**
 * Get team by ID
 */
export const getTeamByIdAction = (dispatch) => {
  return async (teamId) => {
    const cacheKey = `team_${teamId}`;
    
    try {
      // Check cache first
      const cachedTeam = cacheManager.getCachedData(cacheKey, new Map());
      if (cachedTeam) {
        console.log(`TeamActions: Using cached team data for ${teamId}`);
        return cachedTeam;
      }
      
      console.log(`TeamActions: Fetching team ${teamId}`);
      const response = await apiClient.get(TEAM_ENDPOINTS.GET_TEAM(teamId));
      const team = response.team || response.data || response;
      
      // Cache the result
      cacheManager.setCachedData(cacheKey, team, new Map());
      
      // Update cache through dispatch for consistency
      dispatch({
        type: TEAM_ACTIONS.UPDATE_TEAM_CACHE,
        payload: { key: cacheKey, data: team }
      });
      
      return team;
    } catch (error) {
      console.error(`TeamActions: Error fetching team ${teamId}:`, error);
      throw error;
    }
  };
};

/**
 * Get team members by team ID
 */
export const getTeamMembersByIdAction = (dispatch) => {
  return async (teamId) => {
    const cacheKey = `members_${teamId}`;
    
    try {
      // Check cache first
      const cachedMembers = cacheManager.getCachedData(cacheKey, new Map(), CACHE_CONFIG.MEMBER_CACHE_DURATION);
      if (cachedMembers) {
        console.log(`TeamActions: Using cached members data for team ${teamId}`);
        return cachedMembers;
      }
      
      console.log(`TeamActions: Fetching members for team ${teamId}`);
      const response = await apiClient.get(TEAM_ENDPOINTS.GET_TEAM_MEMBERS(teamId));
      const members = response.members || response.data || response || [];
      
      // Cache the result
      cacheManager.setCachedData(cacheKey, members, new Map());
      
      // Update cache through dispatch for consistency
      dispatch({
        type: TEAM_ACTIONS.UPDATE_MEMBER_CACHE,
        payload: { key: cacheKey, data: members }
      });
      
      return members;
    } catch (error) {
      console.error(`TeamActions: Error fetching members for team ${teamId}:`, error);
      throw error;
    }
  };
};