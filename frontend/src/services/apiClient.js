import axios from 'axios';
import mockApi, { shouldUseMockApi } from './mockApiAdapter';

// Get the API URL from environment variables with a fallback
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Create a pre-configured axios instance for all API calls
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: allows cookies to be sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for handling request configuration
axiosInstance.interceptors.request.use(
  (config) => {
    // You could modify the request here (e.g. add tokens from localStorage if needed)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common response patterns
axiosInstance.interceptors.response.use(
  (response) => {
    // Directly return the data for successful responses
    return response.data;
  },
  (error) => {
    // Handle different error responses
    const customError = {
      message: 'An unexpected error occurred',
      status: error.response?.status || 500,
      data: error.response?.data || {}
    };

    if (error.response) {
      // The server responded with an error status
      customError.message = error.response.data?.error?.message || error.response.statusText;
      
      // Handle specific HTTP status codes
      if (error.response.status === 401) {
        // Authentication error - could clear user data here
        console.error('Authentication error', error.response.data);
      } 
    } else if (error.request) {
      // Request made but no response received
      customError.message = 'Network error - no response received';
    } else {
      // Request configuration error
      customError.message = error.message;
    }
    
    return Promise.reject(customError);
  }
);

// API Client that will use either real API or mock API
const apiClient = {
  get: async (url, config) => {
    if (shouldUseMockApi()) {
      const mockMethod = url.split('/').pop(); // Extract the last part of the URL
      if (mockApi[mockMethod]) {
        return mockApi[mockMethod](config);
      }
    }
    return axiosInstance.get(url, config);
  },
  
  post: async (url, data, config) => {
    if (shouldUseMockApi()) {
      const mockMethod = url.split('/').pop(); // Extract the last part of the URL
      if (mockApi[mockMethod]) {
        return mockApi[mockMethod](data);
      }
    }
    return axiosInstance.post(url, data, config);
  },
  
  put: async (url, data, config) => {
    if (shouldUseMockApi()) {
      const mockMethod = url.split('/').pop();
      if (mockApi[mockMethod]) {
        return mockApi[mockMethod](data);
      }
    }
    return axiosInstance.put(url, data, config);
  },
  
  patch: async (url, data, config) => {
    if (shouldUseMockApi()) {
      const mockMethod = url.split('/').pop();
      if (mockApi[mockMethod]) {
        return mockApi[mockMethod](data);
      }
    }
    return axiosInstance.patch(url, data, config);
  },
  
  delete: async (url, config) => {
    if (shouldUseMockApi()) {
      const mockMethod = url.split('/').pop();
      if (mockApi[mockMethod]) {
        return mockApi[mockMethod](config);
      }
    }
    return axiosInstance.delete(url, config);
  }
};

export default apiClient;
