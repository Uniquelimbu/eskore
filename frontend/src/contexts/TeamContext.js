import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  
  // Team role and permissions for current team
  const [userRole, setUserRole] = useState(null);
  const [isManager, setIsManager] = useState(false);
  const [isPlayer, setIsPlayer] = useState(false);
  
  // Enhanced caching system
  const [teamCache, setTeamCache] = useState(new Map());
  const [memberCache, setMemberCache] = useState(new Map());
  const [lastFetchTime, setLastFetchTime] = useState(new Map());
  
  // Refs to prevent multiple simultaneous requests
  const loadingTeamsRef = useRef(false);
  const loadingTeamRef = useRef(new Set());
  
  // Cache configuration
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const MEMBER_CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

  // =============================================================================
  // CACHE MANAGEMENT UTILITIES
  // =============================================================================

  const isCacheValid = useCallback((key, duration = CACHE_DURATION) => {
    const lastFetch = lastFetchTime.get(key);
    return lastFetch && (Date.now() - lastFetch) < duration;
  }, [lastFetchTime]);

  const getCachedData = useCallback((key, cache, duration = CACHE_DURATION) => {
    if (isCacheValid(key, duration)) {
      console.log(`TeamContext: Using cached data for ${key}`);
      return cache.get(key);
    }
    return null;
  }, [isCacheValid]);

  const setCachedData = useCallback((key, data, cache, setCache) => {
    console.log(`TeamContext: Caching data for ${key}`);
    setCache(prev => new Map(prev).set(key, data));
    setLastFetchTime(prev => new Map(prev).set(key, Date.now()));
  }, []);

  const invalidateCache = useCallback((pattern) => {
    console.log(`TeamContext: Invalidating cache for pattern: ${pattern}`);
    
    const keysToRemove = [];
    
    // Find keys matching pattern
    teamCache.forEach((_, key) => {
      if (key.includes(pattern)) keysToRemove.push(key);
    });
    memberCache.forEach((_, key) => {
      if (key.includes(pattern)) keysToRemove.push(key);
    });
    lastFetchTime.forEach((_, key) => {
      if (key.includes(pattern)) keysToRemove.push(key);
    });

    // Remove matched keys
    if (keysToRemove.length > 0) {
      setTeamCache(prev => {
        const newCache = new Map(prev);
        keysToRemove.forEach(key => newCache.delete(key));
        return newCache;
      });
      setMemberCache(prev => {
        const newCache = new Map(prev);
        keysToRemove.forEach(key => newCache.delete(key));
        return newCache;
      });
      setLastFetchTime(prev => {
        const newTimes = new Map(prev);
        keysToRemove.forEach(key => newTimes.delete(key));
        return newTimes;
      });
    }
  }, [teamCache, memberCache, lastFetchTime]);

  // =============================================================================
  // CORE DATA FETCHING FUNCTIONS
  // =============================================================================

  const fetchTeamById = useCallback(async (teamId, bypassCache = false) => {
    const cacheKey = `team_${teamId}`;
    
    if (!bypassCache) {
      const cached = getCachedData(cacheKey, teamCache);
      if (cached) return cached;
    }

    // Prevent multiple simultaneous requests for same team
    if (loadingTeamRef.current.has(teamId)) {
      console.log(`TeamContext: Request for team ${teamId} already in progress`);
      return null;
    }

    try {
      loadingTeamRef.current.add(teamId);
      console.log(`TeamContext: Fetching team ${teamId} from API`);
      
      const response = await apiClient.get(`/teams/${teamId}`);
      setCachedData(cacheKey, response, teamCache, setTeamCache);
      
      return response;
    } catch (err) {
      console.error(`TeamContext: Error fetching team ${teamId}:`, err);
      throw err;
    } finally {
      loadingTeamRef.current.delete(teamId);
    }
  }, [getCachedData, teamCache, setCachedData]);

  const fetchTeamMembers = useCallback(async (teamId, bypassCache = false) => {
    const cacheKey = `members_${teamId}`;
    
    if (!bypassCache) {
      const cached = getCachedData(cacheKey, memberCache, MEMBER_CACHE_DURATION);
      if (cached) return cached;
    }

    try {
      console.log(`TeamContext: Fetching members for team ${teamId}`);
      const response = await apiClient.getTeamMembers(teamId);
      const members = response?.members || [];
      
      setCachedData(cacheKey, members, memberCache, setMemberCache);
      return members;
    } catch (err) {
      console.error(`TeamContext: Error fetching team members for ${teamId}:`, err);
      throw err;
    }
  }, [getCachedData, memberCache, setCachedData]);

  const fetchUserTeams = useCallback(async (bypassCache = false) => {
    if (!user?.id) return [];

    const cacheKey = `user_teams_${user.id}`;
    
    if (!bypassCache) {
      const cached = getCachedData(cacheKey, teamCache);
      if (cached) return cached;
    }

    try {
      console.log(`TeamContext: Fetching teams for user ${user.id}`);
      const response = await apiClient.get(`/teams/user/${user.id}`);
      const teams = response?.teams || [];
      
      setCachedData(cacheKey, teams, teamCache, setTeamCache);
      return teams;
    } catch (err) {
      console.error('TeamContext: Error fetching user teams:', err);
      throw err;
    }
  }, [user?.id, getCachedData, teamCache, setCachedData]);

  // =============================================================================
  // MAIN TEAM OPERATIONS
  // =============================================================================

  const loadUserTeams = useCallback(async (bypassCache = false) => {
    if (!user?.id || loadingTeamsRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      loadingTeamsRef.current = true;
      
      const teams = await fetchUserTeams(bypassCache);
      setUserTeams(teams);
      
      // Auto-select team logic
      const lastTeamId = localStorage.getItem('lastTeamId');
      let teamToSelect = null;
      
      if (lastTeamId && teams.length > 0) {
        teamToSelect = teams.find(t => t.id.toString() === lastTeamId);
      }
      
      if (!teamToSelect && teams.length > 0) {
        teamToSelect = teams[0];
      }
      
      if (teamToSelect && (!currentTeam || currentTeam.id !== teamToSelect.id)) {
        await switchToTeam(teamToSelect, false);
      }
      
    } catch (err) {
      console.error('TeamContext: Error loading user teams:', err);
      setError('Failed to load teams');
      showError('Failed to load your teams');
    } finally {
      setLoading(false);
      loadingTeamsRef.current = false;
    }
  }, [user?.id, fetchUserTeams, currentTeam, showError]);

  const switchToTeam = useCallback(async (team, saveToStorage = true) => {
    if (!team || !team.id) {
      console.warn('TeamContext: Invalid team provided to switchToTeam');
      return;
    }
    
    // Don't switch if already on this team
    if (currentTeam && currentTeam.id === team.id) {
      console.log(`TeamContext: Already on team ${team.id}, skipping switch`);
      return;
    }
    
    try {
      setLoading(true);
      console.log(`TeamContext: Switching to team ${team.id} (${team.name})`);
      
      // Get fresh team data
      const freshTeamData = await fetchTeamById(team.id);
      setCurrentTeam(freshTeamData);
      
      // Save to localStorage
      if (saveToStorage) {
        localStorage.setItem('lastTeamId', team.id.toString());
      }
      
      // Load team members first to get accurate role info
      const members = await fetchTeamMembers(team.id);
      setTeamMembers(members);
      
      // Enhanced role determination with multiple fallbacks
      let role = null;
      
      // 1. Check if user is the team creator/owner
      if (freshTeamData?.createdBy === user?.id || freshTeamData?.ownerId === user?.id) {
        role = 'manager';
        console.log(`TeamContext: User ${user?.id} is team creator/owner, setting role to manager`);
      }
      
      // 2. Check user's role in team members
      if (!role && members.length > 0) {
        const memberData = members.find(member => 
          member.userId === user?.id || member.user?.id === user?.id || member.id === user?.id
        );
        if (memberData) {
          role = memberData.role || memberData.position;
          console.log(`TeamContext: Found user in team members with role: ${role}`);
        }
      }
      
      // 3. Check userTeams data
      if (!role) {
        const userTeamData = userTeams.find(ut => ut.id === team.id);
        if (userTeamData) {
          role = userTeamData.role || userTeamData.userRole;
          console.log(`TeamContext: Found role in userTeams: ${role}`);
        }
      }
      
      // 4. Check freshTeamData for user role
      if (!role) {
        role = freshTeamData?.userRole || freshTeamData?.role;
        console.log(`TeamContext: Found role in freshTeamData: ${role}`);
      }
      
      // 5. Final fallback - if user created the team, they're the manager
      if (!role && freshTeamData && user && 
          (freshTeamData.createdBy === user.id || freshTeamData.ownerId === user.id)) {
        role = 'manager';
        console.log(`TeamContext: Final fallback - user is team owner, setting to manager`);
      }
      
      console.log(`TeamContext: Final determined role for user ${user?.id} in team ${team.id}: ${role}`);
      console.log(`TeamContext: Team data:`, {
        teamId: freshTeamData?.id,
        teamName: freshTeamData?.name,
        createdBy: freshTeamData?.createdBy,
        ownerId: freshTeamData?.ownerId,
        userId: user?.id,
        membersCount: members.length,
        userTeamsEntry: userTeams.find(ut => ut.id === team.id)
      });
      
      setUserRole(role);
      const isManagerRole = role === 'manager' || role === 'assistant_manager' || 
                           (freshTeamData?.createdBy === user?.id) || 
                           (freshTeamData?.ownerId === user?.id);
      const isPlayerRole = role === 'athlete' || role === 'player';
      
      setIsManager(isManagerRole);
      setIsPlayer(isPlayerRole);
      
      console.log(`TeamContext: Role flags set - isManager: ${isManagerRole}, isPlayer: ${isPlayerRole}`);
      console.log(`TeamContext: Successfully switched to team ${team.name}`);
      
    } catch (err) {
      console.error('TeamContext: Error switching to team:', err);
      setError('Failed to switch team');
      showError('Failed to switch to team');
    } finally {
      setLoading(false);
    }
  }, [currentTeam, userTeams, fetchTeamById, fetchTeamMembers, showError, user?.id]);

  const refreshCurrentTeam = useCallback(async () => {
    if (!currentTeam?.id) {
      console.warn('TeamContext: No current team to refresh');
      return;
    }
    
    try {
      console.log(`TeamContext: Refreshing current team ${currentTeam.id}`);
      
      // Invalidate caches for this team
      invalidateCache(`team_${currentTeam.id}`);
      invalidateCache(`members_${currentTeam.id}`);
      
      // Fetch fresh data
      const [freshTeamData, freshMembers] = await Promise.all([
        fetchTeamById(currentTeam.id, true),
        fetchTeamMembers(currentTeam.id, true)
      ]);
      
      setCurrentTeam(freshTeamData);
      setTeamMembers(freshMembers);
      
      // Update team in userTeams array
      setUserTeams(prev => 
        prev.map(team => 
          team.id === freshTeamData.id ? { ...team, ...freshTeamData } : team
        )
      );
      
    } catch (err) {
      console.error('TeamContext: Error refreshing team:', err);
      setError('Failed to refresh team data');
      showError('Failed to refresh team data');
    }
  }, [currentTeam?.id, invalidateCache, fetchTeamById, fetchTeamMembers, showError]);

  const createAndSwitchToTeam = useCallback(async (teamData) => {
    try {
      setLoading(true);
      console.log('TeamContext: Creating new team:', teamData.name);
      
      const response = await apiClient.post('/teams', teamData);
      const newTeam = response.team || response;
      
      console.log('TeamContext: Team created successfully:', newTeam.id);
      
      // Invalidate user teams cache and reload
      invalidateCache(`user_teams_${user.id}`);
      await loadUserTeams(true);
      
      // Switch to the new team
      await switchToTeam(newTeam);
      
      showSuccess(`Team "${newTeam.name}" created successfully!`);
      return newTeam;
      
    } catch (err) {
      console.error('TeamContext: Error creating team:', err);
      showError('Failed to create team');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invalidateCache, user?.id, loadUserTeams, switchToTeam, showSuccess, showError]);

  const joinTeam = useCallback(async (teamId, joinData) => {
    try {
      setLoading(true);
      console.log(`TeamContext: Joining team ${teamId}`);
      
      const response = await apiClient.joinTeam(teamId, joinData);
      
      if (response.success && !response.isPending) {
        console.log('TeamContext: Successfully joined team, reloading teams');
        // Invalidate caches and reload
        invalidateCache(`user_teams_${user.id}`);
        await loadUserTeams(true);
        showSuccess('Successfully joined the team!');
      } else if (response.isPending) {
        showSuccess('Join request sent! Waiting for team manager approval.');
      }
      
      return response;
      
    } catch (err) {
      console.error('TeamContext: Error joining team:', err);
      const errorMessage = err.response?.data?.message || 'Failed to join team';
      showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invalidateCache, user?.id, loadUserTeams, showSuccess, showError]);

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const getTeamById = useCallback(async (teamId) => {
    return await fetchTeamById(teamId);
  }, [fetchTeamById]);

  const getTeamMembersById = useCallback(async (teamId) => {
    return await fetchTeamMembers(teamId);
  }, [fetchTeamMembers]);

  const hasRoleInCurrentTeam = useCallback((role) => {
    return userRole === role;
  }, [userRole]);

  const hasAnyRoleInCurrentTeam = useCallback((roles) => {
    return roles.includes(userRole);
  }, [userRole]);

  const getTeamMember = useCallback((userId) => {
    return teamMembers.find(member => 
      member.userId === userId || member.id === userId
    );
  }, [teamMembers]);

  const isUserMemberOfCurrentTeam = useCallback((userId = user?.id) => {
    if (!userId || !currentTeam) return false;
    return teamMembers.some(member => 
      member.userId === userId || member.id === userId
    );
  }, [user?.id, currentTeam, teamMembers]);

  // Enhanced role checking
  const isCurrentUserManager = useMemo(() => {
    // Check explicit manager role
    if (isManager) return true;
    
    // Check if user is team creator/owner
    if (currentTeam && user) {
      if (currentTeam.createdBy === user.id || currentTeam.ownerId === user.id) {
        console.log(`TeamContext: User ${user.id} is team owner/creator, treating as manager`);
        return true;
      }
    }
    
    // Check role string
    if (userRole === 'manager' || userRole === 'assistant_manager') {
      return true;
    }
    
    console.log(`TeamContext: Manager check - isManager: ${isManager}, userRole: ${userRole}, isOwner: ${currentTeam?.createdBy === user?.id || currentTeam?.ownerId === user?.id}`);
    return false;
  }, [isManager, currentTeam, user, userRole]);

  const isCurrentUserPlayer = useMemo(() => {
    return isPlayer;
  }, [isPlayer]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Load user teams when authentication changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log(`TeamContext: User authenticated, loading teams for ${user.id}`);
      loadUserTeams();
    } else {
      // Clear all data when user logs out
      console.log('TeamContext: Clearing team data (user logged out)');
      setCurrentTeam(null);
      setUserTeams([]);
      setTeamMembers([]);
      setUserRole(null);
      setIsManager(false);
      setIsPlayer(false);
      setTeamCache(new Map());
      setMemberCache(new Map());
      setLastFetchTime(new Map());
      localStorage.removeItem('lastTeamId');
    }
  }, [isAuthenticated, user?.id, loadUserTeams]);

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

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
    
    // Data fetching utilities
    getTeamById,
    getTeamMembersById,
    
    // Role checking utilities
    hasRoleInCurrentTeam,
    hasAnyRoleInCurrentTeam,
    getTeamMember,
    isUserMemberOfCurrentTeam,
    
    // Cache management
    invalidateCache: (pattern) => invalidateCache(pattern),
    refreshTeamData: (teamId) => {
      invalidateCache(`team_${teamId}`);
      invalidateCache(`members_${teamId}`);
    },
    
  }), [
    currentTeam,
    userTeams,
    teamMembers,
    loading,
    error,
    userRole,
    isCurrentUserManager,
    isCurrentUserPlayer,
    switchToTeam,
    refreshCurrentTeam,
    createAndSwitchToTeam,
    joinTeam,
    loadUserTeams,
    getTeamById,
    getTeamMembersById,
    hasRoleInCurrentTeam,
    hasAnyRoleInCurrentTeam,
    getTeamMember,
    isUserMemberOfCurrentTeam,
    invalidateCache
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