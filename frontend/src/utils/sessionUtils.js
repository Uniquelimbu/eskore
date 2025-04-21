/**
 * Session utility functions for managing user authentication state
 * with proper security and error handling
 */

import { STORAGE_KEYS } from '../constants';

/**
 * Saves token to localStorage with proper error handling
 * 
 * @param {string} token - JWT token to save
 * @returns {boolean} - Whether token was successfully saved
 */
export const saveToken = (token) => {
  try {
    if (!token) return false;
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    return true;
  } catch (error) {
    console.error('Error saving authentication token:', error);
    return false;
  }
};

/**
 * Retrieves token from localStorage with proper error handling
 *
 * @returns {string|null} - The token or null if not found/error
 */
export const getToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Error retrieving authentication token:', error);
    return null;
  }
};

/**
 * Clears authentication token
 */
export const clearToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Error clearing authentication token:', error);
  }
};

/**
 * Parses JWT token to get payload (without verification)
 * For client-side display purposes only
 * 
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded payload or null on error
 */
export const parseToken = (token) => {
  try {
    if (!token) return null;
    
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

/**
 * Checks if token is expired
 *
 * @returns {boolean} - True if token exists and is not expired
 */
export const isTokenValid = () => {
  try {
    const token = getToken();
    if (!token) return false;
    
    const decoded = parseToken(token);
    if (!decoded || !decoded.exp) return false;
    
    // Check if token is expired (exp is in seconds)
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
};

/**
 * Get user data from localStorage
 * @returns {Object|null} User data or null if not found
 */
export const getUser = () => {
  const userData = localStorage.getItem(STORAGE_KEYS.USER);
  return userData ? JSON.parse(userData) : null;
};

export default {
  getToken,
  saveToken,
  clearToken,
  isTokenValid,
  getUser
};
