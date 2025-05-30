export const applyLoggingInterceptor = (apiClient) => {
  // Log configuration once when adding the interceptor
  console.log('API Client Configuration:', {
    baseURL: apiClient.defaults.baseURL,
    timeout: apiClient.defaults.timeout, 
    withCredentials: apiClient.defaults.withCredentials
  });

  // Add request interceptor to log requests
  apiClient.interceptors.request.use(
    config => {
      // Log the actual full URL that will be requested 
      const fullUrl = config.baseURL 
        ? `${config.baseURL.replace(/\/$/, '')}${config.url}`
        : config.url;
      
      console.log(`API Request: ${config.method?.toUpperCase()} ${fullUrl}`);
      return config;
    },
    error => {
      console.error('API Request Error:', error);
      return Promise.reject(error);
    }
  );
  
  return apiClient;
};

export default applyLoggingInterceptor;
