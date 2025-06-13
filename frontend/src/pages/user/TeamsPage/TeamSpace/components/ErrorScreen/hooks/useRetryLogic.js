/**
 * useRetryLogic Hook
 * Handles retry logic with exponential backoff, rate limiting, and smart recovery
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getErrorConfig, getRetryConfigWithBackoff } from '../utils/errorConfigs';
import { trackErrorEvent, isNetworkError, isOnline } from '../utils/errorHelpers';
import { ERROR_TYPES, ANALYTICS_EVENTS } from '../constants';

/**
 * Custom hook for advanced retry logic with exponential backoff
 * @param {Object} options - Hook configuration options
 * @returns {Object} Retry state and methods
 */
const useRetryLogic = ({
  errorType = ERROR_TYPES.GENERIC,
  onRetry = null,
  maxRetries = 3,
  initialRetryDelay = 1000,
  backoffMultiplier = 1.5,
  maxRetryDelay = 30000,
  autoRetry = false,
  trackRetries = true,
  errorId = null,
  retryCondition = null,
  onRetrySuccess = null,
  onRetryFailure = null,
  onMaxRetriesReached = null
} = {}) => {
  // State management
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryTimer, setRetryTimer] = useState(0);
  const [lastRetryTime, setLastRetryTime] = useState(null);
  const [retryHistory, setRetryHistory] = useState([]);
  const [isAutoRetryPaused, setIsAutoRetryPaused] = useState(false);
  const [hasReachedMaxRetries, setHasReachedMaxRetries] = useState(false);

  // Refs for cleanup
  const retryTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Error configuration
  const errorConfig = useMemo(() => {
    return getErrorConfig(errorType);
  }, [errorType]);

  // Calculate if retry is available
  const canRetry = useMemo(() => {
    return retryCount < maxRetries && 
           !hasReachedMaxRetries && 
           onRetry && 
           isOnline();
  }, [retryCount, maxRetries, hasReachedMaxRetries, onRetry]);

  // Calculate next retry delay with exponential backoff
  const nextRetryDelay = useMemo(() => {
    const configWithBackoff = getRetryConfigWithBackoff(errorType, retryCount);
    const baseDelay = configWithBackoff.retryDelay || initialRetryDelay;
    const calculatedDelay = Math.min(
      baseDelay * Math.pow(backoffMultiplier, retryCount),
      maxRetryDelay
    );
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * calculatedDelay;
    return Math.floor(calculatedDelay + jitter);
  }, [errorType, retryCount, initialRetryDelay, backoffMultiplier, maxRetryDelay]);

  // Calculate retry statistics
  const retryStats = useMemo(() => {
    const totalRetryTime = retryHistory.reduce((total, entry) => total + entry.duration, 0);
    const averageRetryTime = retryHistory.length > 0 ? totalRetryTime / retryHistory.length : 0;
    const successRate = retryHistory.length > 0 
      ? (retryHistory.filter(entry => entry.success).length / retryHistory.length) * 100 
      : 0;

    return {
      totalAttempts: retryCount,
      successfulRetries: retryHistory.filter(entry => entry.success).length,
      failedRetries: retryHistory.filter(entry => !entry.success).length,
      totalRetryTime,
      averageRetryTime,
      successRate,
      remainingRetries: Math.max(0, maxRetries - retryCount),
      isExhausted: hasReachedMaxRetries
    };
  }, [retryCount, retryHistory, maxRetries, hasReachedMaxRetries]);

  /**
   * Start countdown timer for retry delay
   */
  const startCountdown = useCallback((delayMs) => {
    setRetryTimer(Math.ceil(delayMs / 1000));
    
    countdownIntervalRef.current = setInterval(() => {
      setRetryTimer(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /**
   * Clear all timers and abort ongoing operations
   */
  const clearTimers = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setRetryTimer(0);
  }, []);

  /**
   * Check if retry should proceed based on conditions
   */
  const shouldRetry = useCallback((error = null) => {
    // Check basic conditions
    if (!canRetry || isRetrying) return false;

    // Check custom retry condition
    if (retryCondition && !retryCondition(error, retryCount)) return false;

    // Check network status for network errors
    if (isNetworkError(error) && !isOnline()) return false;

    // Check if auto-retry is paused
    if (autoRetry && isAutoRetryPaused) return false;

    return true;
  }, [canRetry, isRetrying, retryCondition, retryCount, autoRetry, isAutoRetryPaused]);

  /**
   * Execute retry with comprehensive error handling
   */
  const executeRetry = useCallback(async (isAutomatic = false) => {
    if (!shouldRetry()) {
      console.warn('Retry conditions not met');
      return { success: false, reason: 'conditions_not_met' };
    }

    setIsRetrying(true);
    const startTime = Date.now();
    setLastRetryTime(startTime);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    // Track retry attempt
    if (trackRetries) {
      trackErrorEvent(ANALYTICS_EVENTS.RETRY_ATTEMPTED, {
        errorType,
        retryCount: retryCount + 1,
        retryDelay: nextRetryDelay,
        isAutomatic,
        errorId,
        timestamp: startTime
      });
    }

    try {
      // Execute the retry function with abort signal
      const result = await onRetry({
        retryCount: retryCount + 1,
        abortSignal: abortControllerRef.current.signal,
        isAutomatic,
        retryHistory: retryHistory.slice()
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Update retry history
      const retryEntry = {
        attempt: retryCount + 1,
        success: true,
        duration,
        timestamp: startTime,
        isAutomatic,
        result
      };

      setRetryHistory(prev => [...prev, retryEntry]);
      setRetryCount(prev => prev + 1);

      // Track successful retry
      if (trackRetries) {
        trackErrorEvent(ANALYTICS_EVENTS.RETRY_SUCCEEDED, {
          errorType,
          retryCount: retryCount + 1,
          duration,
          totalRetryTime: retryHistory.reduce((total, entry) => total + entry.duration, 0) + duration,
          errorId,
          isAutomatic
        });
      }

      // Call success handler
      if (onRetrySuccess) {
        onRetrySuccess(result, retryEntry);
      }

      return { success: true, result, duration };

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Handle aborted requests
      if (error.name === 'AbortError') {
        console.log('Retry was cancelled');
        return { success: false, reason: 'cancelled', error };
      }

      // Update retry history
      const retryEntry = {
        attempt: retryCount + 1,
        success: false,
        duration,
        timestamp: startTime,
        isAutomatic,
        error: {
          message: error.message,
          type: error.constructor.name,
          code: error.code
        }
      };

      setRetryHistory(prev => [...prev, retryEntry]);
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);

      // Check if max retries reached
      if (newRetryCount >= maxRetries) {
        setHasReachedMaxRetries(true);
        
        if (trackRetries) {
          trackErrorEvent(ANALYTICS_EVENTS.RETRY_FAILED, {
            errorType,
            retryCount: newRetryCount,
            maxRetries,
            finalError: error.message,
            errorId,
            isAutomatic
          });
        }

        if (onMaxRetriesReached) {
          onMaxRetriesReached(error, retryStats);
        }
      } else {
        // Track failed retry (but not final failure)
        if (trackRetries) {
          trackErrorEvent(ANALYTICS_EVENTS.RETRY_FAILED, {
            errorType,
            retryCount: newRetryCount,
            retryError: error.message,
            willRetryAgain: true,
            errorId,
            isAutomatic
          });
        }
      }

      // Call failure handler
      if (onRetryFailure) {
        onRetryFailure(error, retryEntry);
      }

      return { success: false, error, duration };

    } finally {
      setIsRetrying(false);
      abortControllerRef.current = null;
    }
  }, [
    shouldRetry, 
    onRetry, 
    retryCount, 
    nextRetryDelay, 
    trackRetries, 
    errorType, 
    errorId, 
    retryHistory, 
    maxRetries, 
    onRetrySuccess, 
    onRetryFailure, 
    onMaxRetriesReached, 
    retryStats
  ]);

  /**
   * Manual retry with optional delay
   */
  const retry = useCallback(async (customDelay = null) => {
    clearTimers();

    const delay = customDelay !== null ? customDelay : nextRetryDelay;
    
    if (delay > 0) {
      startCountdown(delay);
      
      retryTimeoutRef.current = setTimeout(async () => {
        const result = await executeRetry(false);
        return result;
      }, delay);
    } else {
      return await executeRetry(false);
    }
  }, [clearTimers, nextRetryDelay, startCountdown, executeRetry]);

  /**
   * Cancel ongoing retry operation
   */
  const cancelRetry = useCallback(() => {
    clearTimers();
    setIsRetrying(false);
    setIsAutoRetryPaused(true);
    
    if (trackRetries) {
      trackErrorEvent('retry_cancelled', {
        errorType,
        retryCount,
        errorId
      });
    }
  }, [clearTimers, trackRetries, errorType, retryCount, errorId]);

  /**
   * Reset retry state
   */
  const resetRetries = useCallback(() => {
    clearTimers();
    setRetryCount(0);
    setIsRetrying(false);
    setRetryTimer(0);
    setLastRetryTime(null);
    setRetryHistory([]);
    setIsAutoRetryPaused(false);
    setHasReachedMaxRetries(false);
  }, [clearTimers]);

  /**
   * Pause/resume auto-retry
   */
  const toggleAutoRetry = useCallback(() => {
    setIsAutoRetryPaused(prev => !prev);
  }, []);

  /**
   * Get retry button text with countdown
   */
  const getRetryButtonText = useCallback(() => {
    if (hasReachedMaxRetries) {
      return 'Retries Exhausted';
    }
    
    if (isRetrying && retryTimer > 0) {
      return `Retrying in ${retryTimer}s...`;
    }
    
    if (isRetrying) {
      return 'Retrying...';
    }
    
    if (retryCount > 0) {
      return `Retry (${retryCount + 1}/${maxRetries})`;
    }
    
    return 'Try Again';
  }, [hasReachedMaxRetries, isRetrying, retryTimer, retryCount, maxRetries]);

  // Auto-retry effect
  useEffect(() => {
    if (autoRetry && 
        canRetry && 
        !isRetrying && 
        !isAutoRetryPaused && 
        retryCount === 0) {
      
      const delay = nextRetryDelay;
      startCountdown(delay);
      
      retryTimeoutRef.current = setTimeout(async () => {
        await executeRetry(true);
      }, delay);
    }
  }, [autoRetry, canRetry, isRetrying, isAutoRetryPaused, retryCount, nextRetryDelay, startCountdown, executeRetry]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // Network status effect for network errors
  useEffect(() => {
    if (isNetworkError({ type: errorType })) {
      const handleOnline = () => {
        if (isAutoRetryPaused) {
          setIsAutoRetryPaused(false);
        }
      };

      const handleOffline = () => {
        setIsAutoRetryPaused(true);
        cancelRetry();
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [errorType, isAutoRetryPaused, cancelRetry]);

  return {
    // State
    retryCount,
    isRetrying,
    retryTimer,
    lastRetryTime,
    retryHistory,
    isAutoRetryPaused,
    hasReachedMaxRetries,
    canRetry,
    
    // Computed values
    nextRetryDelay,
    retryStats,
    retryButtonText: getRetryButtonText(),
    
    // Methods
    retry,
    executeRetry,
    cancelRetry,
    resetRetries,
    toggleAutoRetry,
    shouldRetry,
    
    // Utility methods
    clearTimers,
    
    // Configuration
    errorConfig,
    maxRetries,
    initialRetryDelay,
    backoffMultiplier,
    maxRetryDelay
  };
};

export default useRetryLogic;