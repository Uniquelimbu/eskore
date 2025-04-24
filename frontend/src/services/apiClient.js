import axios from 'axios';

// Define the base URL for the API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // <-- Crucial for sending cookies cross-origin
  headers: {
    'Content-Type': 'application/json',
  },
  // Add a timeout for requests
  timeout: 10000, // 10 seconds
});

// Optional: Add interceptors for request/response handling (e.g., error formatting)
apiClient.interceptors.response.use(
  (response) => {
    // Return the data part of the response
    return response.data;
  },
  (error) => {
    // Handle errors globally
    console.error('API Client Error:', error.response || error.message);

    // Try to extract a meaningful error message and status
    const customError = {
      message: error.response?.data?.error?.message || error.response?.data?.message || error.message || 'An unknown error occurred',
      status: error.response?.status,
      data: error.response?.data, // Include full response data if available
    };

    // Reject with the custom error object
    return Promise.reject(customError);
  }
);

export default apiClient;
