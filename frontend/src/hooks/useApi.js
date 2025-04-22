import { useState, useCallback } from 'react';
import apiClient from '../services/apiClient';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const request = useCallback(async (method, url, payload = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient({
        method,
        url,
        data: payload,
      });
      
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = 
        err.response?.data?.error?.message || 
        err.message || 
        'An unexpected error occurred';
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    data,
    get: (url) => request('get', url),
    post: (url, data) => request('post', url, data),
    put: (url, data) => request('put', url, data),
    patch: (url, data) => request('patch', url, data),
    delete: (url) => request('delete', url),
  };
};
