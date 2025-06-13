import { CACHE_CONFIG } from '../constants/teamConstants';

/**
 * Cache manager for team data
 */
export class TeamCacheManager {
  constructor() {
    this.teamCache = new Map();
    this.memberCache = new Map();
    this.lastFetchTime = new Map();
  }

  /**
   * Check if cache entry is valid
   */
  isCacheValid(key, duration = CACHE_CONFIG.TEAM_CACHE_DURATION) {
    const lastFetch = this.lastFetchTime.get(key);
    if (!lastFetch) return false;
    return Date.now() - lastFetch < duration;
  }

  /**
   * Get cached data if valid
   */
  getCachedData(key, cache, duration = CACHE_CONFIG.TEAM_CACHE_DURATION) {
    if (this.isCacheValid(key, duration)) {
      console.log(`CacheManager: Using cached data for ${key}`);
      return cache.get(key);
    }
    return null;
  }

  /**
   * Set cached data with timestamp
   */
  setCachedData(key, data, cache) {
    console.log(`CacheManager: Caching data for ${key}`);
    cache.set(key, data);
    this.lastFetchTime.set(key, Date.now());
    
    // Cleanup old entries if cache is too large
    this.cleanupCache(cache);
  }

  /**
   * Invalidate cache entries matching pattern
   */
  invalidateCache(pattern, teamCache, memberCache) {
    console.log(`CacheManager: Invalidating cache for pattern: ${pattern}`);
    
    const keysToRemove = [];
    
    // Find keys matching pattern
    for (const key of teamCache.keys()) {
      if (key.includes(pattern)) keysToRemove.push(key);
    }
    
    for (const key of memberCache.keys()) {
      if (key.includes(pattern)) keysToRemove.push(key);
    }
    
    for (const key of this.lastFetchTime.keys()) {
      if (key.includes(pattern)) keysToRemove.push(key);
    }

    // Remove matched keys
    keysToRemove.forEach(key => {
      teamCache.delete(key);
      memberCache.delete(key);
      this.lastFetchTime.delete(key);
    });

    console.log(`CacheManager: Removed ${keysToRemove.length} cache entries`);
  }

  /**
   * Cleanup old cache entries
   */
  cleanupCache(cache) {
    if (cache.size <= CACHE_CONFIG.MAX_CACHE_SIZE) return;
    
    // Get entries sorted by last fetch time
    const entries = Array.from(this.lastFetchTime.entries())
      .sort(([, timeA], [, timeB]) => timeA - timeB);
    
    // Remove oldest entries
    const entriesToRemove = entries.slice(0, cache.size - CACHE_CONFIG.MAX_CACHE_SIZE);
    
    entriesToRemove.forEach(([key]) => {
      cache.delete(key);
      this.lastFetchTime.delete(key);
    });
    
    console.log(`CacheManager: Cleaned up ${entriesToRemove.length} old cache entries`);
  }

  /**
   * Clear all cache
   */
  clearCache(teamCache, memberCache) {
    teamCache.clear();
    memberCache.clear();
    this.lastFetchTime.clear();
    console.log('CacheManager: All cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(teamCache, memberCache) {
    return {
      teamCacheSize: teamCache.size,
      memberCacheSize: memberCache.size,
      totalCacheSize: teamCache.size + memberCache.size,
      oldestEntry: Math.min(...Array.from(this.lastFetchTime.values())),
      newestEntry: Math.max(...Array.from(this.lastFetchTime.values()))
    };
  }
}

// Create singleton instance
export const cacheManager = new TeamCacheManager();

// Helper functions for use in hooks
export const isCacheValid = (key, duration, lastFetchTime) => {
  const lastFetch = lastFetchTime.get(key);
  return lastFetch && (Date.now() - lastFetch) < duration;
};

export const getCachedData = (key, cache, duration, lastFetchTime) => {
  if (isCacheValid(key, duration, lastFetchTime)) {
    console.log(`Cache: Using cached data for ${key}`);
    return cache.get(key);
  }
  return null;
};

export const setCachedData = (key, data, cache, setCache, lastFetchTime, setLastFetchTime) => {
  console.log(`Cache: Setting cached data for ${key}`);
  setCache(prev => new Map(prev).set(key, data));
  setLastFetchTime(prev => new Map(prev).set(key, Date.now()));
};

export const invalidateCachePattern = (pattern, caches, setCaches) => {
  console.log(`Cache: Invalidating pattern ${pattern}`);
  
  const { teamCache, memberCache, lastFetchTime } = caches;
  const { setTeamCache, setMemberCache, setLastFetchTime } = setCaches;
  
  const keysToRemove = [];
  
  // Find matching keys
  for (const key of teamCache.keys()) {
    if (key.includes(pattern)) keysToRemove.push(key);
  }
  
  for (const key of memberCache.keys()) {
    if (key.includes(pattern)) keysToRemove.push(key);
  }
  
  // Remove keys
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
};