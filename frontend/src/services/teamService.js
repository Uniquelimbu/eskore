import apiClient from './apiClient';

// Cache for teams data
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let teamsCache = {
  data: null,
  timestamp: 0
};

// Function to debounce API calls
let fetchTeamsTimeout = null;
let pendingPromise = null;

export const teamService = {
  // Get all teams with caching and debouncing
  getTeams: async () => {
    const now = Date.now();
    
    // Return cache if it's still valid
    if (teamsCache.data && (now - teamsCache.timestamp) < CACHE_TTL) {
      return teamsCache.data;
    }
    
    // If there's already a request in progress, return that promise
    if (pendingPromise) {
      return pendingPromise;
    }
    
    // Clear any existing timeout
    if (fetchTeamsTimeout) {
      clearTimeout(fetchTeamsTimeout);
    }
    
    // Create a new promise and set a timeout
    pendingPromise = new Promise((resolve) => {
      fetchTeamsTimeout = setTimeout(async () => {
        try {
          // FIXED: Removed duplicate /api prefix
          const response = await apiClient.get('/teams');
          
          // Update cache
          teamsCache.data = response;
          teamsCache.timestamp = Date.now();
          
          // Clear pending state
          pendingPromise = null;
          fetchTeamsTimeout = null;
          
          resolve(response);
        } catch (error) {
          console.error('Error fetching teams:', error);
          pendingPromise = null;
          fetchTeamsTimeout = null;
          resolve([]);
        }
      }, 300); // 300ms debounce delay
    });
    
    return pendingPromise;
  },
  
  // Other team-related methods...
  // FIXED: Removed duplicate /api prefixes from all methods
  getTeam: (id) => apiClient.get(`/teams/${id}`),
  createTeam: (data) => apiClient.post('/teams', data),
  updateTeam: (id, data) => apiClient.put(`/teams/${id}`, data),
  deleteTeam: (id) => apiClient.delete(`/teams/${id}`),
  
  // Force refresh the teams data
  refreshTeams: async () => {
    try {
      // FIXED: Removed duplicate /api prefix
      const response = await apiClient.get('/teams?refresh=true');
      
      // Update cache
      teamsCache.data = response;
      teamsCache.timestamp = Date.now();
      
      return response;
    } catch (error) {
      console.error('Error refreshing teams:', error);
      return [];
    }
  }
};

export default teamService;
