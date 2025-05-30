import apiClient from '../core/apiClient';

const dashboardService = {
  // Get the current user's stats summary
  getStatsSummary: async (timeframe = 'all-time') => {
    try {
      // Uses the authenticated user's context on the backend
      const response = await apiClient.get(`/users/stats?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stats summary:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get recent activity for the current user's dashboard
  getRecentActivity: async (limit = 10) => {
    try {
      // Validate limit as a positive integer before sending
      const safeLimit = Math.max(1, Math.min(50, parseInt(limit) || 10));
      
      // Uses the authenticated user's context on the backend
      const response = await apiClient.get(`/users/activity`, {
        params: { limit: safeLimit }
      });
      
      return response || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error.response?.data || error.message || 'Unknown error');
      // Return empty array instead of throwing to avoid breaking the UI
      return [];
    }
  },

  // Get upcoming matches for the current user
  getUpcomingMatches: async () => {
    try {
      // FIXED: Removed duplicate /api prefix
      const response = await apiClient.get('/users/matches/upcoming');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming matches:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get game performance data for the current user
  getGamePerformance: async (gameId) => {
    try {
      // FIXED: Removed duplicate /api prefix
      const response = await apiClient.get(`/users/games/${gameId}/performance`);
      return response.data;
    } catch (error) {
      console.error('Error fetching game performance:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
  
  // Get leaderboard data 
  getLeaderboard: async (gameId, metric = 'winRate', limit = 10) => {
    try {
      // FIXED: Removed duplicate /api prefix
      const response = await apiClient.get(`/leaderboard`, {
        params: { gameId, metric, limit }
      });
      return response;
    } catch (error) {
      console.error('Error fetching leaderboard:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
  
  // Get athlete profile
  getAthleteProfile: async (athleteId) => {
    try {
      // FIXED: Removed duplicate /api prefix
      const response = await apiClient.get(`/athletes/${athleteId}/profile`);
      return response;
    } catch (error) {
      console.error('Error fetching athlete profile:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
  
  // Update athlete profile
  updateAthleteProfile: async (profileData) => {
    try {
      // FIXED: Removed duplicate /api prefix
      return await apiClient.put('/athletes/profile', profileData);
    } catch (error) {
      throw error;
    }
  },
  
  // Submit match result
  submitMatchResult: async (matchData) => {
    try {
      return await apiClient.post('/matches', matchData);
    } catch (error) {
      throw error;
    }
  }
};

export default dashboardService;
