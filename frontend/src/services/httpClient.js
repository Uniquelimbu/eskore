import axios from 'axios';
import mockApi, { shouldUseMockApi } from './mockApiAdapter';

// API URL from environment
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Cache for GET requests
const apiCache = new Map();

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Network status detection
let isOnline = typeof navigator !== 'undefined' && 
  typeof navigator.onLine === 'boolean' ? navigator.onLine : true;

// Update online status
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { isOnline = true; });
  window.addEventListener('offline', () => { isOnline = false; });
}

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    // Check for network connectivity
    if (!isOnline && config.method?.toLowerCase() !== 'get') {
      throw new Error('No network connection');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Cache GET responses
    if (response.config.method?.toLowerCase() === 'get') {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;
      apiCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    
    return response.data;
  },
  (error) => {
    // Format error consistently
    const customError = {
      message: 'An unexpected error occurred',
      status: error.response?.status || 500,
      data: error.response?.data || {},
      originalError: error
    };

    if (error.response) {
      customError.message = error.response.data?.error?.message || 
        error.response.data?.message || 
        error.response.statusText;
      
      // Handle specific status codes
      if (error.response.status === 401) {
        customError.message = 'Authentication required';
      } else if (error.response.status === 403) {
        customError.message = 'Access denied';
      } else if (error.response.status === 404) {
        customError.message = 'Resource not found';
      } else if (error.response.status === 429) {
        customError.message = 'Rate limit exceeded';
      }
    } else if (error.request) {
      if (!isOnline) {
        customError.message = 'You are offline';
        customError.status = 'OFFLINE';
      } else {
        customError.message = 'Network error - no response';
        customError.status = 'NETWORK_ERROR';
      }
    }
    
    return Promise.reject(customError);
  }
);

// Helper for caching
const getCachedData = (url, params, maxAge = 5 * 60 * 1000) => {
  const cacheKey = `${url}${JSON.stringify(params || {})}`;
  const cachedResponse = apiCache.get(cacheKey);
  
  if (cachedResponse && (Date.now() - cachedResponse.timestamp < maxAge)) {
    return cachedResponse.data;
  }
  
  return null;
};

// HTTP client with caching and offline support
const httpClient = {
  get: async (url, config = {}) => {
    // Check for mock API
    if (shouldUseMockApi()) {
      const mockMethod = url.split('/').pop();
      if (mockApi[mockMethod]) {
        return mockApi[mockMethod](config);
      }
    }
    
    // Check cache
    const cacheConfig = config.cache || {};
    const shouldUseCache = cacheConfig.useCache || !isOnline;
    const maxAge = cacheConfig.maxAge || 5 * 60 * 1000;
    
    if (shouldUseCache) {
      const cachedData = getCachedData(url, config.params, maxAge);
      if (cachedData) {
        return cachedData;
      }
    }
    
    // Offline without cache
    if (!isOnline) {
      throw {
        message: 'You are offline and no cached data is available',
        status: 'OFFLINE'
      };
    }
    
    return axiosInstance.get(url, config);
  },
  
  post: async (url, data, config) => {
    // Try mock API
    if (shouldUseMockApi()) {
      const mockMethod = url.split('/').pop();
      if (mockApi[mockMethod]) {
        return mockApi[mockMethod](data);
      }
    }
    
    if (!isOnline) {
      throw {
        message: 'You are offline',
        status: 'OFFLINE'
      };
    }
    
    return axiosInstance.post(url, data, config);
  },
  
  put: async (url, data, config) => {
    // Try mock API
    if (shouldUseMockApi()) {
      const mockMethod = url.split('/').pop();
      if (mockApi[mockMethod]) {
        return mockApi[mockMethod](data);
      }
    }
    
    if (!isOnline) {
      throw {
        message: 'You are offline',
        status: 'OFFLINE'
      };
    }
    
    return axiosInstance.put(url, data, config);
  },
  
  patch: async (url, data, config) => {
    // Try mock API
    if (shouldUseMockApi()) {
      const mockMethod = url.split('/').pop();
      if (mockApi[mockMethod]) {
        return mockApi[mockMethod](data);
      }
    }
    
    if (!isOnline) {
      throw {
        message: 'You are offline',
        status: 'OFFLINE'
      };
    }
    
    return axiosInstance.patch(url, data, config);
  },
  
  delete: async (url, config) => {
    // Try mock API
    if (shouldUseMockApi()) {
      const mockMethod = url.split('/').pop();
      if (mockApi[mockMethod]) {
        return mockApi[mockMethod](config);
      }
    }
    
    if (!isOnline) {
      throw {
        message: 'You are offline',
        status: 'OFFLINE'
      };
    }
    
    return axiosInstance.delete(url, config);
  },
  
  // Cache management
  clearCache: (url = null) => {
    if (url) {
      for (const key of apiCache.keys()) {
        if (key.startsWith(url)) {
          apiCache.delete(key);
        }
      }
    } else {
      apiCache.clear();
    }
  }
};

export default httpClient;
