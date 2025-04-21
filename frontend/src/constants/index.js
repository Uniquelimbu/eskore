// Application constants
export const APP_NAME = 'eSkore';

// Routes that should use a different layout
export const ROUTES = {
  AUTH: ['/login', '/register', '/forgot-password', '/reset-password', '/role-selection'],
  ATHLETE: ['/athlete/*'],
};

// User roles and permissions - standardized to match how they're used in the app
export const ROLES = {
  ADMIN: 'admin',
  ATHLETE: 'athlete',
  ATHLETE_ADMIN: 'athlete_admin',
  MANAGER: 'manager',
  TEAM: 'team',
  COACH: 'coach',
  TEAM_MANAGER: 'team_manager', // Legacy role
  USER: 'user',
};

// Form validation regexes
export const REGEX = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
  PHONE: /^\+?[0-9]{8,15}$/,
};

// API endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
  },
  USERS: '/api/users',
  TEAMS: '/api/teams',
  LEAGUES: '/api/leagues',
  MATCHES: '/api/matches',
  STANDINGS: '/api/standings',
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
};
