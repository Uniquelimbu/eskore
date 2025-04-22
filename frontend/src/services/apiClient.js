import axios from 'axios';
import mockApi, { shouldUseMockApi } from './mockApiAdapter';

// Cache for GET requests
const apiCache = new Map();

// Get the API URL from environment variables with a fallback
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Create a pre-configured axios instance for all API calls
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: allows cookies to be sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// Detect network connection status
let isOnline = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' 
  ? navigator.onLine 
  : true;

// Update online status
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { isOnline = true; });
  window.addEventListener('offline', () => { isOnline = false; });
}

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Check for network connectivity
    if (!isOnline && config.method.toLowerCase() !== 'get') {
      throw new Error('No network connection. Please try again when you\'re back online.');
    }

    // Add timestamp to GET requests to prevent caching by browser
    if (config.method.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    // Add other request processing here

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Cache GET responses
    if (response.config.method.toLowerCase() === 'get') {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;
      apiCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    
    return response.data;
  },
  (error) => {
    // Handle different error responses
    const customError = {
      message: 'An unexpected error occurred',
      status: error.response?.status || 500,
      data: error.response?.data || {},
      originalError: error
    };

    if (error.response) {
      // The server responded with an error status
      customError.message = error.response.data?.error?.message || 
                            error.response.data?.message || 
                            error.response.statusText;
      
      // Handle specific HTTP status codes
      if (error.response.status === 401) {
        // Authentication error
        console.error('Authentication error', error.response.data);
        // We could dispatch a logout action here if using Redux
      } else if (error.response.status === 403) {
        customError.message = 'You do not have permission to access this resource';
      } else if (error.response.status === 404) {
        customError.message = 'The requested resource was not found';
      } else if (error.response.status === 429) {
        customError.message = 'Too many requests. Please try again later.';
      }
    } else if (error.request) {
      // Request made but no response received
      if (!isOnline) {
        customError.message = 'You are offline. Please check your internet connection.';
        customError.status = 'OFFLINE';
      } else {
        customError.message = 'Network error - no response received from server';
        customError.status = 'NETWORK_ERROR';
      }
    } else {
      // Request configuration error
      customError.message = error.message;
      customError.status = 'REQUEST_ERROR';
    }
    
    return Promise.reject(customError);
  }
);

// Helper function for caching behavior
const getCachedData = (url, params, maxAge = 5 * 60 * 1000) => { // Default 5 minutes
  const cacheKey = `${url}${JSON.stringify(params || {})}`;
  const cachedResponse = apiCache.get(cacheKey);
  
  if (cachedResponse && (Date.now() - cachedResponse.timestamp < maxAge)) {
    return cachedResponse.data;
  }
  
  return null;
}

// API Client that will use either real API or mock API
const apiClient = {
  get: async (url, config = {}) => {
    // Check for mock API first
    if (shouldUseMockApi()) {
      const mockMethod = url.split('/').pop();
      if (mockApi[mockMethod]) {
        return mockApi[mockMethod](config);
      }
    }
    
    // Check for cached data when online or force cache when offline
    const cacheConfig = config.cache || {};
    const shouldUseCache = cacheConfig.useCache || !isOnline;
    const maxAge = cacheConfig.maxAge || 5 * 60 * 1000; // 5 minutes default
    
    if (shouldUseCache) {
      const cachedData = getCachedData(url, config.params, maxAge);
      if (cachedData) {
        return cachedData;
      }
    }
    
    // Fallback to network request
    if (!isOnline) {
      throw {
        message: 'You are offline and no cached data is available',
        status: 'OFFLINE'
      };
    }
    
    return axiosInstance.get(url, config);
  },
  
  post: async (url, data, config) => {
    if (shouldUseMockApi()) {
      const mockMethod = url.split('/').pop();
      if (mockApi[mockMethod]) {
        return mockApi[mockMethod](data);
      }
    }
    
    if (!isOnline) {
      throw {
        message: 'You are offline. Please connect to the internet and try again.',
        status: 'OFFLINE'
      };
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
    
    if (!isOnline) {
      throw {
        message: 'You are offline. Please connect to the internet and try again.',
        status: 'OFFLINE'
      };
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
    
    if (!isOnline) {
      throw {
        message: 'You are offline. Please connect to the internet and try again.',
        status: 'OFFLINE'
      };
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
    
    if (!isOnline) {
      throw {
        message: 'You are offline. Please connect to the internet and try again.',
        status: 'OFFLINE'
      };
    }
    
    return axiosInstance.delete(url, config);
  },
  
  // Clear all cache or specific URL
  clearCache: (url = null) => {
    if (url) {
      // Clear specific URL patterns
      for (const key of apiCache.keys()) {
        if (key.startsWith(url)) {
          apiCache.delete(key);
        }
      }
    } else {
      // Clear all cache
      apiCache.clear();
    }
  }
};

export default apiClient;
