import { useCallback, useMemo } from 'react';
import { useTeam } from './useTeam';
import { CACHE_CONFIG } from '../constants/teamConstants';

/**
 * Enhanced hook for team cache management with advanced features
 */
export const useTeamCache = () => {
  // Get the actual context to access state
  const context = useTeam();
  const { invalidateCache, refreshTeamData } = context;
  
  // Access state directly from context
  const state = context;

  // Invalidate specific patterns with callback support
  const invalidateTeamCache = useCallback((teamId) => {
    invalidateCache(`team_${teamId}`);
  }, [invalidateCache]);

  const invalidateMemberCache = useCallback((teamId) => {
    invalidateCache(`members_${teamId}`);
  }, [invalidateCache]);

  const invalidateUserTeamsCache = useCallback((userId) => {
    invalidateCache(`user_teams_${userId}`);
  }, [invalidateCache]);

  // Invalidate all team-related cache
  const invalidateAllTeamCache = useCallback((teamId) => {
    invalidateTeamCache(teamId);
    invalidateMemberCache(teamId);
  }, [invalidateTeamCache, invalidateMemberCache]);

  // Refresh specific team data
  const refreshTeam = useCallback((teamId) => {
    refreshTeamData(teamId);
  }, [refreshTeamData]);

  // Clear all cache
  const clearAllCache = useCallback(() => {
    invalidateCache(''); // Empty pattern matches all
  }, [invalidateCache]);

  // Preload team data
  const preloadTeamData = useCallback(async (teamId) => {
    try {
      // This would trigger loading and caching
      refreshTeam(teamId);
      return { success: true };
    } catch (error) {
      console.error('Cache: Error preloading team data:', error);
      return { success: false, error: error.message };
    }
  }, [refreshTeam]);

  // Advanced cache statistics
  const getCacheStatistics = useMemo(() => {
    const teamCacheSize = state?.teamCache?.size || 0;
    const memberCacheSize = state?.memberCache?.size || 0;
    const lastFetchTimes = Array.from(state?.lastFetchTime?.values() || []);
    
    return {
      teamCacheSize,
      memberCacheSize,
      totalCacheSize: teamCacheSize + memberCacheSize,
      oldestEntry: lastFetchTimes.length > 0 ? Math.min(...lastFetchTimes) : null,
      newestEntry: lastFetchTimes.length > 0 ? Math.max(...lastFetchTimes) : null,
      cacheHitRate: calculateCacheHitRate(),
      isHealthy: teamCacheSize + memberCacheSize < CACHE_CONFIG.MAX_CACHE_SIZE
    };
  }, [state?.teamCache, state?.memberCache, state?.lastFetchTime]);

  // Calculate cache hit rate (simplified)
  const calculateCacheHitRate = useCallback(() => {
    // This would require tracking cache hits/misses
    // For now, return a simple metric based on cache size vs time
    const now = Date.now();
    const recentEntries = Array.from(state?.lastFetchTime?.values() || [])
      .filter(time => (now - time) < CACHE_CONFIG.TEAM_CACHE_DURATION);
    
    return state?.lastFetchTime?.size > 0 
      ? (recentEntries.length / state.lastFetchTime.size) * 100 
      : 0;
  }, [state?.lastFetchTime]);

  // Cache optimization suggestions
  const getOptimizationSuggestions = useMemo(() => {
    const stats = getCacheStatistics;
    const suggestions = [];

    if (stats.totalCacheSize > CACHE_CONFIG.MAX_CACHE_SIZE * 0.8) {
      suggestions.push({
        type: 'warning',
        message: 'Cache approaching size limit. Consider clearing old entries.',
        action: 'clearOldEntries'
      });
    }

    if (stats.cacheHitRate < 50) {
      suggestions.push({
        type: 'info',
        message: 'Low cache hit rate. Consider increasing cache duration.',
        action: 'increaseCacheDuration'
      });
    }

    return suggestions;
  }, [getCacheStatistics]);

  // Warm up cache with frequently accessed data
  const warmupCache = useCallback(async (teamIds = []) => {
    console.log('Cache: Warming up cache for teams:', teamIds);
    
    const results = await Promise.allSettled(
      teamIds.map(teamId => preloadTeamData(teamId))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      total: teamIds.length,
      successful,
      failed,
      results
    };
  }, [preloadTeamData]);

  // Smart cache cleanup based on usage patterns
  const smartCleanup = useCallback(() => {
    console.log('Cache: Performing smart cleanup');
    
    const now = Date.now();
    const stats = getCacheStatistics;
    
    if (stats.totalCacheSize <= CACHE_CONFIG.MAX_CACHE_SIZE * 0.7) {
      console.log('Cache: No cleanup needed');
      return { cleaned: 0, reason: 'below_threshold' };
    }

    // Clean entries older than 2x cache duration
    const cutoffTime = now - (CACHE_CONFIG.TEAM_CACHE_DURATION * 2);
    let cleanedCount = 0;

    for (const [key, time] of state?.lastFetchTime?.entries() || []) {
      if (time < cutoffTime) {
        invalidateCache(key);
        cleanedCount++;
      }
    }

    console.log(`Cache: Cleaned ${cleanedCount} old entries`);
    return { cleaned: cleanedCount, reason: 'automatic_cleanup' };
  }, [getCacheStatistics, invalidateCache, state?.lastFetchTime]);

  return {
    // Basic cache operations
    invalidateCache,
    invalidateTeamCache,
    invalidateMemberCache,
    invalidateUserTeamsCache,
    invalidateAllTeamCache,
    refreshTeam,
    clearAllCache,
    preloadTeamData,

    // Advanced features
    getCacheStatistics,
    getOptimizationSuggestions,
    warmupCache,
    smartCleanup,

    // Cache health monitoring
    isCacheHealthy: getCacheStatistics.isHealthy,
    cacheHitRate: getCacheStatistics.cacheHitRate,

    // Utility functions
    isCacheExpired: (key) => {
      const lastFetch = state?.lastFetchTime?.get(key);
      return !lastFetch || (Date.now() - lastFetch) > CACHE_CONFIG.TEAM_CACHE_DURATION;
    }
  };
};

/**
 * Hook for cache monitoring and debugging
 */
export const useTeamCacheDebug = () => {
  const context = useTeam();
  const { getCacheStatistics } = useTeamCache();

  const debugInfo = useMemo(() => ({
    cacheContents: {
      teams: Array.from(context?.teamCache?.keys() || []),
      members: Array.from(context?.memberCache?.keys() || []),
      timestamps: Object.fromEntries(context?.lastFetchTime?.entries() || [])
    },
    statistics: getCacheStatistics,
    recommendations: {
      shouldCleanup: getCacheStatistics.totalCacheSize > CACHE_CONFIG.MAX_CACHE_SIZE * 0.8,
      shouldWarmup: getCacheStatistics.cacheHitRate < 70,
      isOptimal: getCacheStatistics.isHealthy && getCacheStatistics.cacheHitRate > 80
    }
  }), [context, getCacheStatistics]);

  return debugInfo;
};