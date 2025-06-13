/**
 * ErrorScreen Component
 * Comprehensive error display with retry functionality, analytics tracking, and accessibility
 */

import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  ERROR_TYPES, 
  DEFAULT_ERROR_CONFIG, 
  RETRY_CONFIGS,
  SCREEN_SIZES,
  THEME_CONFIG,
  COMPONENT_DEFAULTS,
  DEFAULT_ERROR_MESSAGES,
  ANALYTICS_EVENTS
} from './constants';
import { formatErrorMessage, generateErrorId, extractErrorType } from './utils/errorHelpers';
import ErrorIcon from './components/ErrorIcon';
import ErrorContent from './components/ErrorContent';
import ErrorActions from './components/ErrorActions';

/**
 * Main ErrorScreen component with comprehensive error handling
 */
const ErrorScreen = memo(({
  // Error data
  error = null,
  errorType = null,
  errorId = null,
  title = null,
  description = null,
  
  // Functionality
  onRetry = null,
  onGoBack = null,
  onReport = null,
  showDetails = COMPONENT_DEFAULTS.ERROR_SCREEN.showDetails,
  
  // Retry configuration
  maxRetries = COMPONENT_DEFAULTS.ERROR_SCREEN.maxRetries,
  retryDelay = COMPONENT_DEFAULTS.ERROR_SCREEN.retryDelay,
  autoRetry = COMPONENT_DEFAULTS.ERROR_SCREEN.autoRetry,
  
  // Display configuration
  size = COMPONENT_DEFAULTS.ERROR_SCREEN.size,
  theme = COMPONENT_DEFAULTS.ERROR_SCREEN.theme,
  fullScreen = COMPONENT_DEFAULTS.ERROR_SCREEN.fullScreen,
  className = '',
  actions = null,
  
  // Tracking and analytics
  trackError = COMPONENT_DEFAULTS.ERROR_SCREEN.trackError,
  userId = null,
  teamId = null,
  metadata = {}
}) => {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  const [currentRetryCount, setCurrentRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryTimer, setRetryTimer] = useState(0);
  const [autoRetryPaused, setAutoRetryPaused] = useState(false);
  const [showDetailsExpanded, setShowDetailsExpanded] = useState(false);
  const [errorOccurredAt] = useState(Date.now());
  
  // ========================================================================
  // REFS AND CONSTANTS
  // ========================================================================
  
  const mountedRef = useRef(true);
  const autoRetryTimeoutRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  
  // Generate error ID if not provided
  const currentErrorId = errorId || generateErrorId();
  
  // Detect error type if not provided
  const detectedErrorType = errorType || extractErrorType(error) || ERROR_TYPES.GENERIC;
  
  // Get error configuration
  const errorConfig = {
    ...DEFAULT_ERROR_CONFIG,
    ...DEFAULT_ERROR_MESSAGES[detectedErrorType],
    ...RETRY_CONFIGS[detectedErrorType]
  };
  
  // Get retry configuration
  const retryConfig = {
    maxRetries,
    retryDelay,
    autoRetry,
    ...RETRY_CONFIGS[detectedErrorType]
  };
  
  // Format error message
  const errorMessage = formatErrorMessage(error);
  
  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================
  
  /**
   * Check if retry is available
   */
  const canRetry = useCallback(() => {
    return onRetry && 
           currentRetryCount < maxRetries && 
           retryTimer === 0 && 
           !isRetrying;
  }, [onRetry, currentRetryCount, maxRetries, retryTimer, isRetrying]);
  
  /**
   * Get retry button text based on state
   */
  const getRetryButtonText = useCallback(() => {
    if (retryTimer > 0) return `Retry in ${retryTimer}s`;
    if (isRetrying) return 'Retrying...';
    if (currentRetryCount >= maxRetries) return 'Max Retries Reached';
    if (currentRetryCount > 0) return `Retry (${currentRetryCount + 1}/${maxRetries})`;
    return 'Try Again';
  }, [isRetrying, retryTimer, currentRetryCount, maxRetries]);
  
  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================
  
  /**
   * Handle retry action
   */
  const handleRetry = useCallback(async () => {
    if (!canRetry() || !onRetry) return;
    
    setIsRetrying(true);
    const retryStartTime = Date.now();
    
    // Track retry attempt
    if (trackError && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', ANALYTICS_EVENTS.ERROR_RETRY, {
        event_category: 'error_handling',
        event_label: detectedErrorType,
        custom_map: {
          error_id: currentErrorId,
          retry_count: currentRetryCount + 1,
          user_id: userId,
          team_id: teamId
        }
      });
    }
    
    try {
      await onRetry();
      
      // Track successful retry
      if (trackError && typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', ANALYTICS_EVENTS.ERROR_RETRY_SUCCESS, {
          event_category: 'error_handling',
          event_label: detectedErrorType,
          custom_map: {
            error_id: currentErrorId,
            retry_count: currentRetryCount + 1,
            retry_duration: Date.now() - retryStartTime
          }
        });
      }
      
      // Reset retry count on success
      setCurrentRetryCount(0);
      
    } catch (retryError) {
      // Track failed retry
      if (trackError && typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', ANALYTICS_EVENTS.ERROR_RETRY_FAILED, {
          event_category: 'error_handling',
          event_label: detectedErrorType,
          custom_map: {
            error_id: currentErrorId,
            retry_count: currentRetryCount + 1,
            retry_error: formatErrorMessage(retryError)
          }
        });
      }
      
      // Increment retry count
      setCurrentRetryCount(prev => prev + 1);
      
      console.error('Retry failed:', retryError);
    } finally {
      if (mountedRef.current) {
        setIsRetrying(false);
      }
    }
  }, [canRetry, onRetry, trackError, detectedErrorType, currentErrorId, currentRetryCount, userId, teamId]);
  
  /**
   * Handle go back action
   */
  const handleGoBack = useCallback(() => {
    // Track go back action
    if (trackError && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', ANALYTICS_EVENTS.ERROR_GO_BACK, {
        event_category: 'error_handling',
        event_label: detectedErrorType,
        custom_map: {
          error_id: currentErrorId
        }
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
  }, [onGoBack, detectedErrorType, trackError, currentErrorId]);

  /**
   * Handle error reporting
   */
  const handleReport = useCallback(() => {
    // Track report action
    if (trackError && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', ANALYTICS_EVENTS.ERROR_REPORTED, {
        event_category: 'error_handling',
        event_label: detectedErrorType,
        custom_map: {
          error_id: currentErrorId
        }
      });
    }

    if (onReport) {
      onReport();
    } else {
      // Default report behavior
      console.log('Error reported:', {
        errorId: currentErrorId,
        errorType: detectedErrorType,
        error: errorMessage,
        userId,
        teamId,
        metadata
      });
    }
  }, [onReport, currentErrorId, detectedErrorType, errorMessage, userId, teamId, metadata, trackError]);

  /**
   * Toggle details visibility
   */
  const handleToggleDetails = useCallback(() => {
    const newShowDetails = !showDetailsExpanded;
    setShowDetailsExpanded(newShowDetails);
    
    // Track details toggle
    if (trackError && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', newShowDetails ? ANALYTICS_EVENTS.ERROR_DETAILS_SHOWN : ANALYTICS_EVENTS.ERROR_DETAILS_HIDDEN, {
        event_category: 'error_handling',
        event_label: detectedErrorType,
        custom_map: {
          error_id: currentErrorId
        }
      });
    }
  }, [showDetailsExpanded, detectedErrorType, trackError, currentErrorId]);

  /**
   * Pause/resume auto-retry
   */
  const toggleAutoRetry = useCallback(() => {
    setAutoRetryPaused(prev => !prev);
    
    if (autoRetryTimeoutRef.current) {
      clearTimeout(autoRetryTimeoutRef.current);
      autoRetryTimeoutRef.current = null;
      setRetryTimer(0);
    }
  }, []);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  // Track error display on mount
  useEffect(() => {
    if (trackError && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', ANALYTICS_EVENTS.ERROR_DISPLAYED, {
        event_category: 'error_handling',
        event_label: detectedErrorType,
        custom_map: {
          error_id: currentErrorId,
          error_message: errorMessage,
          user_id: userId,
          team_id: teamId,
          metadata: JSON.stringify(metadata)
        }
      });
    }
  }, [trackError, detectedErrorType, currentErrorId, errorMessage, userId, teamId, metadata]);

  // Schedule initial auto-retry if enabled
  useEffect(() => {
    if (!autoRetry || 
        !retryConfig.autoRetry || 
        currentRetryCount >= maxRetries || 
        autoRetryPaused || 
        !onRetry) {
      return;
    }

    const delay = Math.min(
      retryConfig.retryDelay * Math.pow(retryConfig.backoffMultiplier || 1.5, currentRetryCount),
      retryConfig.maxRetryDelay || 30000
    );

    setRetryTimer(Math.ceil(delay / 1000));

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setRetryTimer(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-retry timeout
    autoRetryTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current && !autoRetryPaused) {
        handleRetry();
      }
      clearInterval(countdownInterval);
    }, delay);

    return () => {
      clearInterval(countdownInterval);
      if (autoRetryTimeoutRef.current) {
        clearTimeout(autoRetryTimeoutRef.current);
        autoRetryTimeoutRef.current = null;
      }
    };
  }, [autoRetry, autoRetryPaused, currentRetryCount, maxRetries, retryConfig, handleRetry, onRetry]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (autoRetryTimeoutRef.current) {
        clearTimeout(autoRetryTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // ========================================================================
  // RENDER
  // ========================================================================

  // Container classes
  const containerClasses = [
    'error-screen',
    `error-screen-${detectedErrorType}`,
    `error-screen-${size}`,
    `error-screen-theme-${theme}`,
    fullScreen ? 'error-screen-fullscreen' : 'error-screen-inline',
    isRetrying ? 'error-screen-retrying' : '',
    autoRetryPaused ? 'error-screen-auto-retry-paused' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={containerClasses} 
      role="alert" 
      aria-live="assertive"
      aria-labelledby="error-title"
      aria-describedby="error-description"
    >
      <div className="error-screen-container">
        {/* Error Icon */}
        <ErrorIcon 
          errorType={detectedErrorType}
          size={size === SCREEN_SIZES.SMALL ? 'medium' : size === SCREEN_SIZES.LARGE ? 'xlarge' : 'large'}
          animated={!isRetrying}
          showPulse={isRetrying}
        />

        {/* Error Content */}
        <ErrorContent
          title={title || errorConfig.title}
          description={description || errorConfig.description}
          error={error}
          errorId={currentErrorId}
          errorType={detectedErrorType}
          showErrorId={true}
          showRetryInfo={currentRetryCount > 0}
          showDetails={showDetails}
          retryCount={currentRetryCount}
          maxRetries={maxRetries}
          onToggleDetails={handleToggleDetails}
          titleId="error-title"
          descriptionId="error-description"
        />

        {/* Custom Actions or Default Actions */}
        {actions || (
          <ErrorActions
            onRetry={canRetry() ? handleRetry : null}
            onGoBack={handleGoBack}
            onHelp={() => window.open(errorConfig.helpLink || '/help', '_blank')}
            onReport={handleReport}
            canRetry={canRetry()}
            isRetrying={isRetrying}
            retryCount={currentRetryCount}
            maxRetries={maxRetries}
            retryButtonText={getRetryButtonText()}
            showGoBack={true}
            showHelp={true}
            showReport={true}
            errorType={detectedErrorType}
            actionAlignment="center"
            actionSize={size === SCREEN_SIZES.SMALL ? 'small' : size === SCREEN_SIZES.LARGE ? 'large' : 'medium'}
          />
        )}

        {/* Auto-retry controls */}
        {autoRetry && retryConfig.autoRetry && currentRetryCount < maxRetries && (
          <div className="error-auto-retry-controls">
            <button
              type="button"
              onClick={toggleAutoRetry}
              className="btn btn-ghost btn-small"
              aria-describedby="auto-retry-description"
            >
              {autoRetryPaused ? '▶' : '⏸'} {autoRetryPaused ? 'Resume' : 'Pause'} Auto-retry
            </button>
            
            <div id="auto-retry-description" className="sr-only">
              {autoRetryPaused ? 'Resume automatic retry attempts' : 'Pause automatic retry attempts'}
            </div>
            
            {retryTimer > 0 && !autoRetryPaused && (
              <div className="auto-retry-countdown">
                Next retry in {retryTimer} seconds
              </div>
            )}
          </div>
        )}

        {/* Accessibility descriptions */}
        <div className="sr-only">
          <div id="error-context-description">
            Error occurred at {new Date(errorOccurredAt).toLocaleString()}.
            {currentRetryCount > 0 && ` ${currentRetryCount} retry attempts have been made.`}
            {canRetry() && ` You can try again up to ${maxRetries - currentRetryCount} more times.`}
          </div>
        </div>
      </div>

      {/* Error Screen Styles */}
      <style jsx>{`
        .error-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--error-bg, #1a202c);
          color: var(--error-text, #e2e8f0);
          text-align: center;
          position: relative;
          min-height: 400px;
          padding: 40px 20px;
        }

        .error-screen-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          min-height: 100vh;
        }

        .error-screen-inline {
          border-radius: 12px;
          border: 1px solid var(--error-border, #2d3748);
          margin: 20px 0;
        }

        .error-screen-container {
          max-width: 600px;
          width: 100%;
          margin: 0 auto;
          padding: 20px;
          animation: errorFadeIn 0.5s ease-out;
        }

        @keyframes errorFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Size Variants */
        .error-screen-small .error-screen-container {
          max-width: 400px;
          padding: 20px 15px;
        }

        .error-screen-large .error-screen-container {
          max-width: 700px;
          padding: 60px 40px;
        }

        /* Theme Variants */
        .error-screen-theme-light {
          background-color: var(--error-bg, #ffffff);
          color: var(--error-text, #2d3748);
          border-color: var(--error-border, #e2e8f0);
        }

        .error-screen-theme-dark {
          background-color: var(--error-bg, #1a202c);
          color: var(--error-text, #e2e8f0);
          border-color: var(--error-border, #2d3748);
        }

        /* Error Type Specific Styles */
        .error-screen-network {
          border-left: 4px solid #4299e1;
        }

        .error-screen-permission {
          border-left: 4px solid #ed8936;
        }

        .error-screen-notFound {
          border-left: 4px solid #a0aec0;
        }

        .error-screen-server {
          border-left: 4px solid #e53e3e;
        }

        .error-screen-timeout {
          border-left: 4px solid #d69e2e;
        }

        .error-screen-validation {
          border-left: 4px solid #9f7aea;
        }

        /* Auto-retry Controls */
        .error-auto-retry-controls {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid var(--error-border, #2d3748);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .auto-retry-countdown {
          font-size: 0.8rem;
          color: var(--error-text-muted, #a0aec0);
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Button Styles */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          cursor: pointer;
          background: none;
        }

        .btn-ghost {
          color: var(--error-text-muted, #a0aec0);
          border-color: var(--error-border, #2d3748);
        }

        .btn-ghost:hover {
          background-color: var(--error-card-bg, #232b3a);
          color: var(--error-text, #e2e8f0);
        }

        .btn-small {
          padding: 6px 12px;
          font-size: 0.75rem;
        }

        /* Accessibility */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .error-screen {
            padding: 20px 15px;
            min-height: 300px;
          }

          .error-screen-container {
            max-width: 100%;
          }

          .error-auto-retry-controls {
            margin-top: 16px;
            padding-top: 12px;
          }
        }

        @media (max-width: 480px) {
          .error-screen {
            padding: 15px 10px;
          }

          .error-screen-small .error-screen-container {
            padding: 15px 10px;
          }

          .error-screen-large .error-screen-container {
            padding: 30px 20px;
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .error-screen {
            border-width: 2px;
          }

          .error-auto-retry-controls {
            border-top-width: 2px;
          }

          .btn-ghost {
            border-width: 2px;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .error-screen-container {
            animation: none;
          }

          .auto-retry-countdown {
            animation: none;
          }

          .btn {
            transition: none;
          }
        }

        /* Print Styles */
        @media print {
          .error-screen {
            background-color: white;
            color: black;
            border: 1px solid black;
          }

          .error-auto-retry-controls {
            display: none;
          }
        }
      `}</style>
    </div>
  );
});

