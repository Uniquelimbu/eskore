/**
 * useErrorScreen Hook
 * Main hook for error screen functionality
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getErrorConfig } from '../utils/errorConfigs';
import { trackErrorEvent } from '../utils/errorHelpers';
import { ERROR_TYPES, ANALYTICS_EVENTS } from '../constants';

/**
 * Custom hook for error screen management
 * @param {Object} options - Hook configuration options
 * @returns {Object} Error screen state and methods
 */
const useErrorScreen = ({
  error = null,
  errorType = ERROR_TYPES.GENERIC,
  onRetry = null,
  onGoBack = null,
  trackError = true,
  errorId = null,
  customConfig = {}
} = {}) => {
  // State management
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimer, setRetryTimer] = useState(0);
  const [hasAutoRetried, setHasAutoRetried] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [lastRetryTime, setLastRetryTime] = useState(null);

  // Get error configuration
  const errorConfig = useMemo(() => {
    const baseConfig = getErrorConfig(errorType);
    return {
      ...baseConfig,
      ...customConfig,
      messages: {
        ...baseConfig.messages,
        ...(customConfig.messages || {})
      },
      retryConfig: {
        ...baseConfig.retryConfig,
        ...(customConfig.retryConfig || {})
      }
    };
  }, [errorType, customConfig]);

  // Calculate if retry is available
  const canRetry = useMemo(() => {
    return errorConfig.retryable && 
           onRetry && 
           retryCount < (errorConfig.retryConfig?.maxRetries || 0);
  }, [errorConfig, onRetry, retryCount]);

  // Calculate next retry delay with exponential backoff
  const nextRetryDelay = useMemo(() => {
    const baseDelay = errorConfig.retryConfig?.retryDelay || 1000;
    const backoffMultiplier = errorConfig.retryConfig?.backoffMultiplier || 1;
    return Math.min(baseDelay * Math.pow(backoffMultiplier, retryCount), 30000);
  }, [errorConfig, retryCount]);

  // Track error display
  useEffect(() => {
    if (trackError && error) {
      trackErrorEvent(ANALYTICS_EVENTS.ERROR_DISPLAYED, {
        errorType,
        errorMessage: typeof error === 'string' ? error : error?.message,
        errorId,
        canRetry,
        retryCount
      });
    }
  }, [error, errorType, errorId, trackError, canRetry, retryCount]);

  // Auto-retry logic
  useEffect(() => {
    if (errorConfig.autoRetry && 
        !hasAutoRetried && 
        canRetry && 
        !isRetrying) {
      
      const timer = setTimeout(() => {
        setHasAutoRetried(true);
        handleRetry();
        
        if (trackError) {
          trackErrorEvent(ANALYTICS_EVENTS.AUTO_RETRY_TRIGGERED, {
            errorType,
            retryCount: retryCount + 1,
            retryDelay: nextRetryDelay,
            errorId
          });
        }
      }, nextRetryDelay);

      return () => clearTimeout(timer);
    }
  }, [errorConfig.autoRetry, hasAutoRetried, canRetry, isRetrying, nextRetryDelay, trackError, errorType, retryCount, errorId]);

  /**
   * Handle retry with loading state and timer
   */
  const handleRetry = useCallback(async () => {
    if (!canRetry || isRetrying) return;

    setIsRetrying(true);
    setLastRetryTime(Date.now());
    
    // Track retry attempt
    if (trackError) {
      trackErrorEvent(ANALYTICS_EVENTS.RETRY_ATTEMPTED, {
        errorType,
        retryCount: retryCount + 1,
        retryDelay: nextRetryDelay,
        errorId,
        isAutoRetry: false
      });
    }

    try {
      // Show countdown timer if delay is significant
      if (nextRetryDelay > 1000) {
        for (let i = Math.ceil(nextRetryDelay / 1000); i > 0; i--) {
          setRetryTimer(i);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        setRetryTimer(0);
      }

      // Execute retry
      await onRetry();
      
      // Track successful retry
      if (trackError) {
        trackErrorEvent(ANALYTICS_EVENTS.RETRY_SUCCEEDED, {
          errorType,
          retryCount: retryCount + 1,
          totalRetryTime: Date.now() - lastRetryTime,
          errorId
        });
      }

    } catch (retryError) {
      console.error('Retry failed:', retryError);
      
      // Track failed retry
      if (trackError) {
        trackErrorEvent(ANALYTICS_EVENTS.RETRY_FAILED, {
          errorType,
          retryCount: retryCount + 1,
          retryError: retryError?.message,
          errorId
        });
      }
      
      // Increment retry count only on failure
      setRetryCount(prev => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  }, [canRetry, isRetrying, onRetry, nextRetryDelay, trackError, errorType, retryCount, errorId, lastRetryTime]);

  /**
   * Handle go back action
   */
  const handleGoBack = useCallback(() => {
    if (trackError) {
      trackErrorEvent(ANALYTICS_EVENTS.GO_BACK_CLICKED, {
        errorType,
        retryCount,
        errorId
      });
    }

    if (onGoBack) {
      onGoBack();
    } else {
      // Default behavior
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/teams';
      }
    }
  }, [onGoBack, trackError, errorType, retryCount, errorId]);

  /**
   * Toggle error details visibility
   */
  const toggleDetails = useCallback(() => {
    const newShowDetails = !showDetails;
    setShowDetails(newShowDetails);
    
    if (trackError && newShowDetails) {
      trackErrorEvent(ANALYTICS_EVENTS.DETAILS_VIEWED, {
        errorType,
        errorId
      });
    }
  }, [showDetails, trackError, errorType, errorId]);

  /**
   * Reset error screen state
   */
  const resetErrorScreen = useCallback(() => {
    setIsRetrying(false);
    setRetryCount(0);
    setRetryTimer(0);
    setHasAutoRetried(false);
    setShowDetails(false);
    setLastRetryTime(null);
  }, []);

  /**
   * Get retry button text with timer
   */
  const getRetryButtonText = useCallback(() => {
    if (isRetrying && retryTimer > 0) {
      return `Retrying in ${retryTimer}s...`;
    }
    if (isRetrying) {
      return 'Retrying...';
    }
    if (retryCount > 0) {
      const maxRetries = errorConfig.retryConfig?.maxRetries || 0;
      return `Retry (${retryCount + 1}/${maxRetries})`;
    }
    return 'Try Again';
  }, [isRetrying, retryTimer, retryCount, errorConfig]);

  /**
   * Get retry status information
   */
  const getRetryStatus = useCallback(() => {
    const maxRetries = errorConfig.retryConfig?.maxRetries || 0;
    
    return {
      current: retryCount,
      maximum: maxRetries,
      remaining: Math.max(0, maxRetries - retryCount),
      isMaxReached: retryCount >= maxRetries,
      canRetryAgain: canRetry,
      nextRetryIn: isRetrying ? retryTimer : null
    };
  }, [retryCount, errorConfig, canRetry, isRetrying, retryTimer]);

  /**
   * Check if error is recoverable
   */
  const isRecoverable = useMemo(() => {
    return errorConfig.canAutoRecover || canRetry;
  }, [errorConfig.canAutoRecover, canRetry]);

  /**
   * Get error severity level
   */
  const severity = useMemo(() => {
    return errorConfig.severity || 'medium';
  }, [errorConfig.severity]);

  // Return hook interface
  return {
    // State
    isRetrying,
    retryCount,
    retryTimer,
    hasAutoRetried,
    showDetails,
    canRetry,
    isRecoverable,
    severity,
    
    // Configuration
    errorConfig,
    nextRetryDelay,
    
    // Methods
    handleRetry,
    handleGoBack,
    toggleDetails,
    resetErrorScreen,
    getRetryButtonText,
    getRetryStatus,
    
    // Computed values
    retryStatus: getRetryStatus(),
    retryButtonText: getRetryButtonText()
  };
};

export default useErrorScreen;