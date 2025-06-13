/**
 * ErrorScreen Module - Simplified Re-exports
 * Lightweight module - complex features moved to main index.js
 */

// React
import React from 'react';

// ============================================================================
// CORE COMPONENTS EXPORTS (SIMPLIFIED)
// ============================================================================

// Re-export main component as default
export { default } from './ErrorScreen';

// Re-export specialized components
export {
  NetworkErrorScreen,
  PermissionErrorScreen,
  NotFoundErrorScreen,
  ServerErrorScreen,
  TimeoutErrorScreen,
  ValidationErrorScreen
} from './ErrorScreen';

// Named export for main component
export { default as ErrorScreen } from './ErrorScreen';

// ============================================================================
// SUB-COMPONENTS EXPORTS
// ============================================================================

export { default as ErrorIcon } from './components/ErrorIcon';
export { default as ErrorContent } from './components/ErrorContent';
export { default as ErrorActions } from './components/ErrorActions';
export { default as RetryButton } from './components/RetryButton';

// ============================================================================
// HOOKS EXPORTS
// ============================================================================

export { default as useErrorScreen } from './hooks/useErrorScreen';
export { default as useRetryLogic } from './hooks/useRetryLogic';
export { default as useErrorTracking } from './hooks/useErrorTracking';

// ============================================================================
// UTILITIES EXPORTS
// ============================================================================

export * from './utils/errorConfigs';
export * from './utils/errorHelpers';
export * from './utils/errorFormatters';
export * from './constants';
export * from './types';

// ============================================================================
// SIMPLE COLLECTIONS (Lightweight)
// ============================================================================

/**
 * Basic component collections - Advanced features in main index.js
 */
export const ErrorComponents = {
  ErrorScreen: require('./ErrorScreen').default,
  NetworkErrorScreen: require('./ErrorScreen').NetworkErrorScreen,
  PermissionErrorScreen: require('./ErrorScreen').PermissionErrorScreen,
  NotFoundErrorScreen: require('./ErrorScreen').NotFoundErrorScreen,
  ServerErrorScreen: require('./ErrorScreen').ServerErrorScreen,
  TimeoutErrorScreen: require('./ErrorScreen').TimeoutErrorScreen,
  ValidationErrorScreen: require('./ErrorScreen').ValidationErrorScreen
};

export const ErrorHooks = {
  useErrorScreen: require('./hooks/useErrorScreen').default,
  useRetryLogic: require('./hooks/useRetryLogic').default,
  useErrorTracking: require('./hooks/useErrorTracking').default
};