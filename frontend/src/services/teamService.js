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
  updateTeam: async (id, data) => {
    try {
      console.log(`Updating team ${id} with data:`, data);
      
      // Add a retry mechanism for team updates
      let attempts = 0;
      const maxAttempts = 3;
      let response;
      
      while (attempts < maxAttempts) {
        try {
          response = await apiClient.patch(`/teams/${id}`, data);
          // If successful, break out of retry loop
          break;
        } catch (retryError) {
          attempts++;
          console.warn(`Team update attempt ${attempts} failed:`, retryError.message);
          
          // If we've reached max attempts, throw the error
          if (attempts >= maxAttempts) {
            throw retryError;
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
      
      // Log success and invalidate cache to ensure fresh data on next fetch
      console.log(`Team ${id} updated successfully:`, response);
      if (teamsCache.data) {
        teamsCache.timestamp = 0; // Invalidate cache
      }
      
      return response;
    } catch (error) {
      console.error(`Error updating team ${id}:`, error);
      // Rethrow for the component to handle
      throw error;
    }
  },
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
  },
  
  // Add specific function for logo update
  updateTeamLogo: async (id, logoFile) => {
    try {
      console.log(`Updating logo for team ${id}`);
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      const response = await apiClient.patch(`/teams/${id}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Invalidate cache
      if (teamsCache.data) {
        teamsCache.timestamp = 0;
      }
      
      console.log(`Team ${id} logo updated successfully:`, response);
      return response;
    } catch (error) {
      console.error(`Error updating team ${id} logo:`, error);
      throw error;
    }
  },
  
  // Add method to delete team logo
  deleteTeamLogo: async (id) => {
    try {
      console.log(`Deleting logo for team ${id}`);
      const response = await apiClient.delete(`/teams/${id}/logo`);
      
      // Invalidate cache
      if (teamsCache.data) {
        teamsCache.timestamp = 0;
      }
      
      console.log(`Team ${id} logo deleted successfully:`, response);
      return response;
    } catch (error) {
      console.error(`Error deleting team ${id} logo:`, error);
      throw error;
    }
  },
  
  /**
   * Update or create manager profile for a team
   * @param {Object} managerData - Manager profile data
   * @returns {Promise<Object>} The updated manager profile
   */
  updateManagerProfile: async (managerData) => {
    try {
      // Format the data to ensure consistency
      const formattedData = {
        playingStyle: managerData.playingStyle || 'balanced',
        preferredFormation: managerData.preferredFormation || '4-3-3',
        experience: managerData.experience !== undefined && managerData.experience !== '' ? 
                   parseInt(managerData.experience, 10) : 0
      };
      
      // Add teamId if provided
      if (managerData.teamId) {
        formattedData.teamId = managerData.teamId;
      }
      
      // Use apiClient instead of direct axios
      const response = await apiClient.post('/managers', formattedData);
      
      return response;
    } catch (error) {
      console.error('Error updating manager profile:', error);
      throw error;
    }
  },
};

export default teamService;
