import { api } from './client';
import { authAPI } from '../../features/auth/api/authApi';

// Import APIs with try-catch to handle missing modules without build errors
let teamsAPI, leaguesAPI, matchesAPI, locationAPI, athleteAPI;

// Import teams API
try {
  teamsAPI = require('../../features/teams/api/teamsApi').teamsAPI;
} catch (e) {
  console.warn('Teams API import failed:', e.message);
  teamsAPI = {
    getAll: () => Promise.resolve({ data: [] }),
    getById: () => Promise.resolve({ data: null }),
  };
}

// Import leagues API
try {
  leaguesAPI = require('../../features/leagues/api/leaguesApi').leaguesAPI;
} catch (e) {
  console.warn('Leagues API import failed:', e.message);
  leaguesAPI = {
    getAll: () => Promise.resolve({ data: [] }),
    getById: () => Promise.resolve({ data: null }),
  };
}

// Import matches API
try {
  matchesAPI = require('../../features/matches/api/matchesApi').matchesAPI;
} catch (e) {
  console.warn('Matches API import failed:', e.message);
  matchesAPI = {
    getAll: () => Promise.resolve({ data: [] }),
    getById: () => Promise.resolve({ data: null }),
  };
}

// Import location API
try {
  locationAPI = require('../../features/location/api/locationApi').locationAPI;
} catch (e) {
  console.warn('Location API import failed:', e.message);
  locationAPI = {
    getProvinces: () => Promise.resolve({ data: [] }),
    getDistricts: () => Promise.resolve({ data: [] }),
    getCities: () => Promise.resolve({ data: [] }),
  };
}

// Import athlete API
try {
  athleteAPI = require('../../features/athlete/api/athleteApi').athleteAPI;
} catch (e) {
  console.warn('Athlete API import failed:', e.message);
  athleteAPI = {
    getProfile: () => Promise.resolve({ data: {} }),
    updateProfile: () => Promise.resolve({ data: {} }),
  };
}

// Export individual APIs
export {
  api,
  teamsAPI,
  leaguesAPI,
  authAPI,
  matchesAPI,
  locationAPI,
  athleteAPI
};

// Export as default object for convenience
export default {
  api,
  teams: teamsAPI,
  leagues: leaguesAPI,
  auth: authAPI,
  matches: matchesAPI,
  location: locationAPI,
  athlete: athleteAPI
};
