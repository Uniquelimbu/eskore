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

// Consolidated response interceptor with improved debugging
apiClient.interceptors.response.use(
  (response) => {
    // Success handler - always return data
    if (DEBUG_AUTH && response.config.url.includes('/auth')) {
      console.log(`🔒 Auth Debug: Successful response from ${response.config.url}`);
    }
    
    // If response includes a token, save it in localStorage
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      if (DEBUG_AUTH) {
        console.log('🔒 Auth Debug: Saved new token to localStorage');
      }
    }
    
    // If response is from /auth/me, store user data
    if (response.config.url.includes('/auth/me') && response.data && response.data.id) {
      localStorage.setItem('user', JSON.stringify(response.data));
      if (DEBUG_AUTH) {
        console.log('🔒 Auth Debug: Saved user data to localStorage');
      }
    }
    
    // Reset circuit breaker on successful response
    circuitBreaker.reset();
    
    return response.data;
  },
  async (error) => {
    // Enhanced error logging for auth issues
    if (DEBUG_AUTH && error.config && error.config.url.includes('/auth')) {
      console.error('🔒 Auth Debug: Error response from', error.config.url);
      console.error('🔒 Auth Debug: Status:', error.response?.status);
      console.error('🔒 Auth Debug: Response data:', error.response?.data);
    }
    
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Only clear token if the error is from an auth endpoint
      if (error.config.url.includes('/auth')) {
        if (DEBUG_AUTH) {
          console.warn('🔒 Auth Debug: Unauthorized (401) - Clearing token');
        }
        localStorage.removeItem('token');
        
        // Don't clear user data here to prevent flashes during refresh
        // That will be handled by the auth context if needed
      }
      
      // Only redirect if not already on login page and it's a legitimate auth failure
      // from an endpoint that should be authenticated
      if (!window.location.pathname.includes('/login') && 
          (error.config.url.includes('/auth/me') || error.config.url.includes('/api/users'))) {
        if (DEBUG_AUTH) {
          console.log('🔒 Auth Debug: Redirecting to login page');
        }
        // Save current location for redirect after login
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/login';
      }
    }
    
    // Normalize error response
    const errorData = {
      status: error.response?.status || 0,
      message: error.response?.data?.message || error.message || 'An error occurred',
      code: error.response?.data?.code || `HTTP_${error.response?.status || 'UNKNOWN'}`,
      errors: error.response?.data?.errors,
    };

    // Specifically identify network errors (like ERR_CONNECTION_REFUSED)
    if (!error.response && error.message === 'Network Error') {
      errorData.message = 'Network connection refused. Please ensure the server is running.';
      errorData.code = 'NETWORK_ERROR';
      
      // Record failure for circuit breaker
      circuitBreaker.recordFailure();
      
      // If this is a GET request and we're not in a circuit breaker state, 
      // implement exponential backoff retry
      if (error.config.method === 'get' && !circuitBreaker.isCircuitOpen() && 
          (!error.config.retryCount || error.config.retryCount < 3)) {
        
        const retryCount = error.config.retryCount || 0;
        error.config.retryCount = retryCount + 1;
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, retryCount) * 1000; 
        
        console.log(`Backend connection error. Retrying in ${delay/1000}s... (Attempt ${error.config.retryCount} of 3)`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Return a new request promise
        return apiClient(error.config);
      }
      
      // If circuit is open, add additional info to error
      if (circuitBreaker.isCircuitOpen()) {
        errorData.message = 'Backend server appears to be down. Please try again later.';
        errorData.circuitOpen = true;
        // Log only once when circuit opens to avoid console spam
        if (circuitBreaker.failures === circuitBreaker.threshold) {
          console.error('Circuit breaker opened: Backend server appears down. Temporarily suspending requests.');
        }
      }
    }
    
    return Promise.reject(errorData);
  }
);

// Store reference to the original axios delete method before overriding it
const originalDelete = apiClient.delete;

// Enhance the delete method to better validate parameters
apiClient.delete = async (url) => {
  try {
    // Enhanced validation for URLs with null/undefined parameters
    if (url.includes('/null') || url.includes('/undefined')) {
      console.error(`Invalid URL with null/undefined parameters: ${url}`);
      
      // Extract the team ID for potential recovery
      const teamIdMatch = url.match(/\/teams\/(\d+)\/members\/(null|undefined)/);
      if (teamIdMatch && teamIdMatch[1]) {
        // eslint-disable-next-line no-unused-vars
        const teamId = teamIdMatch[1];
        
        // Try to get the current user ID directly from the server
        try {
          const userResponse = await apiClient.get('/api/auth/me');
          if (userResponse && userResponse.id) {
            const userId = userResponse.id;
            console.log(`Recovered user ID: ${userId}, reconstructing URL`);
            
            // Replace the URL with valid user ID
            url = url.replace(/(\/null|\/undefined)$/, `/${userId}`);
            console.log(`Corrected URL: ${url}`);
          } else {
            throw new Error('Could not retrieve valid user ID');
          }
        } catch (authError) {
          console.error('Auth verification failed:', authError);
          throw new Error('Invalid request parameters. User ID is missing and could not be recovered.');
        }
      } else {
        throw new Error('Invalid request parameters. Resource ID is missing.');
      }
    }
    
    // Call the original axios delete method, not our custom version
    const response = await originalDelete(url);
    
    // Additional validation to check the response structure
    const data = response || {};
    
    // If debugging is needed
    console.debug(`DELETE ${url} response:`, data);
    
    return data;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error Response:', error.response?.data || error);
    }
    
    // Handle auth errors
    if (error.response?.status === 401) {
      console.warn('Authorization failed, redirecting to login');
      // Store the current URL to redirect back after login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      window.location.href = '/login';
      return Promise.reject(error.response.data || error);
    }
    
    throw error.response?.data || error;
  }
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
