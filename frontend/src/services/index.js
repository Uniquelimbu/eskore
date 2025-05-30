// Core services
import apiClient from './core/apiClient';

// Auth services
import authService from './auth/authService';

// User services
import profileService from './user/profileService';

// Team services
import teamService from './team/teamService';

// Game services
import dashboardService from './game/dashboardService';

// Analytics services
import monitoringService, { checkServerHealth, monitorApiOperation } from './analytics/monitoringService';

// Export individual services
export {
  apiClient,
  authService,
  profileService,
  teamService,
  dashboardService,
  monitoringService,
  checkServerHealth,
  monitorApiOperation
};

// Create a named services object instead of anonymous default export
const services = {
  apiClient,
  authService,
  profileService,
  teamService,
  dashboardService,
  monitoringService
};

export default services;
