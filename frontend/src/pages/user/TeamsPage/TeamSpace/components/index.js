/**
 * TeamSpace Components - Main Export Module
 * 
 * This module provides centralized exports for all TeamSpace-specific components,
 * following industry standards for React component organization and distribution.
 * 
 * @version 1.0.0
 * @author TeamSpace Development Team
 * @since 2024
 */

// ============================================================================
// CORE COMPONENTS
// ============================================================================

/**
 * Error Boundary Components
 * Provides error handling and recovery mechanisms
 */
export { 
  default as TeamSpaceErrorBoundary, 
  withTeamSpaceErrorBoundary 
} from './TeamSpaceErrorBoundary';

/**
 * Loading State Components
 * Handles various loading states with customizable options
 */
export { 
  default as LoadingScreen,
  TeamSpaceLoading,
  TeamDataLoading,
  FormationLoading,
  SkeletonLoading
} from './LoadingScreen';

/**
 * Error Display Components
 * Specialized error screens for different error types
 */
export { 
  default as ErrorScreen,
  NetworkErrorScreen,
  PermissionErrorScreen,
  NotFoundErrorScreen,
  ServerErrorScreen,
  TimeoutErrorScreen,
  ValidationErrorScreen
} from './ErrorScreen';

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

/**
 * Layout System Components
 * Provides consistent layout structure and behavior
 */
export { 
  default as TeamSpaceLayout,
  DashboardLayout,
  CenteredLayout,
  SplitLayout,
  useTeamSpaceLayout
} from './TeamSpaceLayout';

/**
 * Navigation Components
 * Handles breadcrumb navigation and path management
 */
export { default as TeamSpaceBreadcrumb } from './TeamSpaceBreadcrumb';

// ============================================================================
// UI INTERACTION COMPONENTS
// ============================================================================

/**
 * Modal Components
 * Confirmation dialogs and interactive modals
 */
export { 
  default as ConfirmationModal,
  DangerConfirmationModal,
  WarningConfirmationModal,
  SuccessConfirmationModal,
  useConfirmationModal
} from './ConfirmationModal';

/**
 * Toast Notification System
 * Global notification management
 */
export { 
  default as TeamSpaceToast,
  useTeamSpaceToast,
  ToastProvider,
  ToastContainer,
  showToast,
  hideToast,
  clearAllToasts
} from './TeamSpaceToast';

// ============================================================================
// CONVENIENCE RE-EXPORTS
// ============================================================================

/**
 * Re-export all named exports for flexible import patterns
 * Allows both: import { LoadingScreen } from './components'
 * And: import { TeamSpaceLoading } from './components'
 */
export * from './TeamSpaceErrorBoundary';
export * from './LoadingScreen';
export * from './ErrorScreen';
export * from './TeamSpaceLayout';
export * from './TeamSpaceBreadcrumb';
export * from './ConfirmationModal';
export * from './TeamSpaceToast';

// ============================================================================
// COMPONENT COLLECTIONS
// ============================================================================

/**
 * Error Management Collection
 * All error-related components grouped together
 */
export const ErrorComponents = {
  ErrorBoundary: require('./TeamSpaceErrorBoundary').default,
  ErrorScreen: require('./ErrorScreen').default,
  NetworkError: require('./ErrorScreen').NetworkErrorScreen,
  PermissionError: require('./ErrorScreen').PermissionErrorScreen,
  NotFoundError: require('./ErrorScreen').NotFoundErrorScreen,
  ServerError: require('./ErrorScreen').ServerErrorScreen,
  TimeoutError: require('./ErrorScreen').TimeoutErrorScreen,
  ValidationError: require('./ErrorScreen').ValidationErrorScreen
};

/**
 * Loading Management Collection
 * All loading-related components grouped together
 */
export const LoadingComponents = {
  LoadingScreen: require('./LoadingScreen').default,
  TeamSpaceLoading: require('./LoadingScreen').TeamSpaceLoading,
  TeamDataLoading: require('./LoadingScreen').TeamDataLoading,
  FormationLoading: require('./LoadingScreen').FormationLoading,
  SkeletonLoading: require('./LoadingScreen').SkeletonLoading
};

