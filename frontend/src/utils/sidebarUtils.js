/**
 * Utility functions for managing sidebar collapse state
 */

export const collapseSidebar = () => {
  console.log('collapseSidebar called');
  
  // Method 1: Add class to body (most reliable)
  document.body.classList.add('sidebar-is-collapsed');
  
  // Method 2: Set CSS custom property (backup method)
  document.documentElement.style.setProperty('--sidebar-current-width', 'var(--sidebar-collapsed-width)');
  
  // Method 3: Direct element manipulation (if sidebar exists)
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.add('sidebar-is-collapsed');
  }
  
  // Trigger a resize event to help any components that depend on window size
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 100);
};

export const expandSidebar = () => {
  console.log('expandSidebar called');
  
  // Method 1: Remove class from body
  document.body.classList.remove('sidebar-is-collapsed');
  
  // Method 2: Reset CSS custom property
  document.documentElement.style.setProperty('--sidebar-current-width', 'var(--sidebar-expanded-width)');
  
  // Method 3: Direct element manipulation (if sidebar exists)
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.remove('sidebar-is-collapsed');
  }
  
  // Trigger a resize event
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 100);
};

export const isSidebarCollapsed = () => {
  return document.body.classList.contains('sidebar-is-collapsed');
};

/**
 * Auto-collapse sidebar for specific pages
 * @param {string} pathname - Current route pathname
 */
export const autoCollapseSidebarForPath = (pathname) => {
  // Define paths that should trigger sidebar collapse
  const collapsePages = [
    '/teams/*/space/formation',
    '/teams/*/space/squad', 
    '/teams/*/space/calendar',
    '/teams/*/space/settings'
  ];
  
  // Check if current path matches any collapse patterns
  const shouldCollapse = collapsePages.some(pattern => {
    const regex = new RegExp(pattern.replace('*', '[^/]+'));
    return regex.test(pathname);
  });
  
  if (shouldCollapse) {
    collapseSidebar();
  } else {
    expandSidebar();
  }
};
