import apiClient from './apiClient';

const dashboardService = {
  // Get the current user's stats summary
  getStatsSummary: async (timeframe = 'all-time') => {
    try {
      // Uses the authenticated user's context on the backend
      const response = await apiClient.get(`/api/users/stats?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stats summary:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get recent activity for the current user's dashboard
  getRecentActivity: async (limit = 10) => {
    try {
      // Uses the authenticated user's context on the backend
      const response = await apiClient.get(`/api/users/activity?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get upcoming matches for the current user
  getUpcomingMatches: async () => {
    try {
      // Uses the authenticated user's context on the backend
      const response = await apiClient.get('/api/users/matches/upcoming');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming matches:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Get game performance data for the current user
  getGamePerformance: async (gameId) => {
    try {
      // Uses the authenticated user's context on the backend
      const response = await apiClient.get(`/api/users/games/${gameId}/performance`);
      return response.data;
    } catch (error) {
      console.error('Error fetching game performance:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
  
  // Get leaderboard data 
  getLeaderboard: async (gameId, metric = 'winRate', limit = 10) => {
    try {
      const response = await apiClient.get(`/api/leaderboard`, {
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
      const response = await apiClient.get(`/api/athletes/${athleteId}/profile`);
      return response;
    } catch (error) {
      console.error('Error fetching athlete profile:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
  
  // Update athlete profile
  updateAthleteProfile: async (profileData) => {
    try {
      return await apiClient.put('/api/athletes/profile', profileData);
    } catch (error) {
      throw error;
    }
  },
  
  // Submit match result
  submitMatchResult: async (matchData) => {
    try {
      return await apiClient.post('/api/matches', matchData);
    } catch (error) {
      throw error;
    }
  }
};

export default dashboardService;
