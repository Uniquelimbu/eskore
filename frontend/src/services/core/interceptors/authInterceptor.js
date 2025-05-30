import { DEBUG_AUTH } from '../config';

export const applyAuthInterceptor = (apiClient) => {
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      
      // Enhanced debugging for auth issues
      if (DEBUG_AUTH && (config.url.includes('/auth/me') || config.url.includes('/auth/login'))) {
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
      if (config.method?.toLowerCase() === 'get' && !config.skipCache) {
        config.params = {
          ...config.params,
          _t: Date.now()
        };
      }
      
      return config;
    },
    (error) => {
      console.error('API Request Error:', error);
      throw new Error(`Request setup failed: ${error.message}`);
    }
  );
  
  return apiClient;
};

export default applyAuthInterceptor;
