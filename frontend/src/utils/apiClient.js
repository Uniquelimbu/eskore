import { toast } from 'react-toastify';

// Base API URL - replace with your actual API URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Helper for handling request errors
const handleRequestError = (error) => {
  console.error('API Request Error:', error);
  const errorMessage = error.response?.data?.message || 'An error occurred while fetching data';
  toast.error(errorMessage);
  return Promise.reject(error);
};

// Helper for setting auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic request function
const request = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers
    };

    // Always include credentials so cookies like auth_token are sent with cross-origin requests
    const response = await fetch(url, {
      credentials: 'include', // <— crucial for JWT cookie auth
      ...options,
      headers
    });

    // Handle HTTP errors
    if (!response.ok) {
      const error = await response.json();
      throw { response, status: response.status, ...error };
    }

    // Parse JSON response if it exists
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return response;
  } catch (error) {
    return handleRequestError(error);
  }
};

// API client methods
const apiClient = {
  get: (endpoint, options = {}) => 
    request(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint, data, options = {}) => 
    request(endpoint, { 
      ...options, 
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  put: (endpoint, data, options = {}) => 
    request(endpoint, { 
      ...options, 
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  
  patch: (endpoint, data, options = {}) => 
    request(endpoint, { 
      ...options, 
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  
  delete: (endpoint, options = {}) => 
    request(endpoint, { ...options, method: 'DELETE' })
};

export default apiClient;
