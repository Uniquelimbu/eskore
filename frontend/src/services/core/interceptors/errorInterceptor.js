export const applyErrorInterceptor = (apiClient) => {
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
  
  return apiClient;
};

export default applyErrorInterceptor;
