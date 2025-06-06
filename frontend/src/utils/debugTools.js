/**
 * Debug utilities for API and auth troubleshooting
 */

// Check if API URLs are configured correctly
export const checkApiEndpoints = () => {
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  console.log('🔍 API Endpoint Configuration Check');
  console.log('===================================');
  console.log(`API Base URL: ${apiBaseUrl}`);
  
  // Common API endpoints - modify this list based on your actual endpoints
  const endpoints = [
    { name: 'Auth - Me', path: '/auth/me', type: 'GET', auth: true },
    { name: 'Auth - Login', path: '/auth/login', type: 'POST', auth: false },
    { name: 'Teams - User Teams', path: '/teams/user/:userId', type: 'GET', auth: true },
    { name: 'Teams - Team Details', path: '/teams/:id', type: 'GET', auth: true },
  ];
  
  console.log('\nEndpoint paths to use with apiClient:');
  
  endpoints.forEach(endpoint => {
    console.log(`${endpoint.name}: ${endpoint.path} [${endpoint.type}] ${endpoint.auth ? '🔒' : '🔓'}`);
  });
  
  console.log('\nTo debug auth issues:');
  console.log('1. Check browser Network tab for 401 responses');
  console.log('2. Verify token in localStorage: ', localStorage.getItem('token') ? '✅ Present' : '❌ Missing');
  console.log('3. Try logging out and logging back in');
  
  return {
    apiBaseUrl,
    endpoints
  };
};

// Test authentication status
export const checkAuthStatus = async () => {
  // Get token and user from localStorage
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('🔐 Authentication Status Check');
  console.log('============================');
  console.log('Token exists:', token ? '✅' : '❌');
  console.log('User data exists:', user ? '✅' : '❌');
  
  if (token) {
    try {
      // Extract payload (middle part of JWT) and decode
      const [header, payload, signature] = token.split('.');
      const decodedPayload = JSON.parse(atob(payload));
      
      console.log('\nToken information:');
      console.log('Issued at:', new Date(decodedPayload.iat * 1000).toLocaleString());
      
      if (decodedPayload.exp) {
        const expiration = new Date(decodedPayload.exp * 1000);
        const now = new Date();
        const isExpired = now > expiration;
        
        console.log('Expires at:', expiration.toLocaleString());
        console.log('Status:', isExpired ? '❌ EXPIRED' : '✅ Valid');
        console.log('Time remaining:', isExpired ? 'Expired' : `${Math.round((expiration - now) / 1000 / 60)} minutes`);
      }
      
      console.log('User ID in token:', decodedPayload.userId || 'Not found');
      console.log('Role in token:', decodedPayload.role || 'Not found');
    } catch (error) {
      console.error('Error decoding token:', error);
      console.log('The token may be malformed or invalid');
    }
  }
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('\nStored user information:');
      console.log('User ID:', userData.id || 'Not found');
      console.log('Name:', `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Not found');
      console.log('Email:', userData.email || 'Not found');
      console.log('Role:', userData.role || 'Not found');
    } catch (error) {
      console.error('Error parsing user data:', error);
      console.log('The user data may be malformed');
    }
  }
  
  return {
    hasToken: Boolean(token),
    hasUserData: Boolean(user)
  };
};

// Add a new utility function to validate user data structure
export const validateUserData = (userData) => {
  if (!userData) return { valid: false, reason: 'No user data provided' };
  
  // Check required fields
  const requiredFields = ['id', 'email'];
  const missingFields = requiredFields.filter(field => !userData[field]);
  
  if (missingFields.length > 0) {
    return { 
      valid: false, 
      reason: `Missing required fields: ${missingFields.join(', ')}`,
      userData
    };
  }
  
  return { valid: true, userData };
};

// Add a new utility to check API client configuration
export const checkApiClientConfig = () => {
  // Import from the updated path structure
  const { apiClient, API_CONFIG } = require('../services/core');
  
  console.log('🔍 API Client Configuration Check');
  console.log('===============================');
  console.log(`Base URL: ${apiClient.defaults.baseURL || 'Not set'}`);
  console.log(`Timeout: ${apiClient.defaults.timeout || 'Default'} ms`);
  console.log(`With Credentials: ${apiClient.defaults.withCredentials ? 'Yes' : 'No'}`);
  
  // Show API configuration
  console.log('\nAPI Configuration:');
  console.log(`Default Timeout: ${API_CONFIG.DEFAULT_TIMEOUT} ms`);
  console.log(`Team Request Timeout: ${API_CONFIG.TIMEOUT_CONFIG.TEAM_REQUEST} ms`);
  console.log(`Team Members Timeout: ${API_CONFIG.TIMEOUT_CONFIG.TEAM_MEMBERS} ms`);
  
  // Check for any custom headers
  const headers = apiClient.defaults.headers || {};
  console.log('\nDefault Headers:');
  Object.entries(headers).forEach(([key, value]) => {
    console.log(`- ${key}: ${value}`);
  });
}