/**
 * Layout Management Collection
 * All layout-related components grouped together
 */
export const LayoutComponents = {
  TeamSpaceLayout: require('./TeamSpaceLayout').default,
  DashboardLayout: require('./TeamSpaceLayout').DashboardLayout,
  CenteredLayout: require('./TeamSpaceLayout').CenteredLayout,
  SplitLayout: require('./TeamSpaceLayout').SplitLayout,
  Breadcrumb: require('./TeamSpaceBreadcrumb').default
};

/**
 * UI Interaction Collection
 * All interactive UI components grouped together
 */
export const UIComponents = {
  ConfirmationModal: require('./ConfirmationModal').default,
  DangerModal: require('./ConfirmationModal').DangerConfirmationModal,
  WarningModal: require('./ConfirmationModal').WarningConfirmationModal,
  SuccessModal: require('./ConfirmationModal').SuccessConfirmationModal,
  Toast: require('./TeamSpaceToast').default
};

// ============================================================================
// HOOKS COLLECTION
// ============================================================================

/**
 * Custom Hooks Collection
 * All component-related hooks grouped together
 */
export const ComponentHooks = {
  useTeamSpaceLayout: require('./TeamSpaceLayout').useTeamSpaceLayout,
  useConfirmationModal: require('./ConfirmationModal').useConfirmationModal,
  useTeamSpaceToast: require('./TeamSpaceToast').useTeamSpaceToast
};

// ============================================================================
// COMPONENT METADATA
// ============================================================================

/**
 * Component Registry
 * Metadata about all available components for development tools
 */
export const COMPONENT_REGISTRY = {
  // Core Components
  'TeamSpaceErrorBoundary': {
    category: 'Error Management',
    description: 'React Error Boundary for TeamSpace with comprehensive error handling',
    props: ['children', 'onError', 'onRetry', 'showDetails', 'customErrorMessage'],
    version: '1.0.0'
  },
  'LoadingScreen': {
    category: 'Loading States',
    description: 'Customizable loading screen with multiple variants and progress tracking',
    props: ['message', 'size', 'variant', 'showProgress', 'progress', 'timeout'],
    version: '1.0.0'
  },
  'ErrorScreen': {
    category: 'Error Management',
    description: 'Error display screen with retry functionality and error reporting',
    props: ['error', 'errorType', 'onRetry', 'onGoBack', 'showDetails'],
    version: '1.0.0'
  },
  'TeamSpaceLayout': {
    category: 'Layout',
    description: 'Main layout component with responsive design and accessibility features',
    props: ['children', 'title', 'subtitle', 'layout', 'spacing', 'showBreadcrumb'],
    version: '1.0.0'
  },
  'TeamSpaceBreadcrumb': {
    category: 'Navigation',
    description: 'Smart breadcrumb navigation with auto-generation from routes',
    props: ['customItems', 'showTeamLogo', 'showIcons', 'maxItems', 'separator'],
    version: '1.0.0'
  },
  'ConfirmationModal': {
    category: 'UI Interaction',
    description: 'Accessible confirmation modal with keyboard navigation',
    props: ['isOpen', 'onConfirm', 'onCancel', 'title', 'message', 'variant'],
    version: '1.0.0'
  },
  'TeamSpaceToast': {
    category: 'UI Interaction',
    description: 'Global toast notification system with queue management',
    props: ['message', 'type', 'duration', 'position', 'showIcon'],
    version: '1.0.0'
  }
};

/**
 * Component Categories
 * Organized grouping for development and documentation
 */
