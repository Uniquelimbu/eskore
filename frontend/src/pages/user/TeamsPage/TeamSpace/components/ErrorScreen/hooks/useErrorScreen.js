/**
 * useErrorScreen Hook
 * Main hook for ErrorScreen state management and functionality
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ERROR_TYPES } from '../constants';
import { extractErrorType, formatErrorMessage, generateErrorId } from '../utils/errorHelpers';
import useRetryLogic from './useRetryLogic';
import useErrorTracking from './useErrorTracking';

/**
 * Custom hook for ErrorScreen functionality
 * @param {Object} options - Hook configuration options
 * @returns {Object} Error screen state and methods
 */
const useErrorScreen = ({
  error = null,
  errorType = null,
  errorId = null,
  onRetry = null,
  onGoBack = null,
  trackError = true,
  autoRetry = false,
  maxRetries = 3,
  retryDelay = 1000,
  showDetails = false,
  userId = null,
  teamId = null,
  metadata = {}
} = {}) => {
  // State management
  const [currentError, setCurrentError] = useState(error);
  const [currentErrorType, setCurrentErrorType] = useState(errorType);
  const [currentErrorId, setCurrentErrorId] = useState(errorId);
  const [isVisible, setIsVisible] = useState(true);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(showDetails);
  const [errorContext, setErrorContext] = useState(metadata);

  // Refs for cleanup
  const mountedRef = useRef(true);
  const errorOccurredAt = useRef(Date.now());

  // Determine error type if not provided
  const detectedErrorType = useMemo(() => {
    if (currentErrorType) return currentErrorType;
    if (currentError) return extractErrorType(currentError);
    return ERROR_TYPES.GENERIC;
  }, [currentError, currentErrorType]);

  // Generate error ID if not provided
  const errorIdentifier = useMemo(() => {
    return currentErrorId || generateErrorId();
  }, [currentErrorId]);

  // Initialize retry logic
  const {
    retryCount,
    isRetrying,
    retryTimer,
    canRetry,
    retryStats,
    retryButtonText,
    retry,
    cancelRetry,
    resetRetries
  } = useRetryLogic({
    errorType: detectedErrorType,
    onRetry,
    maxRetries,
    initialRetryDelay: retryDelay,
    autoRetry,
    errorId: errorIdentifier,
    onRetrySuccess: handleRetrySuccess,
    onRetryFailure: handleRetryFailure,
    onMaxRetriesReached: handleMaxRetriesReached
  });

  // Initialize error tracking
  const {
    trackError: trackErrorEvent,
    trackUserAction,
    getTrackingSummary,
    isTracking
  } = useErrorTracking({
    errorType: detectedErrorType,
    errorId: errorIdentifier,
    userId,
    teamId,
    enableAnalytics: trackError,
    customMetadata: errorContext
  });

  /**
   * Handle retry success
   */
  function handleRetrySuccess(result, retryInfo) {
    if (!mountedRef.current) return;
    
    setIsVisible(false);
    
    if (trackError) {
      trackUserAction('retry_success', {
        retryCount: retryInfo.attempt,
        duration: retryInfo.duration,
        result
      });
    }
  }

  /**
   * Handle retry failure
   */
  function handleRetryFailure(error, retryInfo) {
    if (!mountedRef.current) return;
    
    // Update error if it changed during retry
    if (error && error !== currentError) {
      setCurrentError(error);
    }
    
    if (trackError) {
      trackUserAction('retry_failure', {
        retryCount: retryInfo.attempt,
        duration: retryInfo.duration,
        error: error?.message || 'Unknown error'
      });
    }
  }

  /**
   * Handle max retries reached
   */
  function handleMaxRetriesReached(error, stats) {
    if (!mountedRef.current) return;
    
    if (trackError) {
      trackUserAction('max_retries_reached', {
        totalAttempts: stats.totalAttempts,
        totalRetryTime: stats.totalRetryTime,
        finalError: error?.message || 'Unknown error'
      });
    }
  }

  /**
   * Handle go back action
   */
  const handleGoBack = useCallback(() => {
    if (trackError) {
      trackUserAction('go_back_clicked', {
        errorType: detectedErrorType,
        errorId: errorIdentifier,
        retryCount
      });
    }
    
    if (onGoBack) {
      onGoBack();
    } else {
      // Default go back behavior
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/teams';
      }
    }
  }, [trackError, trackUserAction, detectedErrorType, errorIdentifier, retryCount, onGoBack]);

  /**
   * Handle error details toggle
   */
  const handleToggleDetails = useCallback(() => {
    const newShowDetails = !showErrorDetails;
    setShowErrorDetails(newShowDetails);
    
    if (trackError) {
      trackUserAction(newShowDetails ? 'details_shown' : 'details_hidden', {
        errorType: detectedErrorType,
        errorId: errorIdentifier
      });
    }
  }, [showErrorDetails, trackError, trackUserAction, detectedErrorType, errorIdentifier]);

  /**
   * Handle error dismissal
   */
  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    
    if (trackError) {
      trackUserAction('error_dismissed', {
        errorType: detectedErrorType,
        errorId: errorIdentifier,
        displayDuration: Date.now() - errorOccurredAt.current
      });
    }
  }, [trackError, trackUserAction, detectedErrorType, errorIdentifier]);

  /**
   * Update error
   */
  const updateError = useCallback((newError, newErrorType = null, newMetadata = {}) => {
    setCurrentError(newError);
    setCurrentErrorType(newErrorType);
    setErrorContext(prev => ({ ...prev, ...newMetadata }));
    
    // Reset error state
    setIsVisible(true);
    setShowErrorDetails(showDetails);
    resetRetries();
    
    // Update error occurred timestamp
    errorOccurredAt.current = Date.now();
    
    // Generate new error ID for new errors
    if (newError !== currentError) {
      setCurrentErrorId(generateErrorId());
    }
  }, [currentError, showDetails, resetRetries]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setCurrentError(null);
    setCurrentErrorType(null);
    setCurrentErrorId(null);
    setIsVisible(false);
    setErrorContext({});
    resetRetries();
  }, [resetRetries]);

  /**
   * Get error summary
   */
  const getErrorSummary = useCallback(() => {
    return {
      error: currentError,
      errorType: detectedErrorType,
      errorId: errorIdentifier,
      errorMessage: formatErrorMessage(currentError),
      isVisible,
      hasBeenShown,
      showDetails: showErrorDetails,
      context: errorContext,
      retry: {
        ...retryStats,
        canRetry,
        isRetrying,
        retryTimer,
        retryButtonText
      },
      tracking: isTracking ? getTrackingSummary() : null,
      timing: {
        occurredAt: errorOccurredAt.current,
        displayDuration: Date.now() - errorOccurredAt.current
      }
    };
  }, [
    currentError,
    detectedErrorType,
    errorIdentifier,
    isVisible,
    hasBeenShown,
    showErrorDetails,
    errorContext,
    retryStats,
    canRetry,
    isRetrying,
    retryTimer,
    retryButtonText,
    isTracking,
    getTrackingSummary
  ]);

  // Track error when it changes
  useEffect(() => {
    if (currentError && trackError) {
      trackErrorEvent(currentError, {
        errorType: detectedErrorType,
        errorId: errorIdentifier,
        metadata: errorContext,
        timestamp: errorOccurredAt.current
      });
      
      setHasBeenShown(true);
    }
  }, [currentError, trackError, trackErrorEvent, detectedErrorType, errorIdentifier, errorContext]);

  // Update error when prop changes
  useEffect(() => {
    if (error !== currentError) {
      updateError(error, errorType, metadata);
    }
  }, [error, errorType, metadata, currentError, updateError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cancelRetry();
    };
  }, [cancelRetry]);

  return {
    // State
    error: currentError,
    errorType: detectedErrorType,
    errorId: errorIdentifier,
    isVisible,
    hasBeenShown,
    showDetails: showErrorDetails,
    errorContext,
    
    // Retry functionality
    retryCount,
    isRetrying,
    retryTimer,
    canRetry,
    retryStats,
    retryButtonText,
    
    // Actions
    retry,
    cancelRetry,
    resetRetries,
    handleGoBack,
    handleToggleDetails,
    handleDismiss,
    updateError,
    clearError,
    
    // Utilities
    getErrorSummary,
    
    // Tracking
    isTracking,
    trackUserAction
  };
};

export default useErrorScreen;