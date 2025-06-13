/**
 * ErrorBoundary Module - Main Exports
 * 
 * Provides comprehensive error handling components and utilities
 * for the TeamSpace application.
 * 
 * @version 1.0.0
 * @author TeamSpace Development Team
 */

import React from 'react';

// Core component
export { default as TeamSpaceErrorBoundary } from './TeamSpaceErrorBoundary';

// Higher-order component
export { default as withErrorBoundary } from './withErrorBoundary';

// UI components
export { default as ErrorUI } from './ErrorUI';

// Utilities
export { default as ErrorReporter } from './ErrorReporter';
export * from './utils/errorTracking';
export * from './utils/errorUtils';
export * from './constants';

// Default export for convenience
export { default } from './TeamSpaceErrorBoundary';

// ✅ FIXED: Re-export for backward compatibility
export { default as withTeamSpaceErrorBoundary } from './withErrorBoundary';

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Custom hook for using ErrorBoundary programmatically
 */
export const useErrorBoundary = () => {
  const [error, setError] = React.useState(null);
  
  const captureError = React.useCallback((error) => {
    setError(error);
  }, []);
  
  const clearError = React.useCallback(() => {
    setError(null);
  }, []);
  
  // Throw error to trigger error boundary
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);
  
  return { captureError, clearError };
};