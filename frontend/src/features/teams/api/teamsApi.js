import { api } from '../../../utils/api/client';

export const teamsAPI = {
  getAll: (page = 1, limit = 10) => api.get(`/api/teams?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/api/teams/${id}`),
  create: (teamData) => api.post('/api/teams', teamData),
  update: (id, teamData) => api.patch(`/api/teams/${id}`, teamData),
  delete: (id) => api.delete(`/api/teams/${id}`),
};

export default teamsAPI;
