import axios from 'axios';
import { STORAGE_KEYS } from '../../constants';
// Fix incorrect import path - change '../utils/sessionUtils' to '../sessionUtils'
import { getToken, saveToken, clearToken } from '../sessionUtils';
import { mockApi } from './mockClient';

// ISSUE: Mock API is enabled in your .env file
const useMockApi = process.env.REACT_APP_ENABLE_MOCK_API === 'true' || 
                   process.env.NODE_ENV === 'test';

// Solution: Create instance that always connects to real API
export const realApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 15000
});

// Keep existing api export for compatibility
export const api = useMockApi ? mockApi : realApi;

// Configure API health check settings
const HEALTH_CHECK_INTERVAL = 1000 * 60 * 5; // Check every 5 minutes instead of every minute
const MAX_HEALTH_CHECK_RETRIES = 3; // Limit number of retries

// Add health check configuration
let lastHealthCheckTime = 0;
let healthCheckRetryCount = 0;

// Health check function with reduced frequency
const checkApiHealth = async () => {
  const now = Date.now();
  
  // Only check if enough time has passed since last check
  if (now - lastHealthCheckTime < HEALTH_CHECK_INTERVAL) {
    return true;
  }
  
  try {
    lastHealthCheckTime = now;
    const response = await api.get('/api/health', { 
      timeout: 3000,
      // Identify health checks in logs
      headers: { 'X-Request-Type': 'health-check' }
    });
    
    // Reset retry counter on success
    healthCheckRetryCount = 0;
    return response.status === 200;
  } catch (error) {
    console.warn('API health check failed:', error.message);
    healthCheckRetryCount++;
    
    // Stop checking after max retries
    if (healthCheckRetryCount > MAX_HEALTH_CHECK_RETRIES) {
      console.error('Maximum health check retry attempts reached');
      return false;
    }
    
    return false;
  }
};

// Only set up interceptors if we're using the real API
if (!useMockApi) {
  // Add a flag to track if we're currently trying to connect
  let isConnectingToAPI = false;
  let connectionAttempts = 0;
  const MAX_RETRY_ATTEMPTS = 3;

  // Interceptor to attach token from localStorage
  api.interceptors.request.use(
    config => {
      // Use sessionUtils to get token
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add request timestamp for tracking
      config.metadata = { startTime: new Date().getTime() };
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  // Interceptor to handle responses
  api.interceptors.response.use(
    response => {
      // Check for token refresh in response headers
      const newToken = response.headers['x-auth-token'];
      if (newToken) {
        saveToken(newToken);
      }
      
      // If response includes a token in the body, save it
      if (response.data && response.data.token) {
        saveToken(response.data.token);
      }
      
      // Reset connection attempts on successful response
      connectionAttempts = 0;
      isConnectingToAPI = false;
      
      return response;
    },
    error => {
      // Handle network errors with retry logic
      if (error.code === 'ECONNABORTED' || !error.response) {
        console.warn('Network error detected:', error.message);
        
        // Only retry if we're not already in a retry attempt
        if (!isConnectingToAPI && connectionAttempts < MAX_RETRY_ATTEMPTS) {
          isConnectingToAPI = true;
          connectionAttempts++;
          
          console.log(`Attempting to reconnect (${connectionAttempts}/${MAX_RETRY_ATTEMPTS})...`);
          
          // Don't retry for POST, PUT, PATCH, DELETE to prevent duplicates
          const isReadOperation = error.config?.method === 'get';
          
          if (isReadOperation) {
            // Return a promise that will retry the request after a delay
            return new Promise(resolve => {
              // Exponential backoff: 1s, 2s, 4s
              const retryDelay = Math.pow(2, connectionAttempts - 1) * 1000;
              
              setTimeout(() => {
                console.log(`Retrying request to ${error.config.url}`);
                isConnectingToAPI = false;
                
                // Retry the request
                resolve(api(error.config));
              }, retryDelay);
            });
          }
        }
        
        // Display a user-friendly message for network errors
        error.userFriendlyMessage = "Can't connect to server. Please check your internet connection and try again.";
      }
      
      // Handle authentication errors
      if (error.response && error.response.status === 401) {
        clearToken();
        
        // If we're not already on the login page, redirect to it
        if (!window.location.pathname.includes('/login')) {
          // Use a small delay to allow for any pending operations
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }
      
      // Add user-friendly messages based on status codes
      if (error.response) {
        switch (error.response.status) {
          case 400:
            error.userFriendlyMessage = "Invalid request. Please check your information.";
            break;
          case 403:
            error.userFriendlyMessage = "You don't have permission to access this resource.";
            break;
          case 404:
            error.userFriendlyMessage = "The requested resource could not be found.";
            break;
          case 500:
            error.userFriendlyMessage = "Server error. Please try again later.";
            break;
          default:
            error.userFriendlyMessage = "An error occurred. Please try again.";
        }
      }
      
      return Promise.reject(error);
    }
  );
}

// Export the API instance and health check function
export { api as default, checkApiHealth };
