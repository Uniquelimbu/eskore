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

// Mock user data, now richer with profile fields
const mockUserData = {
  id: 'user123',
  email: 'testuser@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user', // Primary role
  roles: ['user', 'athlete_profile_access'], // Example of multiple roles
  profileImageUrl: '/images/mockups/default-avatar.png',
  bio: 'A passionate eSports enthusiast and competitive player. Always looking to improve and connect with others in the community.',
  country: 'US',
  position: 'Mid Laner',
  height: 175, // cm
  dob: '1995-08-15',
  socialLinks: {
    twitter: 'https://twitter.com/testuser',
    twitch: 'https://twitch.tv/testuser'
  },
  gameSpecificStats: {
    leagueOfLegends: { rank: 'Diamond IV', mainRole: 'Mid' },
    valorant: { rank: 'Immortal 1', mainAgent: 'Jett' }
  },
  status: 'active',
  lastLogin: new Date().toISOString(),
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
  // ... any other fields from your User model
};

// Mock API responses
export const mockApi = {
  login: async (credentials) => {
    await delay(700);
    const failure = maybeFailRandomly(0.1); // 10% chance of login failure
    if (failure) throw failure;

    if (credentials.email === 'test@example.com' && credentials.password === 'password') {
      return {
        success: true,
        user: { ...mockUserData, email: credentials.email }, // Return full user profile
        token: 'mock-jwt-token-logged-in',
        redirectUrl: '/dashboard'
      };
    }
    throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  },

  register: async (userData) => {
    await delay(1000);
    const failure = maybeFailRandomly(0.05);
    if (failure) throw failure;
    
    // Simulate email check
    if (userData.email === 'existing@example.com') {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', {
        email: ['Email already exists.']
      });
    }

    return {
      success: true,
      user: { // Return a representation of the newly created user profile
        ...mockUserData, // Base mock
        id: `newUser-${Date.now()}`, // Unique ID for new user
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        // Other fields from userData if provided, or defaults
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: 'mock-jwt-token-registered'
    };
  },
  
  getCurrentUser: async () => { // This maps to /api/auth/me or /api/users/profile (for self)
    await delay(500);
    const failure = maybeFailRandomly();
    if (failure) throw failure;
    
    // This should return the full user profile object as defined in mockUserData
    return { // The backend /me or /api/users/profile returns the user object directly
      ...mockUserData 
    };
  },
  
  logout: async () => {
    await delay(300);
    return {
      success: true,
      message: 'Logged out successfully'
    };
  },
  
  getStatsSummary: async (params) => { // Corresponds to GET /api/users/stats
    await delay(700);
    const failure = maybeFailRandomly();
    if (failure) throw failure;
    
    const timeframe = params?.timeframe || 'all-time';
    let stats = { // Example stats structure
      userId: mockUserData.id,
      timeframe,
      matchesPlayed: 150,
      winRate: 55.5,
      kda: 2.1,
      averageScore: 12500,
      // ... other relevant stats
    };

    if (timeframe === 'week') {
      stats = {
        ...stats,
        matchesPlayed: Math.floor(stats.matchesPlayed / 10),
        winRate: stats.winRate + 5.2,
        kda: stats.kda + 0.3
      };
    } else if (timeframe === 'month') {
      stats = {
        ...stats,
        matchesPlayed: Math.floor(stats.matchesPlayed / 3),
        winRate: stats.winRate + 2.1,
        kda: stats.kda + 0.1
      };
    }
    return stats; // Return stats object directly
  },
  
  getRecentActivity: async (params) => { // Corresponds to GET /api/users/activity
    await delay(600);
    const failure = maybeFailRandomly();
    if (failure) throw failure;
    
    const limit = params?.limit || 5;
    const activities = Array.from({ length: limit }, (_, i) => ({
      id: `activity${Date.now() - i * 1000}`,
      userId: mockUserData.id,
      type: i % 3 === 0 ? 'match_completed' : (i % 3 === 1 ? 'achievement_unlocked' : 'profile_updated'),
      description: i % 3 === 0 ? `Completed a match in Valorant` : (i % 3 === 1 ? `Unlocked 'Sharpshooter' achievement` : `Updated profile bio`),
      timestamp: new Date(Date.now() - i * 3600000 * (i + 1)).toISOString(),
      details: i % 3 === 0 ? { matchId: `match${i}`, score: '13-9 W' } : (i % 3 === 1 ? { achievement: 'Sharpshooter' } : {}),
    }));
    return activities; // Return activities array directly
  },
  
  // REMOVE getAthleteProfile and related mocks if they exist
  // The functionality is now covered by getUserProfile (part of profileService)
  // which would call getCurrentUser (for self) or a specific user profile endpoint.

  // Mock for profileService.getUserProfile (current user)
  // This is essentially the same as getCurrentUser for the mock
  getUserProfile: async (userId) => {
    await delay(400);
    const failure = maybeFailRandomly();
    if (failure) throw failure;

    if (userId && userId !== mockUserData.id) {
      // Simulate fetching another user's public profile
      return {
        ...mockUserData, // Base, but override sensitive fields
        id: userId,
        firstName: "Public",
        lastName: "User",
        email: `public_${userId}@example.com`, // Or hide email for public profiles
        // Fewer details for a public profile
        socialLinks: { twitter: `https://twitter.com/${userId}`},
        gameSpecificStats: { valorant: { rank: 'Gold' } },
      };
    }
    // For current user or if userId matches mockUserData.id
    return { ...mockUserData };
  },

  // Mock for profileService.updateUserProfile
  updateUserProfile: async (profileData) => {
    await delay(800);
    const failure = maybeFailRandomly(0.05);
    if (failure) throw failure;

    // Simulate update
    Object.assign(mockUserData, profileData); // Update the global mock user data
    return { ...mockUserData }; // Return the updated profile
  },

  // Mock for profileService.updateProfileImage
  updateProfileImage: async (formData) => {
    await delay(1200); // Simulate upload time
    const failure = maybeFailRandomly(0.05);
    if (failure) throw failure;

    // Simulate image URL update
    const newImageUrl = `/images/mockups/new-avatar-${Date.now()}.png`;
    mockUserData.profileImageUrl = newImageUrl;
    return { 
      success: true, 
      message: 'Profile image updated (mock).', 
      user: { ...mockUserData } // Return updated user profile
    };
  },

  // Mock for dashboardService.getUpcomingMatches
  getUpcomingMatches: async () => {
    await delay(550);
    const failure = maybeFailRandomly();
    if (failure) throw failure;
    return [ // Return array of matches directly
      { id: 'matchUpcoming1', userId: mockUserData.id, game: 'Valorant', opponent: 'Team Alpha', date: new Date(Date.now() + 86400000 * 2).toISOString(), time: '18:00 UTC', tournament: 'Weekly Showdown #3' },
      { id: 'matchUpcoming2', userId: mockUserData.id, game: 'League of Legends', opponent: 'Shadow Syndicate', date: new Date(Date.now() + 86400000 * 5).toISOString(), time: '20:00 UTC', tournament: 'Community Cup S2' },
    ];
  },

  // Mock for dashboardService.getGamePerformance
  getGamePerformance: async (gameId) => {
    await delay(650);
    const failure = maybeFailRandomly();
    if (failure) throw failure;
    if (gameId === 'valorant') {
      return { // Return performance object directly
        userId: mockUserData.id,
        gameId: 'valorant',
        rank: 'Immortal 1',
        winRate: '62%',
        avgCombatScore: 258,
        mainAgent: 'Jett',
        // ... other Valorant specific stats
      };
    } else if (gameId === 'leagueOfLegends') {
      return {
        userId: mockUserData.id,
        gameId: 'leagueOfLegends',
        rank: 'Diamond IV',
        winRate: '58%',
        avgKDA: '3.5/2.1/7.8',
        mainRole: 'Mid',
        // ... other LoL specific stats
      };
    }
    throw new ApiError('Game performance data not found for this game.', 404, 'GAME_PERF_NOT_FOUND');
  }
};

// Helper to decide whether to use mock API based on environment variable
export const shouldUseMockApi = () => {
  return process.env.REACT_APP_ENABLE_MOCK_API === 'true';
};

export default mockApi;