export const COMPONENT_CATEGORIES = {
  'Error Management': [
    'TeamSpaceErrorBoundary',
    'ErrorScreen',
    'NetworkErrorScreen',
    'PermissionErrorScreen',
    'NotFoundErrorScreen',
    'ServerErrorScreen',
    'TimeoutErrorScreen',
    'ValidationErrorScreen'
  ],
  'Loading States': [
    'LoadingScreen',
    'TeamSpaceLoading',
    'TeamDataLoading',
    'FormationLoading',
    'SkeletonLoading'
  ],
  'Layout': [
    'TeamSpaceLayout',
    'DashboardLayout',
    'CenteredLayout',
    'SplitLayout'
  ],
  'Navigation': [
    'TeamSpaceBreadcrumb'
  ],
  'UI Interaction': [
    'ConfirmationModal',
    'DangerConfirmationModal',
    'WarningConfirmationModal',
    'SuccessConfirmationModal',
    'TeamSpaceToast'
  ]
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get Component by Name
 * Utility function to dynamically retrieve components
 * @param {string} componentName - Name of the component to retrieve
 * @returns {React.Component|null} The requested component or null if not found
 */
export const getComponent = (componentName) => {
  const components = {
    // Core Components
    TeamSpaceErrorBoundary: require('./TeamSpaceErrorBoundary').default,
    LoadingScreen: require('./LoadingScreen').default,
    ErrorScreen: require('./ErrorScreen').default,
    TeamSpaceLayout: require('./TeamSpaceLayout').default,
    TeamSpaceBreadcrumb: require('./TeamSpaceBreadcrumb').default,
    ConfirmationModal: require('./ConfirmationModal').default,
    TeamSpaceToast: require('./TeamSpaceToast').default,
    
    // Specialized Components
    TeamSpaceLoading: require('./LoadingScreen').TeamSpaceLoading,
    TeamDataLoading: require('./LoadingScreen').TeamDataLoading,
    FormationLoading: require('./LoadingScreen').FormationLoading,
    SkeletonLoading: require('./LoadingScreen').SkeletonLoading,
    NetworkErrorScreen: require('./ErrorScreen').NetworkErrorScreen,
    PermissionErrorScreen: require('./ErrorScreen').PermissionErrorScreen,
    NotFoundErrorScreen: require('./ErrorScreen').NotFoundErrorScreen,
    ServerErrorScreen: require('./ErrorScreen').ServerErrorScreen,
    TimeoutErrorScreen: require('./ErrorScreen').TimeoutErrorScreen,
    ValidationErrorScreen: require('./ErrorScreen').ValidationErrorScreen,
    DashboardLayout: require('./TeamSpaceLayout').DashboardLayout,
    CenteredLayout: require('./TeamSpaceLayout').CenteredLayout,
    SplitLayout: require('./TeamSpaceLayout').SplitLayout,
    DangerConfirmationModal: require('./ConfirmationModal').DangerConfirmationModal,
    WarningConfirmationModal: require('./ConfirmationModal').WarningConfirmationModal,
    SuccessConfirmationModal: require('./ConfirmationModal').SuccessConfirmationModal
  };
  
  return components[componentName] || null;
};

/**
 * Get Components by Category
 * Utility function to retrieve all components in a specific category
 * @param {string} category - Category name
 * @returns {Object} Object containing all components in the category
 */
export const getComponentsByCategory = (category) => {
  const categoryComponents = COMPONENT_CATEGORIES[category];
  if (!categoryComponents) return {};
  
  const components = {};
  categoryComponents.forEach(componentName => {
    const component = getComponent(componentName);
    if (component) {
      components[componentName] = component;
    }
  });
  
  return components;
};

/**
 * List Available Components
 * Utility function to get a list of all available components
 * @returns {string[]} Array of component names
 */
export const listAvailableComponents = () => {
  return Object.keys(COMPONENT_REGISTRY);
};

/**
 * Get Component Info
 * Utility function to get metadata about a specific component
 * @param {string} componentName - Name of the component
 * @returns {Object|null} Component metadata or null if not found
 */
export const getComponentInfo = (componentName) => {
  return COMPONENT_REGISTRY[componentName] || null;
};

// ============================================================================
// DEVELOPMENT UTILITIES
// ============================================================================

/**
 * Component Development Helper
 * Provides development-time utilities for component testing and debugging
 */
export const DevUtils = {
  /**
   * Validate Component Props
   * Development helper to validate component props
   */
  validateProps: (componentName, props) => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const componentInfo = getComponentInfo(componentName);
    if (!componentInfo) {
      console.warn(`DevUtils: Unknown component "${componentName}"`);
      return;
    }
    
    const missingProps = componentInfo.props.filter(prop => 
      prop.required && !(prop in props)
    );
    
    if (missingProps.length > 0) {
      console.warn(`DevUtils: Missing required props for ${componentName}:`, missingProps);
    }
  },
  
  /**
   * List Component Categories
   */
  listCategories: () => Object.keys(COMPONENT_CATEGORIES),
  
  /**
   * Component Usage Statistics
   */
  getUsageStats: () => ({
    totalComponents: Object.keys(COMPONENT_REGISTRY).length,
    categories: Object.keys(COMPONENT_CATEGORIES).length,
    coreComponents: COMPONENT_CATEGORIES['Error Management'].length + 
                   COMPONENT_CATEGORIES['Loading States'].length + 
                   COMPONENT_CATEGORIES['Layout'].length,
    uiComponents: COMPONENT_CATEGORIES['UI Interaction'].length + 
                  COMPONENT_CATEGORIES['Navigation'].length
  })
};

