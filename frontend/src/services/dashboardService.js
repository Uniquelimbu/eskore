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
  }
};

export default dashboardService;
