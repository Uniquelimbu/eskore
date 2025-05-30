// Define all API configuration constants in one place

// Define the base URL for the API
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Alternative URL for specific endpoints (if needed)
export const API_URL = 'http://localhost:5000/api';

// Debug flag - can toggle this for auth debugging
export const DEBUG_AUTH = true;

// Timeout configurations
export const TIMEOUT_CONFIG = {
  DEFAULT: 15000,           // 15 seconds
  EXTENDED: 60000,          // 60 seconds for long operations
  TEAM_REQUEST: 5000,       // 5 seconds for team requests
  TEAM_MEMBERS: 10000,      // 10 seconds for team member requests
  TEAM_CREATION: 30000,     // 30 seconds for team creation
  TEAM_UPDATE: 60000,       // 60 seconds for team updates
  TEAM_DELETION: 15000,     // 15 seconds for team deletion
  HEALTH_CHECK: 3000,       // 3 seconds for health checks
  MANAGER_PROFILE: 15000    // 15 seconds for manager profile operations
};

// Circuit breaker configuration
export const CIRCUIT_BREAKER_CONFIG = {
  THRESHOLD: 3,             // How many failures before opening circuit
  RESET_TIMEOUT: 30000      // 30 seconds before attempting to reset circuit
};

// Export combined configuration object for convenience
export const API_CONFIG = {
  API_BASE_URL,
  DEFAULT_TIMEOUT: TIMEOUT_CONFIG.DEFAULT,
  DEBUG_AUTH,
  TIMEOUT_CONFIG,
  CIRCUIT_BREAKER_CONFIG
};
