import axios from 'axios';
import { applyAuthInterceptor } from './interceptors/authInterceptor';
import { applyErrorInterceptor } from './interceptors/errorInterceptor';
import { applyLoggingInterceptor } from './interceptors/loggingInterceptor';
import { applyRequestExtensions } from './extensions/requestExtensions';
import { applyTeamExtensions } from './extensions/teamExtensions';
import { applyManagerExtensions } from './extensions/managerExtensions';
import { API_CONFIG } from './config';

// Create the base Axios instance with core configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: API_CONFIG.DEFAULT_TIMEOUT
});

// Add a method to create a custom instance with different timeout
apiClient.withTimeout = function(timeoutMs) {
  return axios.create({
    baseURL: this.defaults.baseURL,
    withCredentials: this.defaults.withCredentials,
    headers: this.defaults.headers,
    timeout: timeoutMs
  });
};

// Apply interceptors and extensions
applyAuthInterceptor(apiClient);
applyErrorInterceptor(apiClient);
applyLoggingInterceptor(apiClient);
applyRequestExtensions(apiClient);
applyTeamExtensions(apiClient);
applyManagerExtensions(apiClient);

export default apiClient;