// ============================================================================
// VERSION INFORMATION
// ============================================================================

/**
 * Module Version Information
 */
export const VERSION_INFO = {
  version: '1.0.0',
  buildDate: new Date().toISOString(),
  components: Object.keys(COMPONENT_REGISTRY).length,
  lastUpdated: '2024-06-13',
  author: 'TeamSpace Development Team'
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

/**
 * Default Export
 * Provides the most commonly used components for quick access
 */
const TeamSpaceComponents = {
  // Most commonly used components
  ErrorBoundary: require('./TeamSpaceErrorBoundary').default,
  Loading: require('./LoadingScreen').default,
  Error: require('./ErrorScreen').default,
  Layout: require('./TeamSpaceLayout').default,
  Breadcrumb: require('./TeamSpaceBreadcrumb').default,
  Modal: require('./ConfirmationModal').default,
  Toast: require('./TeamSpaceToast').default,
  
  // Utility collections
  ErrorComponents,
  LoadingComponents,
  LayoutComponents,
  UIComponents,
  ComponentHooks,
  
  // Metadata and utilities
  COMPONENT_REGISTRY,
  COMPONENT_CATEGORIES,
  getComponent,
  getComponentsByCategory,
  listAvailableComponents,
  getComponentInfo,
  DevUtils,
  VERSION_INFO
};

export default TeamSpaceComponents;

// ============================================================================
// DEVELOPMENT LOGGING
// ============================================================================

// Development-time logging
if (process.env.NODE_ENV === 'development') {
  console.group('🏗️ TeamSpace Components Module Loaded');
  console.log('📦 Version:', VERSION_INFO.version);
  console.log('🧩 Total Components:', Object.keys(COMPONENT_REGISTRY).length);
  console.log('📂 Categories:', Object.keys(COMPONENT_CATEGORIES).length);
  console.log('🔧 Development utilities available via DevUtils');
  console.groupEnd();
}

// ============================================================================
// TYPE DEFINITIONS (for TypeScript support)
// ============================================================================

/**
 * Type definitions for better IDE support
 * These will be useful when migrating to TypeScript
 */

/*
// Uncomment when migrating to TypeScript

export interface ComponentInfo {
  category: string;
  description: string;
  props: string[];
  version: string;
}

export interface ComponentRegistry {
  [componentName: string]: ComponentInfo;
}

export interface ComponentCategories {
  [categoryName: string]: string[];
}

export interface VersionInfo {
  version: string;
  buildDate: string;
  components: number;
  lastUpdated: string;
  author: string;
}

export type ComponentName = keyof typeof COMPONENT_REGISTRY;
export type CategoryName = keyof typeof COMPONENT_CATEGORIES;
*/