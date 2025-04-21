import { api } from '../../../utils/api/client';

export const matchesAPI = {
  getAll: (params) => api.get('/api/matches', { params }),
  getById: (id) => api.get(`/api/matches/${id}`),
  getUpcoming: () => api.get('/api/matches/upcoming'),
  getLive: () => api.get('/api/matches/live'),
  getCompleted: () => api.get('/api/matches/completed'),
  create: (data) => api.post('/api/matches', data),
  update: (id, data) => api.patch(`/api/matches/${id}`, data),
  updateScore: (id, scoreData) => api.post(`/api/matches/${id}/score`, scoreData),
  delete: (id) => api.delete(`/api/matches/${id}`)
};

export default matchesAPI;
