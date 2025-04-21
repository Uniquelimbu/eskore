import { api } from '../../../utils/api/client';

/**
 * Teams API service
 */
export const teamsAPI = {
  /**
   * Get all teams
   * @returns {Promise} API response with teams data
   */
  getAll: () => {
    return api.get('/api/teams');
  },

  /**
   * Get a specific team by ID
   * @param {string|number} id - Team ID
   * @returns {Promise} API response with team data
   */
  getById: (id) => {
    return api.get(`/api/teams/${id}`);
  },

  /**
   * Create a new team
   * @param {Object} teamData - Team data
   * @returns {Promise} API response
   */
  create: (teamData) => {
    return api.post('/api/teams', teamData);
  },

  /**
   * Update a team
   * @param {string|number} id - Team ID
   * @param {Object} teamData - Team data
   * @returns {Promise} API response
   */
  update: (id, teamData) => {
    return api.put(`/api/teams/${id}`, teamData);
  },

  /**
   * Delete a team
   * @param {string|number} id - Team ID
   * @returns {Promise} API response
   */
  delete: (id) => {
    return api.delete(`/api/teams/${id}`);
  }
};

export default teamsAPI;
