import { mockUserData, mockStats, mockActivities } from './mockData';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export const mockApi = {
  login: async (credentials) => {
    await delay(800);
    if (credentials.email === 'test@example.com' && credentials.password === 'password123') {
      return {
        success: true,
        user: mockUserData,
        token: 'mock-jwt-token'
      };
    }
    throw {
      message: 'Invalid credentials',
      status: 401,
      data: { error: { message: 'Invalid email or password' } }
    };
  },
  
  register: async (userData) => {
    await delay(1200);
    return {
      success: true,
      athlete: {
        ...mockUserData,
        email: userData.email || mockUserData.email,
        firstName: userData.firstName || mockUserData.firstName,
        lastName: userData.lastName || mockUserData.lastName
      },
      token: 'mock-jwt-token'
    };
  },
  
  getCurrentUser: async () => {
    await delay(500);
    return {
      success: true,
      user: mockUserData
    };
  },
  
  logout: async () => {
    await delay(300);
    return {
      success: true,
      message: 'Logged out successfully'
    };
  },
  
  getStatsSummary: async () => {
    await delay(700);
    return mockStats;
  },
  
  getRecentActivity: async () => {
    await delay(600);
    return mockActivities;
  }
};

// Helper to decide whether to use mock API based on environment variable
export const shouldUseMockApi = () => {
  return process.env.REACT_APP_ENABLE_MOCK_API === 'true';
};

export default mockApi;
