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
} from './ErrorBoundary';

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
} from './LoadingScreen/LoadingScreen';

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
} from './ErrorScreen/ErrorScreen';

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
} from './Layout/TeamSpaceLayout';

/**
 * Navigation Components
 * Handles breadcrumb navigation and path management
 */
export { default as TeamSpaceBreadcrumb } from './Breadcrumb/TeamSpaceBreadcrumb';

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
} from './Modal/ConfirmationModal';

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
  clearAllToasts,
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  showLoadingToast
} from './TeamSpaceToast';

// ============================================================================
// CONVENIENCE RE-EXPORTS
// ============================================================================

/**
 * Re-export all named exports for flexible import patterns
 * Allows both: import { LoadingScreen } from './components'
 * And: import { TeamSpaceLoading } from './components'
 */
export * from './ErrorBoundary/TeamSpaceErrorBoundary';
export * from './LoadingScreen/LoadingScreen';
export * from './ErrorScreen/ErrorScreen';
export * from './Layout/TeamSpaceLayout';
export * from './Breadcrumb/TeamSpaceBreadcrumb';
export * from './Modal/ConfirmationModal';

// ============================================================================
// COMPONENT COLLECTIONS
// ============================================================================

/**
 * Error Management Collection
 * All error-related components grouped together
 */
export const ErrorComponents = {
  ErrorBoundary: require('./ErrorBoundary/TeamSpaceErrorBoundary').default,
  ErrorScreen: require('./ErrorScreen/ErrorScreen').default,
  NetworkError: require('./ErrorScreen/ErrorScreen').NetworkErrorScreen,
  PermissionError: require('./ErrorScreen/ErrorScreen').PermissionErrorScreen,
  NotFoundError: require('./ErrorScreen/ErrorScreen').NotFoundErrorScreen,
  ServerError: require('./ErrorScreen/ErrorScreen').ServerErrorScreen,
  TimeoutError: require('./ErrorScreen/ErrorScreen').TimeoutErrorScreen,
  ValidationError: require('./ErrorScreen/ErrorScreen').ValidationErrorScreen
};

/**
 * Loading Management Collection
 * All loading-related components grouped together
 */
export const LoadingComponents = {
  LoadingScreen: require('./LoadingScreen/LoadingScreen').default,
  TeamSpaceLoading: require('./LoadingScreen/LoadingScreen').TeamSpaceLoading,
  TeamDataLoading: require('./LoadingScreen/LoadingScreen').TeamDataLoading,
  FormationLoading: require('./LoadingScreen/LoadingScreen').FormationLoading,
  SkeletonLoading: require('./LoadingScreen/LoadingScreen').SkeletonLoading
};

/**
 * Layout Management Collection
 * All layout-related components grouped together
 */
export const LayoutComponents = {
  TeamSpaceLayout: require('./Layout/TeamSpaceLayout').default,
  DashboardLayout: require('./Layout/TeamSpaceLayout').DashboardLayout,
  CenteredLayout: require('./Layout/TeamSpaceLayout').CenteredLayout,
  SplitLayout: require('./Layout/TeamSpaceLayout').SplitLayout,
  Breadcrumb: require('./Breadcrumb/TeamSpaceBreadcrumb').default
};

/**
 * UI Interaction Collection
 * All interactive UI components grouped together
 */
