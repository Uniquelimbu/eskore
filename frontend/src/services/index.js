// Core services
import { apiClient, API_CONFIG } from './core';

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

// Import extensions
import { applyUserExtensions } from './core/extensions/userExtensions';
import { applyTeamExtensions } from './core/extensions/teamExtensions';
import { applyRequestExtensions } from './core/extensions/requestExtensions';
import { applyManagerExtensions } from './core/extensions/managerExtensions';
import { applyNotificationExtensions } from './core/extensions/notificationExtensions';

// Apply all extensions
applyUserExtensions(apiClient);
applyTeamExtensions(apiClient);
applyRequestExtensions(apiClient);
applyManagerExtensions(apiClient);
// Add the notification extensions
applyNotificationExtensions(apiClient);

// Export the configured API client
export { apiClient, API_CONFIG };

// Export other service modules
export * from './team';

// Export individual services
export {
  authService,
  profileService,
  teamService,
  dashboardService,
  monitoringService,
  checkServerHealth,
  monitorApiOperation
};
