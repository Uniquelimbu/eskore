import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { parsePathToBreadcrumbs, getPageLabel } from './pathUtils';

/**
 * Breadcrumb Utilities
 * Helper functions for breadcrumb functionality
 */

/**
 * Generate breadcrumb items from path and options
 * @param {Object} options - Configuration options
 * @returns {Array} Array of breadcrumb items
 */
export const generateBreadcrumbItems = ({
  pathname,
  team,
  showIcons = true,
  maxItems = 5,
  collapsible = true
}) => {
  const items = parsePathToBreadcrumbs(pathname, team, showIcons);
  
  // Limit items if too many and collapsible is enabled
  if (collapsible && items.length > maxItems) {
    const start = items.slice(0, 1);
    const end = items.slice(-2);
    const middle = [{ 
      id: 'ellipsis',
      label: '...', 
      ellipsis: true,
      clickable: false
    }];
    return [...start, ...middle, ...end];
  }

  return items;
};

/**
 * Custom hook for breadcrumb navigation
 * @param {Object} options - Hook options
 * @returns {Object} Navigation handlers
 */
export const useBreadcrumbNavigation = ({
  onNavigate = null,
  trackNavigation = true,
  team = null
} = {}) => {
  const navigate = useNavigate();

  const handleNavigation = useCallback((item, index) => {
    if (!item.clickable || item.ellipsis) return;

    // Track navigation
    if (trackNavigation && window.gtag) {
      window.gtag('event', 'breadcrumb_click', {
        item_label: item.label,
        item_index: index,
        team_id: team?.id,
        item_path: item.path
      });
    }

    // Custom navigation handler
    if (onNavigate) {
      const shouldNavigate = onNavigate(item, index);
      if (shouldNavigate === false) return;
    }

    // Default navigation
    if (item.path) {
      navigate(item.path);
    }
  }, [navigate, onNavigate, trackNavigation, team]);

  return { handleNavigation };
};

/**
 * Validate breadcrumb items structure
 * @param {Array} items - Breadcrumb items to validate
 * @returns {Object} Validation result
 */
export const validateBreadcrumbItems = (items) => {
  if (!Array.isArray(items)) {
    return { isValid: false, errors: ['Items must be an array'] };
  }

  const errors = [];
  
  items.forEach((item, index) => {
    if (!item.label) {
      errors.push(`Item at index ${index} is missing required 'label' property`);
    }
    
    if (typeof item.label !== 'string') {
      errors.push(`Item at index ${index} 'label' must be a string`);
    }
    
    if (item.clickable && !item.path) {
      errors.push(`Clickable item at index ${index} is missing 'path' property`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create a breadcrumb item
 * @param {Object} options - Item options
 * @returns {Object} Breadcrumb item
 */
export const createBreadcrumbItem = ({
  id = null,
  label,
  path = null,
  icon = null,
  clickable = true,
  active = false,
  team = null,
  ellipsis = false
}) => {
  return {
    id: id || `breadcrumb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    label,
    path,
    icon,
    clickable: ellipsis ? false : clickable,
    active,
    team,
    ellipsis
  };
};

/**
 * Filter visible breadcrumb items based on permissions
 * @param {Array} items - Breadcrumb items
 * @param {Object} permissions - User permissions
 * @returns {Array} Filtered items
 */
export const filterBreadcrumbsByPermissions = (items, permissions = {}) => {
  return items.filter(item => {
    // Always show home and team root
    if (item.path === '/teams' || item.path?.endsWith('/space')) {
      return true;
    }
    
    // Check specific page permissions
    if (item.path?.includes('/settings') && !permissions.canManageTeam) {
      return false;
    }
    
    return true;
  });
};

/**
 * Get breadcrumb items for a specific team page
 * @param {string} teamId - Team identifier
 * @param {string} page - Current page
 * @param {Object} team - Team object
 * @param {boolean} showIcons - Whether to show icons
 * @returns {Array} Breadcrumb items
 */
export const getTeamPageBreadcrumbs = (teamId, page, team = null, showIcons = true) => {
  const items = [
    createBreadcrumbItem({
      id: 'teams-root',
      label: 'Teams',
      path: '/teams',
      icon: showIcons ? '🏠' : null,
      clickable: true
    }),
    createBreadcrumbItem({
      id: `team-${teamId}`,
      label: team?.name || `Team ${teamId}`,
      path: `/teams/${teamId}/space`,
      icon: showIcons ? '👥' : null,
      clickable: true,
      team
    })
  ];

  if (page && page !== 'dashboard') {
    const pageConfig = getPageLabel(page);
    items.push(createBreadcrumbItem({
      id: `team-${teamId}-${page}`,
      label: pageConfig.label,
      path: `/teams/${teamId}/space/${page}`,
      icon: showIcons ? pageConfig.icon : null,
      clickable: false,
      active: true
    }));
  }

  return items;
};

/**
 * Convert URL segments to breadcrumb items
 * @param {Array} segments - URL path segments
 * @param {Object} options - Conversion options
 * @returns {Array} Breadcrumb items
 */
export const segmentsToBreadcrumbs = (segments, options = {}) => {
  const {
    team = null,
    showIcons = true,
    basePath = '/teams'
  } = options;

  const items = [];
  let currentPath = '';

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip the team ID segment, we'll handle it specially
    if (segment === team?.id) {
      return;
    }

    const isLast = index === segments.length - 1;
    const pageConfig = getPageLabel(segment);

    items.push(createBreadcrumbItem({
      id: `segment-${index}-${segment}`,
      label: pageConfig.label,
      path: currentPath,
      icon: showIcons ? pageConfig.icon : null,
      clickable: !isLast,
      active: isLast
    }));
  });

  return items;
};