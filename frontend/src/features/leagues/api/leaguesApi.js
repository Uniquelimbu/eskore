import { api } from '../../../utils/api/client';

export const leaguesAPI = {
  getAll: (params) => api.get('/api/leagues', { params }),
  getById: (id) => api.get(`/api/leagues/${id}`),
  getStandings: (id) => api.get(`/api/leagues/${id}/standings`),
  create: (data) => api.post('/api/leagues', data),
  update: (id, data) => api.patch(`/api/leagues/${id}`, data),
  delete: (id) => api.delete(`/api/leagues/${id}`)
};

export default leaguesAPI;
