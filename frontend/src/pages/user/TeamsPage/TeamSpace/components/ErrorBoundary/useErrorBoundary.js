/**
 * useErrorBoundary Hook
 * Provides programmatic error boundary functionality
 */

import { useState, useCallback } from 'react';

/**
 * Custom hook for error boundary functionality
 * @returns {Object} Error boundary utilities
 */
export const useErrorBoundary = () => {
  const [error, setError] = useState(null);

  const captureError = useCallback((error) => {
    setError(error);
    
    // Report error to analytics
    if (typeof window !== 'undefined' && window.trackError) {
      window.trackError(error);
    }
    
    console.error('Error captured by useErrorBoundary:', error);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const throwError = useCallback((error) => {
    throw error;
  }, []);

  return {
    error,
    captureError,
    resetError,
    throwError,
    hasError: error !== null
  };
};

export default useErrorBoundary;