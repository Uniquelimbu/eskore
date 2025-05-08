import axios from 'axios';

// Define the base URL for the API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // <-- Crucial for sending cookies cross-origin
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Add a reasonable timeout for requests
  timeout: 15000, // 15 seconds
});

// Add request interceptor
apiClient.interceptors.request.use(
  config => {
    // Add timestamp to prevent caching for GET requests
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    return config;
  }, 
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Return the data part of the response
    return response.data;
  },
  (error) => {
    // Handle different error scenarios
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
      return Promise.reject({ 
        message: 'Request timed out. Please try again.',
        status: 408,
        code: 'REQUEST_TIMEOUT' 
      });
    }

    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject({ 
        message: 'Network error. Please check your connection and try again.',
        status: 0,
        code: 'NETWORK_ERROR'
      });
    }

    // Get relevant error info from the response
    const errorData = {
      status: error.response.status,
      message: error.response.data?.message || error.message || 'An error occurred',
      code: error.response.data?.code || `HTTP_${error.response.status}`,
      errors: error.response.data?.errors
    };

    console.error('API Error Response:', errorData);
    return Promise.reject(errorData);
  }
);

export default apiClient;
