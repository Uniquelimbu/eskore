import axios from 'axios';

// Define the base URL for the API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Debug flag - can toggle this for auth debugging
const DEBUG_AUTH = true;

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for sending cookies cross-origin
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000, // 15 seconds
});

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
    
    return response.data;
  },
  (error) => {
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

export default apiClient;
