import { mockUserData, mockStats, mockActivities } from './mockData';

// Simulate API delay with some randomness
const delay = (ms) => new Promise(resolve => 
  setTimeout(resolve, ms + Math.random() * 300)
);

// Track login attempts for simulating rate limiting
let loginAttempts = {};

// Simulate successful API responses rate (0.9 = 90% success)
const SUCCESS_RATE = 0.95;

// Add some randomized failures to simulate real-world conditions
const maybeFailRandomly = () => {
  // Success most of the time
  if (Math.random() <= SUCCESS_RATE) return false;
  
  // Different error types to simulate
  const errors = [
    { status: 500, message: 'Internal Server Error - Something went wrong on our end.' },
    { status: 503, message: 'Service temporarily unavailable. Please try again later.' },
    { status: 'NETWORK_ERROR', message: 'Network error. Please check your connection.' }
  ];
  
  // Return a random error
  return errors[Math.floor(Math.random() * errors.length)];
};

// Mock API responses
export const mockApi = {
  login: async (credentials) => {
    await delay(800);
    
    // Check for random failure
    const failure = maybeFailRandomly();
    if (failure) throw failure;
    
    // Track login attempts for rate limiting
    const ip = '127.0.0.1'; // pretend IP
    loginAttempts[ip] = (loginAttempts[ip] || 0) + 1;
    
    // Simulate rate limiting
    if (loginAttempts[ip] > 5) {
      throw {
        message: 'Too many login attempts. Please try again later.',
        status: 429,
        data: { error: { message: 'Rate limit exceeded' } }
      };
    }
    
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
    
    // Check for random failure
    const failure = maybeFailRandomly();
    if (failure) throw failure;
    
    // Simulate validation error if missing fields
    if (!userData.email || !userData.password) {
      throw {
        message: 'Validation failed',
        status: 400,
        data: { 
          error: { 
            message: 'Validation failed', 
            fields: {
              ...(userData.email ? {} : { email: 'Email is required' }),
              ...(userData.password ? {} : { password: 'Password is required' })
            }
          } 
        }
      };
    }
    
    // Simulate account already exists
    if (userData.email === 'existing@example.com') {
      throw {
        message: 'Email already in use',
        status: 409,
        data: { error: { message: 'An account with this email already exists' } }
      };
    }
    
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
    
    // Check for random failure
    const failure = maybeFailRandomly();
    if (failure) throw failure;
    
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
  
  getStatsSummary: async (params) => {
    await delay(700);
    
    // Check for random failure
    const failure = maybeFailRandomly();
    if (failure) throw failure;
    
    // Vary the response based on the timeframe parameter if provided
    const timeframe = params?.timeframe || 'all-time';
    
    if (timeframe === 'week') {
      return {
        ...mockStats,
        totalMatches: Math.floor(mockStats.totalMatches / 10),
        winRate: mockStats.winRate + 5.2, // Better recent performance
        kda: mockStats.kda + 0.3
      };
    } else if (timeframe === 'month') {
      return {
        ...mockStats,
        totalMatches: Math.floor(mockStats.totalMatches / 3),
        winRate: mockStats.winRate + 2.1,
        kda: mockStats.kda + 0.1
      };
    }
    
    return mockStats;
  },
  
  getRecentActivity: async () => {
    await delay(600);
    
    // Check for random failure
    const failure = maybeFailRandomly();
    if (failure) throw failure;
    
    return mockActivities;
  },
  
  getAthleteProfile: async (params) => {
    await delay(700);
    
    // Check for random failure
    const failure = maybeFailRandomly();
    if (failure) throw failure;
    
    return {
      ...mockUserData,
      bio: "Competitive gamer focused on FPS games. Trained with professional teams.",
      country: "United States",
      dateJoined: "2023-01-15T10:30:00Z",
      followers: 342,
      following: 128,
      primaryGame: "CS:GO",
      totalMatches: mockStats.totalMatches,
      winRate: mockStats.winRate,
      achievements: [
        { id: 1, title: "Sharpshooter", description: "Achieve 80% headshot rate", date: "2023-05-10T14:30:00Z" },
        { id: 2, title: "Marathon", description: "Play 100 matches", date: "2023-03-22T18:15:00Z" }
      ]
    };
  }
};

// Helper to decide whether to use mock API based on environment variable
export const shouldUseMockApi = () => {
  return process.env.REACT_APP_ENABLE_MOCK_API === 'true';
};

export default mockApi;
