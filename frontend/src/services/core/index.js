import apiClient from './apiClient';
import { API_CONFIG } from './config';
import { circuitBreaker, applyCircuitBreaker } from './utils/circuitBreaker';

// Export configurations and utilities for advanced usage
export { 
  API_CONFIG,
  circuitBreaker,
  applyCircuitBreaker
};

// Export the configured API client as default
export { apiClient };
export default apiClient;
