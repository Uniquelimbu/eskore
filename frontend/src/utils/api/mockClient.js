/**
 * Mock API client for development
 * Used when REACT_APP_ENABLE_MOCK_API=true or when API server is unavailable
 */

import { getToken } from '../sessionUtils';

// Mock data store
const mockData = {
  users: [
    { id: 1, email: 'athlete@example.com', firstName: 'John', lastName: 'Doe', role: 'athlete' },
    { id: 2, email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: 'admin' }
  ],
  teams: [
    { id: 1, name: 'FC United', logoUrl: null },
    { id: 2, name: 'City FC', logoUrl: null }
  ],
  leagues: [
    { id: 1, name: 'Premier League', country: 'England' },
    { id: 2, name: 'La Liga', country: 'Spain' }
  ],
  matches: [
    { id: 1, homeTeam: 'FC United', awayTeam: 'City FC', date: '2023-06-01', status: 'upcoming' }
  ]
};

// Mock API handler
class MockAPI {
  constructor() {
    this.delay = 300; // Simulate network delay
  }

  // Helper to simulate async behavior
  async respond(data, status = 200) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return {
      data,
      status,
      headers: {}
    };
  }

  // Helper to check authentication
  isAuthenticated() {
    return !!getToken();
  }

  // Mock request methods
  async get(url, config = {}) {
    console.log('[MockAPI] GET', url, config);
    
    // Health endpoint
    if (url.includes('/api/health')) {
      return this.respond({ status: 'ok', timestamp: new Date() });
    }
    
    // Authentication endpoints
    if (url.includes('/api/auth/me')) {
      if (!this.isAuthenticated()) {
        return Promise.reject({ response: { status: 401 }});
      }
      return this.respond(mockData.users[0]);
    }
    
    // Teams endpoints
    if (url.includes('/api/teams')) {
      return this.respond(mockData.teams);
    }
    
    // Leagues endpoints
    if (url.includes('/api/leagues')) {
      return this.respond(mockData.leagues);
    }
    
    // Matches endpoints
    if (url.includes('/api/matches')) {
      return this.respond(mockData.matches);
    }
    
    return Promise.reject({
      response: {
        status: 404,
        data: { message: 'Mock API endpoint not found' }
      }
    });
  }

  async post(url, data, config = {}) {
    console.log('[MockAPI] POST', url, data, config);
    
    // Authentication endpoints
    if (url.includes('/api/auth/login')) {
      const { email, password } = data;
      const user = mockData.users.find(u => u.email === email);
      
      if (user && password === 'password') {
        return this.respond({
          token: 'mock-jwt-token',
          user
        });
      }
      
      return Promise.reject({
        response: {
          status: 401,
          data: { message: 'Invalid credentials' }
        }
      });
    }
    
    // Default response for unhandled endpoints
    return this.respond({ success: true });
  }

  // Implement other methods
  async put(url, data, config = {}) {
    console.log('[MockAPI] PUT', url, data, config);
    return this.respond({ success: true });
  }

  async patch(url, data, config = {}) {
    console.log('[MockAPI] PATCH', url, data, config);
    return this.respond({ success: true });
  }

  async delete(url, config = {}) {
    console.log('[MockAPI] DELETE', url, config);
    return this.respond({ success: true });
  }
}

export const mockApi = new MockAPI();
export default mockApi;