// Display name for debugging
ErrorScreen.displayName = 'ErrorScreen';

// PropTypes validation
ErrorScreen.propTypes = {
  // Error data
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  errorType: PropTypes.oneOf(Object.values(ERROR_TYPES)),
  errorId: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  
  // Functionality
  onRetry: PropTypes.func,
  onGoBack: PropTypes.func,
  onReport: PropTypes.func,
  showDetails: PropTypes.bool,
  
  // Retry configuration
  maxRetries: PropTypes.number,
  retryDelay: PropTypes.number,
  autoRetry: PropTypes.bool,
  
  // Display configuration
  size: PropTypes.oneOf(Object.values(SCREEN_SIZES)),
  theme: PropTypes.oneOf(Object.values(THEME_CONFIG)),
  fullScreen: PropTypes.bool,
  className: PropTypes.string,
  actions: PropTypes.node,
  
  // Tracking and analytics
  trackError: PropTypes.bool,
  userId: PropTypes.string,
  teamId: PropTypes.string,
  metadata: PropTypes.object
};

// ============================================================================
// SPECIALIZED ERROR SCREEN COMPONENTS
// ============================================================================

/**
 * Network Error Screen - Pre-configured for network issues
 */
export const NetworkErrorScreen = memo((props) => (
  <ErrorScreen 
    errorType={ERROR_TYPES.NETWORK}
    autoRetry={true}
    maxRetries={5}
    retryDelay={2000}
    {...props} 
  />
));

