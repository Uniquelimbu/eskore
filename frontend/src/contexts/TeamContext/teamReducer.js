import { TEAM_ACTIONS, initialTeamState } from './constants/teamConstants';
import { sanitizeTeamData, sanitizeMemberData } from './utils/teamValidation';

export const teamReducer = (state, action) => {
  try {
    switch (action.type) {
      case TEAM_ACTIONS.SET_LOADING:
        return {
          ...state,
          loading: action.payload,
          error: action.payload ? null : state.error // Clear error when starting to load
        };

      case TEAM_ACTIONS.SET_ERROR:
        return {
          ...state,
          error: action.payload,
          loading: false
        };

      case TEAM_ACTIONS.CLEAR_ERROR:
        return {
          ...state,
          error: null
        };

      case TEAM_ACTIONS.SET_CURRENT_TEAM:
        const sanitizedTeam = action.payload ? sanitizeTeamData(action.payload) : null;
        return {
          ...state,
          currentTeam: sanitizedTeam,
          error: null,
          // Clear members if switching to different team
          teamMembers: sanitizedTeam?.id !== state.currentTeam?.id ? [] : state.teamMembers
        };

      case TEAM_ACTIONS.SET_USER_TEAMS:
        const sanitizedTeams = Array.isArray(action.payload) 
          ? action.payload.map(team => sanitizeTeamData(team)).filter(Boolean)
          : [];
        
        return {
          ...state,
          userTeams: sanitizedTeams,
          error: null
        };

      case TEAM_ACTIONS.SET_TEAM_MEMBERS:
        const sanitizedMembers = Array.isArray(action.payload)
          ? action.payload.map(member => sanitizeMemberData(member)).filter(Boolean)
          : [];
        
        return {
          ...state,
          teamMembers: sanitizedMembers,
          error: null
        };

      case TEAM_ACTIONS.SET_USER_ROLE:
        return {
          ...state,
          userRole: action.payload
        };

      case TEAM_ACTIONS.SET_MANAGER_STATUS:
        return {
          ...state,
          isManager: Boolean(action.payload)
        };

      case TEAM_ACTIONS.SET_PLAYER_STATUS:
        return {
          ...state,
          isPlayer: Boolean(action.payload)
        };

      case TEAM_ACTIONS.UPDATE_TEAM_CACHE:
        if (!action.payload?.key || action.payload?.data === undefined) {
          console.warn('TeamReducer: Invalid cache update payload');
          return state;
        }
        
        return {
          ...state,
          teamCache: new Map(state.teamCache).set(action.payload.key, action.payload.data),
          lastFetchTime: new Map(state.lastFetchTime).set(action.payload.key, Date.now())
        };

      case TEAM_ACTIONS.UPDATE_MEMBER_CACHE:
        if (!action.payload?.key || action.payload?.data === undefined) {
          console.warn('TeamReducer: Invalid member cache update payload');
          return state;
        }
        
        return {
          ...state,
          memberCache: new Map(state.memberCache).set(action.payload.key, action.payload.data),
          lastFetchTime: new Map(state.lastFetchTime).set(action.payload.key, Date.now())
        };

      case TEAM_ACTIONS.INVALIDATE_CACHE:
        const { pattern } = action.payload || {};
        if (typeof pattern !== 'string') {
          console.warn('TeamReducer: Invalid cache pattern provided for invalidation');
          return state;
        }

        const newTeamCache = new Map(state.teamCache);
        const newMemberCache = new Map(state.memberCache);
        const newLastFetchTime = new Map(state.lastFetchTime);

        // Remove entries matching pattern
        let removedCount = 0;
        
        // If pattern is empty, clear all caches
        if (pattern === '') {
          newTeamCache.clear();
          newMemberCache.clear();
          newLastFetchTime.clear();
          removedCount = state.teamCache.size + state.memberCache.size;
        } else {
          // Remove entries matching pattern
          for (const key of newTeamCache.keys()) {
            if (key.includes(pattern)) {
              newTeamCache.delete(key);
              newLastFetchTime.delete(key);
              removedCount++;
            }
          }

          for (const key of newMemberCache.keys()) {
            if (key.includes(pattern)) {
              newMemberCache.delete(key);
              newLastFetchTime.delete(key);
              removedCount++;
            }
          }
        }

        console.log(`TeamReducer: Invalidated ${removedCount} cache entries for pattern: "${pattern}"`);

        return {
          ...state,
          teamCache: newTeamCache,
          memberCache: newMemberCache,
          lastFetchTime: newLastFetchTime
        };

      // Fix inconsistent action type usage
      case TEAM_ACTIONS.RESET_TEAM_STATE:
      case 'RESET_TEAM_STATE': // Support both for backward compatibility
        console.log('TeamReducer: Resetting team state');
        return {
          ...initialTeamState,
          teamCache: new Map(),
          memberCache: new Map(),
          lastFetchTime: new Map()
        };

      default:
        console.warn(`TeamReducer: Unknown action type: ${action.type}`);
        return state;
    }
  } catch (error) {
    console.error('TeamReducer: Error processing action:', action.type, error);
    return {
      ...state,
      error: `Reducer error: ${error.message}`,
      loading: false
    };
  }
};