export const UIComponents = {
  ConfirmationModal: require('./Modal/ConfirmationModal').default,
  DangerModal: require('./Modal/ConfirmationModal').DangerConfirmationModal,
  WarningModal: require('./Modal/ConfirmationModal').WarningConfirmationModal,
  SuccessModal: require('./Modal/ConfirmationModal').SuccessConfirmationModal,
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
  useTeamSpaceLayout: require('./Layout/TeamSpaceLayout').useTeamSpaceLayout,
  useConfirmationModal: require('./Modal/ConfirmationModal').useConfirmationModal,
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
 * @param {string} componentName - Name of the component
 * @returns {React.Component|null} Component or null if not found
 */
export const getComponent = (componentName) => {
  const components = {
    TeamSpaceErrorBoundary: require('./ErrorBoundary/TeamSpaceErrorBoundary').default,
    LoadingScreen: require('./LoadingScreen/LoadingScreen').default,
    TeamSpaceLoading: require('./LoadingScreen/LoadingScreen').TeamSpaceLoading,
    TeamDataLoading: require('./LoadingScreen/LoadingScreen').TeamDataLoading,
    FormationLoading: require('./LoadingScreen/LoadingScreen').FormationLoading,
    SkeletonLoading: require('./LoadingScreen/LoadingScreen').SkeletonLoading,
    NetworkErrorScreen: require('./ErrorScreen/ErrorScreen').NetworkErrorScreen,
    PermissionErrorScreen: require('./ErrorScreen/ErrorScreen').PermissionErrorScreen,
    NotFoundErrorScreen: require('./ErrorScreen/ErrorScreen').NotFoundErrorScreen,
    ServerErrorScreen: require('./ErrorScreen/ErrorScreen').ServerErrorScreen,
    TimeoutErrorScreen: require('./ErrorScreen/ErrorScreen').TimeoutErrorScreen,
    ValidationErrorScreen: require('./ErrorScreen/ErrorScreen').ValidationErrorScreen,
    DashboardLayout: require('./Layout/TeamSpaceLayout').DashboardLayout,
    CenteredLayout: require('./Layout/TeamSpaceLayout').CenteredLayout,
    SplitLayout: require('./Layout/TeamSpaceLayout').SplitLayout,
    DangerConfirmationModal: require('./Modal/ConfirmationModal').DangerConfirmationModal,
    WarningConfirmationModal: require('./Modal/ConfirmationModal').WarningConfirmationModal,
    SuccessConfirmationModal: require('./Modal/ConfirmationModal').SuccessConfirmationModal,
    TeamSpaceBreadcrumb: require('./Breadcrumb/TeamSpaceBreadcrumb').default
  };
  
  return components[componentName] || null;
};

/**
 * Get Components by Category
 * @param {string} category - Category name
 * @returns {Array} Array of component names in the category
 */
export const getComponentsByCategory = (category) => {
  return COMPONENT_CATEGORIES[category] || [];
};

/**
 * List all available components
 * @returns {Array} Array of all component names
 */
export const listAvailableComponents = () => {
  return Object.keys(COMPONENT_REGISTRY);
};

/**
 * Get component information
 * @param {string} componentName - Name of the component
 * @returns {Object|null} Component metadata or null if not found
 */
export const getComponentInfo = (componentName) => {
  return COMPONENT_REGISTRY[componentName] || null;
};

/**
 * Development Utilities
 */
export const DevUtils = {
  COMPONENT_REGISTRY,
  COMPONENT_CATEGORIES,
  getComponent,
  getComponentsByCategory,
  listAvailableComponents,
  getComponentInfo
};

/**
 * Version Information
 */
export const VERSION_INFO = {
  version: '1.0.0',
  buildDate: new Date().toISOString(),
  components: Object.keys(COMPONENT_REGISTRY).length,
  categories: Object.keys(COMPONENT_CATEGORIES).length
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

/**
 * Default export containing the most commonly used components
 */
const TeamSpaceComponents = {
  // Most commonly used components
  ErrorBoundary: require('./ErrorBoundary/TeamSpaceErrorBoundary').default,
  Loading: require('./LoadingScreen/LoadingScreen').default,
  Error: require('./ErrorScreen/ErrorScreen').default,
  Layout: require('./Layout/TeamSpaceLayout').default,
  Breadcrumb: require('./Breadcrumb/TeamSpaceBreadcrumb').default,
  Modal: require('./Modal/ConfirmationModal').default,
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
  console.log('📦 Available Components:', Object.keys(COMPONENT_REGISTRY).length);
  console.log('📁 Component Categories:', Object.keys(COMPONENT_CATEGORIES).length);
  console.log('🔧 Development Utils:', Object.keys(DevUtils).length);
  console.log('📋 Version:', VERSION_INFO.version);
  console.groupEnd();
}