/**
 * Permission Error Screen - Pre-configured for access issues
 */
export const PermissionErrorScreen = memo((props) => (
  <ErrorScreen 
    errorType={ERROR_TYPES.PERMISSION}
    onRetry={null}
    {...props} 
  />
));

/**
 * Not Found Error Screen - Pre-configured for 404 errors
 */
export const NotFoundErrorScreen = memo((props) => (
  <ErrorScreen 
    errorType={ERROR_TYPES.NOT_FOUND}
    onRetry={null}
    {...props} 
  />
));

/**
 * Server Error Screen - Pre-configured for server issues
 */
export const ServerErrorScreen = memo((props) => (
  <ErrorScreen 
    errorType={ERROR_TYPES.SERVER}
    autoRetry={true}
    maxRetries={3}
    retryDelay={3000}
    {...props} 
  />
));

/**
 * Timeout Error Screen - Pre-configured for timeout issues
 */
export const TimeoutErrorScreen = memo((props) => (
  <ErrorScreen 
    errorType={ERROR_TYPES.TIMEOUT}
    autoRetry={false}
    maxRetries={3}
    retryDelay={1000}
    {...props} 
  />
));

/**
 * Validation Error Screen - Pre-configured for validation issues
 */
export const ValidationErrorScreen = memo((props) => (
  <ErrorScreen 
    errorType={ERROR_TYPES.VALIDATION}
    autoRetry={false}
    maxRetries={2}
    retryDelay={500}
    {...props} 
  />
));

// Add display names for all specialized components
NetworkErrorScreen.displayName = 'NetworkErrorScreen';
PermissionErrorScreen.displayName = 'PermissionErrorScreen';
NotFoundErrorScreen.displayName = 'NotFoundErrorScreen';
ServerErrorScreen.displayName = 'ServerErrorScreen';
TimeoutErrorScreen.displayName = 'TimeoutErrorScreen';
ValidationErrorScreen.displayName = 'ValidationErrorScreen';

export default ErrorScreen;