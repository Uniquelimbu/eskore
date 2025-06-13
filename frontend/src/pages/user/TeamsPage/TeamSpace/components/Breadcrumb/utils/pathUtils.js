/**
 * Path Utilities for Breadcrumb Navigation
 * Helper functions for parsing and handling paths
 */

/**
 * Page label configurations
 */
const PAGE_LABELS = {
  teams: { label: 'Teams', icon: '🏠' },
  space: { label: 'Dashboard', icon: '📊' },
  dashboard: { label: 'Dashboard', icon: '📊' },
  squad: { label: 'Squad', icon: '👥' },
  formation: { label: 'Formation', icon: '⚽' },
  calendar: { label: 'Calendar', icon: '📅' },
  settings: { label: 'Settings', icon: '⚙️' },
  profile: { label: 'Profile', icon: '👤' },
  analytics: { label: 'Analytics', icon: '📈' },
  matches: { label: 'Matches', icon: '🏆' },
  training: { label: 'Training', icon: '🎯' }
};

/**
 * Get page label and icon for a given page identifier
 * @param {string} page - Page identifier
 * @returns {Object} Page configuration with label and icon
 */
export const getPageLabel = (page) => {
  if (!page) return { label: 'Unknown', icon: '📄' };
  
  const normalized = page.toLowerCase();
  const config = PAGE_LABELS[normalized];
  
  if (config) return config;
  
  // Generate label from page name if not found
  const label = page.charAt(0).toUpperCase() + page.slice(1).replace(/[-_]/g, ' ');
  return { label, icon: '📄' };
};

/**
 * Parse pathname into breadcrumb items
 * @param {string} pathname - Current pathname
 * @param {Object} team - Team object
 * @param {boolean} showIcons - Whether to show icons
 * @returns {Array} Array of breadcrumb items
 */
export const parsePathToBreadcrumbs = (pathname, team = null, showIcons = true) => {
  const segments = pathname.split('/').filter(Boolean);
  const items = [];

  // Always start with Teams root
  items.push({
    id: 'teams-root',
    label: 'Teams',
    path: '/teams',
    icon: showIcons ? '🏠' : null,
    clickable: true,
    active: false
  });

  // Find team ID and current page
  const teamIndex = segments.findIndex(segment => segment === 'teams');
  const teamId = teamIndex >= 0 ? segments[teamIndex + 1] : null;
  
  if (teamId) {
    // Add team space root
    const teamName = team?.name || `Team ${teamId}`;
    items.push({
      id: `team-${teamId}`,
      label: teamName,
      path: `/teams/${teamId}/space`,
      icon: showIcons ? '👥' : null,
      clickable: true,
      active: false,
      team
    });

    // Add current page if not root
    const spaceIndex = segments.findIndex(segment => segment === 'space');
    const currentPage = spaceIndex >= 0 ? segments[spaceIndex + 1] : null;

    if (currentPage) {
      const pageConfig = getPageLabel(currentPage);
      items.push({
        id: `team-${teamId}-${currentPage}`,
        label: pageConfig.label,
        path: pathname,
        icon: showIcons ? pageConfig.icon : null,
        clickable: false,
        active: true
      });
    } else {
      // Mark team space as active if we're on the root
      items[items.length - 1].active = true;
      items[items.length - 1].clickable = false;
    }
  }

  return items;
};

/**
 * Extract team ID from pathname
 * @param {string} pathname - Current pathname
 * @returns {string|null} Team ID or null if not found
 */
export const extractTeamId = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  const teamIndex = segments.findIndex(segment => segment === 'teams');
  return teamIndex >= 0 ? segments[teamIndex + 1] : null;
};

/**
 * Extract current page from pathname
 * @param {string} pathname - Current pathname
 * @returns {string|null} Current page or null if on root
 */
export const extractCurrentPage = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  const spaceIndex = segments.findIndex(segment => segment === 'space');
  return spaceIndex >= 0 ? segments[spaceIndex + 1] : null;
};

/**
 * Check if pathname is a team space path
 * @param {string} pathname - Pathname to check
 * @returns {boolean} Whether it's a team space path
 */
export const isTeamSpacePath = (pathname) => {
  return pathname.includes('/teams/') && pathname.includes('/space');
};

/**
 * Check if pathname is team root (dashboard)
 * @param {string} pathname - Pathname to check
 * @returns {boolean} Whether it's team root
 */
export const isTeamRoot = (pathname) => {
  const pattern = /^\/teams\/[^\/]+\/space\/?$/;
  return pattern.test(pathname);
};

/**
 * Build team space path
 * @param {string} teamId - Team identifier
 * @param {string} page - Page name (optional)
 * @returns {string} Complete team space path
 */
export const buildTeamSpacePath = (teamId, page = null) => {
  const basePath = `/teams/${teamId}/space`;
  return page ? `${basePath}/${page}` : basePath;
};

/**
 * Normalize pathname for consistent handling
 * @param {string} pathname - Pathname to normalize
 * @returns {string} Normalized pathname
 */
export const normalizePath = (pathname) => {
  // Remove trailing slash except for root
  const normalized = pathname.replace(/\/+$/, '') || '/';
  
  // Remove duplicate slashes
  return normalized.replace(/\/+/g, '/');
};

/**
 * Get parent path from current pathname
 * @param {string} pathname - Current pathname
 * @returns {string} Parent path
 */
export const getParentPath = (pathname) => {
  const normalized = normalizePath(pathname);
  const segments = normalized.split('/').filter(Boolean);
  
  if (segments.length <= 1) return '/';
  
  return '/' + segments.slice(0, -1).join('/');
};

/**
 * Check if user can access a specific path
 * @param {string} pathname - Path to check
 * @param {Object} permissions - User permissions
 * @returns {boolean} Whether user can access the path
 */
export const canAccessPath = (pathname, permissions = {}) => {
  // Everyone can access teams root and team dashboard
  if (pathname === '/teams' || isTeamRoot(pathname)) {
    return true;
  }

  // Check page-specific permissions
  const currentPage = extractCurrentPage(pathname);
  
  switch (currentPage) {
    case 'settings':
      return permissions.canManageTeam || false;
    case 'analytics':
      return permissions.canViewAnalytics || false;
    default:
      return true; // Default pages are accessible to all team members
  }
};