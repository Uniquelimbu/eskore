// Action types
export const AUTH_INIT = 'AUTH_INIT';
export const AUTH_SUCCESS = 'AUTH_SUCCESS';
export const AUTH_ERROR = 'AUTH_ERROR';
export const AUTH_LOGOUT = 'AUTH_LOGOUT';
export const AUTH_LOADING = 'AUTH_LOADING';
export const AUTH_PROFILE_UPDATE = 'AUTH_PROFILE_UPDATE';

// Initial state
export const initialState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false
};

// Auth validation constants
export const REQUIRED_USER_FIELDS = ['id', 'email'];
export const OPTIONAL_USER_FIELDS = ['firstName', 'lastName', 'role'];

// Session constants
export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
export const TOKEN_REFRESH_INTERVAL = 60 * 1000; // 1 minute
export const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Role hierarchy
export const ROLE_HIERARCHY = ['user', 'athlete', 'assistant_manager', 'manager', 'admin'];

// Default user preferences
export const DEFAULT_USER_PREFERENCES = {
  theme: 'light',
  notifications: {
    email: true,
    push: true,
    teamUpdates: true,
    matchReminders: true
  },
  privacy: {
    profileVisibility: 'team',
    statsVisibility: 'team'
  }
};

// Error messages
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  ACCOUNT_SUSPENDED: 'Your account has been suspended. Please contact support.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address to continue.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.'
};