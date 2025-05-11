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

// Add request interceptor to ensure token is added
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

// Consolidated single response interceptor (success + error)
apiClient.interceptors.response.use(
  (response) => {
    // SUCCESS HANDLER
    // Always return the response payload (axios response.data)
    return response.data;
  },
  (error) => {
    // ERROR HANDLER

    // Axios wraps non-HTTP failures differently; normalize first
    const { response } = error;

    // ----- 401 Unauthorized handling -----
    if (response && response.status === 401) {
      // Clear invalid/expired token so subsequent calls don't reuse it
      localStorage.removeItem('token');

      // Only redirect if the SPA is not already on the login page
      if (!window.location.pathname.includes('/login')) {
        console.log('API: Unauthorized, redirecting to /login');
        window.location.href = '/login';
      }
    }

    // ----- Timeout & network failures -----
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
      return Promise.reject({
        message: 'Request timed out. Please try again.',
        status: 408,
        code: 'REQUEST_TIMEOUT',
      });
    }

    if (!response) {
      console.error('Network error:', error);
      return Promise.reject({
        message: 'Network error. Please check your connection and try again.',
        status: 0,
        code: 'NETWORK_ERROR',
      });
    }

    // ----- Standardize error payload -----
    const errorData = {
      status: response.status,
      message: response.data?.message || error.message || 'An error occurred',
      code: response.data?.code || `HTTP_${response.status}`,
      errors: response.data?.errors,
    };

    console.error('API Error Response:', errorData);
    return Promise.reject(errorData);
  }
);

export default apiClient;
