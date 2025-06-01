import axios from 'axios';
import { applyInterceptors } from './core/interceptors';
import { applyTeamExtensions } from './core/extensions/teamExtensions';
import { applyUserExtensions } from './core/extensions/userExtensions';
import { applyAuthExtensions } from './core/extensions/authExtensions';
import { applyNotificationExtensions } from './core/extensions/notificationExtensions'; // Add this line

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 15000
});

// Apply interceptors
applyInterceptors(apiClient);

// Apply extensions
applyTeamExtensions(apiClient);
applyUserExtensions(apiClient);
applyAuthExtensions(apiClient);
applyNotificationExtensions(apiClient); // Add this line

export { apiClient };
export default apiClient;
