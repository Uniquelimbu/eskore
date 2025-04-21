/**
 * Authentication API module
 * @module features/auth/api/authApi
 */

import { api, realApi } from '../../../utils/api/client';
import { ENDPOINTS, STORAGE_KEYS } from '../../../constants';
import { saveToken, clearToken } from '../../../utils/sessionUtils';

/**
 * Login user with email and password
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise} - API response
 */
const login = (credentials) => {
  return realApi.post(ENDPOINTS.AUTH.LOGIN, credentials);
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} - API response
 */
const register = (userData) => {
  return api.post(ENDPOINTS.AUTH.REGISTER, userData);
};

/**
 * Register user specifically as an athlete
 * @param {Object} athleteData - Athlete registration data
 * @returns {Promise} - API response
 */
const registerAthlete = (athleteData) => {
  return api.post('/api/auth/register/athlete', athleteData);
};

/**
 * Logout the current user
 * @returns {Promise} - API response
 */
const logout = () => {
  // Use the sessionUtils to clear token
  clearToken();
  localStorage.removeItem(STORAGE_KEYS.USER);
  
  // Also call the logout endpoint if needed
  return api.post(ENDPOINTS.AUTH.LOGOUT);
};

/**
 * Get current user data
 * @returns {Promise} - API response with user data
 */
const me = () => {
  return realApi.get('/api/auth/me');
};

/**
 * Refresh the authentication token
 * @returns {Promise} - API response with new token
 */
const refreshToken = () => {
  return api.post(ENDPOINTS.AUTH.REFRESH);
};

export const authAPI = {
  login,
  register,
  registerAthlete,
  logout,
  me,
  refreshToken
};

export default authAPI;
