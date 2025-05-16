import axios from 'axios';

// Define the base URL for the API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Add this line for debugging:
console.log('🚀 apiClient: API_BASE_URL is set to:', API_BASE_URL);

// Debug flag - can toggle this for auth debugging
const DEBUG_AUTH = true;

// Circuit breaker pattern to prevent excessive retries
const circuitBreaker = {
  failures: 0,
  lastFailure: 0,
  isOpen: false,
  threshold: 3,
  resetTimeout: 30000, // 30 seconds
  
  // Record a failure and potentially open the circuit
  recordFailure() {
    const now = Date.now();
    
    // Reset failure count if last failure was a while ago
    if (now - this.lastFailure > this.resetTimeout) {
      this.failures = 0;
    }
    
    this.failures++;
    this.lastFailure = now;
    
    if (this.failures >= this.threshold) {
      this.isOpen = true;
      
      // Auto-reset circuit after resetTimeout
      setTimeout(() => {
        this.reset();
      }, this.resetTimeout);
    }
  },
  
  // Check if circuit is open (prevent requests)
  isCircuitOpen() {
    // If circuit is open, but it's been a while, try to reset
    if (this.isOpen && Date.now() - this.lastFailure > this.resetTimeout) {
      this.reset();
    }
    return this.isOpen;
  },
  
  // Reset the circuit breaker
  reset() {
    this.failures = 0;
    this.isOpen = false;
  }
};

// Create an Axios instance with improved timeout settings for different request types
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for sending cookies cross-origin
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000, // Default timeout (15 seconds)
});

// Add a method to create a custom instance with different timeout
apiClient.withTimeout = function(timeoutMs) {
  return axios.create({
    baseURL: this.defaults.baseURL,
    withCredentials: this.defaults.withCredentials,
    headers: this.defaults.headers,
    timeout: timeoutMs
  });
};

// Request interceptor with enhanced error and debug handling
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Enhanced debugging for auth issues
    if (DEBUG_AUTH && config.url.includes('/auth/me')) {
      console.log('🔒 Auth Debug: Sending request to', config.url);
      console.log('🔒 Auth Debug: Token in localStorage:', token ? `${token.substring(0, 15)}...` : 'NO TOKEN');
    }
    
    if (token) {
      // Ensure Authorization header is properly set
      config.headers.Authorization = `Bearer ${token}`;
      
      if (DEBUG_AUTH && config.url.includes('/auth')) {
        console.log('🔒 Auth Debug: Added Authorization header');
      }
    } else if (config.url.includes('/auth/me')) {
      console.warn('⚠️ Auth request without token in localStorage!');
    }
    
    // Prevent caching for GET requests
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add better error handling to show more detailed error information
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Enhanced error logging for debugging
    const errorResponse = {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code,
      errors: error.response?.data?.errors
    };
    
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      error: errorResponse
    });
    
    return Promise.reject(errorResponse);
  }
);

// Modify the existing delete method to handle team deletion specifically
const originalDelete = apiClient.delete;
apiClient.delete = function(url, config = {}) {
  // Set a shorter timeout for delete operations, especially for team deletion
  const isTeamDeletion = url.startsWith('/api/teams/') && url.split('/').length === 3;
  const timeout = isTeamDeletion ? 15000 : 30000; // 15 seconds for team deletion, 30 seconds for others
  
  if (isTeamDeletion) {
    console.log(`Using standard timeout for team deletion: ${url}`);
  }
  
  return originalDelete(url, { 
    ...config, 
    timeout 
  }).catch(error => {
    console.error(`Error in DELETE request to ${url}: `, error);
    
    // If it's a timeout, provide a more specific error
    if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
      throw {
        status: 408,
        message: 'Request timed out. The operation might still be processing on the server.',
        code: 'REQUEST_TIMEOUT',
        errors: undefined
      };
    }
    
    throw error;
  });
};

// Modify the existing post method to improve error handling
const originalPost = apiClient.post;
apiClient.post = function(url, data, config = {}) {
  // Add special handling for team creation
  if (url === '/api/teams') {
    return originalPost.call(this, url, data, { 
      ...config, 
      timeout: 30000, // Increase to 30 seconds for team creation
      headers: {
        ...config.headers,
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure token is sent
      }
    }).catch(error => {
      console.error(`Error in POST request to ${url}:`, error);
      
      // Check for specific team creation errors
      if (error.response?.status === 401) {
        console.error('Authorization failed when creating team - token may be invalid');
      } else if (error.response?.status === 500) {
        console.error('Server error during team creation:', error.response.data);
      }
      
      // Rethrow the error for the caller to handle
      throw error;
    });
  }
  return originalPost.call(this, url, data, config);
};

// Add a specific method for team requests with shorter timeout
apiClient.getTeam = async function(teamId, options = {}) {
  const timeoutMs = options.timeout || 5000; // 5 second default for team requests
  
  try {
    const teamClient = this.withTimeout(timeoutMs);
    // Copy interceptors from main instance
    teamClient.interceptors.request = this.interceptors.request;
    teamClient.interceptors.response = this.interceptors.response;
    
    return await teamClient.get(`/api/teams/${teamId}`);
  } catch (error) {
    console.warn(`Team request timed out after ${timeoutMs}ms:`, error);
    throw error;
  }
};

export default apiClient;
