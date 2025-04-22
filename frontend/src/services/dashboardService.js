import apiClient from './apiClient';

const dashboardService = {
  // Get the athlete's stats summary
  getStatsSummary: async (timeframe = 'all-time') => {
    try {
      return await apiClient.get(`/api/athletes/stats?timeframe=${timeframe}`);
    } catch (error) {
      throw error;
    }
  },

  // Get recent activity for the dashboard
  getRecentActivity: async (limit = 10) => {
    try {
      return await apiClient.get(`/api/athletes/activity?limit=${limit}`);
    } catch (error) {
      throw error;
    }
  },

  // Get upcoming matches for the athlete
  getUpcomingMatches: async () => {
    try {
      return await apiClient.get('/api/athletes/matches/upcoming');
    } catch (error) {
      throw error;
    }
  },

  // Get game performance data
  getGamePerformance: async (gameId) => {
    try {
      return await apiClient.get(`/api/athletes/games/${gameId}/performance`);
    } catch (error) {
      throw error;
    }
  },
  
  // Get leaderboard data 
  getLeaderboard: async (gameId, metric = 'winRate', limit = 10) => {
    try {
      return await apiClient.get(`/api/leaderboard`, {
        params: { gameId, metric, limit }
      });
    } catch (error) {
      throw error;
    }
  },
  
  // Get athlete profile
  getAthleteProfile: async (athleteId) => {
    try {
      return await apiClient.get(`/api/athletes/${athleteId}/profile`);
    } catch (error) {
      throw error;
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
