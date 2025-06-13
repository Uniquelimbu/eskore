import React, { memo, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Industry-standard Error Screen for TeamSpace
 * Features: Multiple error types, retry logic, analytics, accessibility
 */
const ErrorScreen = memo(({
  error,
  errorType = 'generic',
  onRetry = null,
  onGoBack = null,
  showDetails = process.env.NODE_ENV === 'development',
  retryCount = 0,
  maxRetries = 3,
  retryDelay = 1000,
  autoRetry = false,
  fullScreen = true,
  className = "",
  title = null,
  description = null,
  actions = null,
  trackError = true,
  errorId = null
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryTimer, setRetryTimer] = useState(0);
  const [hasAutoRetried, setHasAutoRetried] = useState(false);

  // Error type configurations
  const errorConfigs = {
    network: {
      icon: '🌐',
      title: 'Network Connection Error',
      description: 'Unable to connect to our servers. Please check your internet connection.',
      retryable: true,
      autoRetry: true
    },
    permission: {
      icon: '🔒',
      title: 'Access Denied',
      description: 'You don\'t have permission to access this team or resource.',
      retryable: false,
      autoRetry: false
    },
    notFound: {
      icon: '🔍',
      title: 'Team Not Found',
      description: 'The team you\'re looking for doesn\'t exist or has been removed.',
      retryable: false,
      autoRetry: false
    },
    server: {
      icon: '⚠️',
      title: 'Server Error',
      description: 'Our servers are experiencing issues. Please try again in a moment.',
      retryable: true,
      autoRetry: true
    },
    timeout: {
      icon: '⏱️',
      title: 'Request Timeout',
      description: 'The request took too long to complete. Please try again.',
      retryable: true,
      autoRetry: false
    },
    validation: {
      icon: '📝',
      title: 'Validation Error',
      description: 'There was an issue with the provided data. Please check and try again.',
      retryable: false,
      autoRetry: false
    },
    generic: {
      icon: '❗',
      title: 'Something went wrong',
      description: 'We encountered an unexpected error. Please try again.',
      retryable: true,
      autoRetry: false
    }
  };

  // Get current error configuration
  const config = errorConfigs[errorType] || errorConfigs.generic;
  
  // ✅ FIXED: Define canRetry variable
  const canRetry = config.retryable && onRetry && retryCount < maxRetries;

  // Auto-retry logic
  useEffect(() => {
    if (autoRetry && config.autoRetry && !hasAutoRetried && canRetry) {
      const timer = setTimeout(() => {
        setHasAutoRetried(true);
        handleRetry();
      }, retryDelay);

      return () => clearTimeout(timer);
    }
  }, [autoRetry, config.autoRetry, hasAutoRetried, canRetry, retryDelay]);

  // Track error for analytics
  useEffect(() => {
    if (trackError && window.gtag) {
      window.gtag('event', 'error_screen_view', {
        error_type: errorType,
        error_message: error?.message || 'Unknown error',
        retry_count: retryCount,
        error_id: errorId,
        can_retry: canRetry
      });
    }
  }, [trackError, errorType, error, retryCount, errorId, canRetry]);

  /**
   * Handle retry with loading state and timer
   */
  const handleRetry = useCallback(async () => {
    if (!canRetry || isRetrying) return;

    setIsRetrying(true);
    
    // Track retry attempt
    if (trackError && window.gtag) {
      window.gtag('event', 'error_retry_attempt', {
        error_type: errorType,
        retry_count: retryCount + 1,
        error_id: errorId
      });
    }

    try {
      if (retryDelay > 0) {
        // Show countdown timer
        for (let i = Math.ceil(retryDelay / 1000); i > 0; i--) {
          setRetryTimer(i);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        setRetryTimer(0);
      }

      await onRetry();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  }, [canRetry, isRetrying, onRetry, retryDelay, trackError, errorType, retryCount, errorId]);

  /**
   * Handle go back action
   */
  const handleGoBack = useCallback(() => {
    if (trackError && window.gtag) {
      window.gtag('event', 'error_go_back', {
        error_type: errorType,
        error_id: errorId
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
  }, [onGoBack, trackError, errorType, errorId]);

  /**
   * Get retry button text with timer
   */
  const getRetryButtonText = () => {
    if (isRetrying && retryTimer > 0) {
      return `Retrying in ${retryTimer}s...`;
    }
    if (isRetrying) {
      return 'Retrying...';
    }
    return retryCount > 0 ? `Retry (${retryCount + 1}/${maxRetries})` : 'Try Again';
  };

  /**
   * Render error icon with animation
   */
  const renderErrorIcon = () => (
    <div className="error-icon-container">
      <div className="error-icon-wrapper">
        <span className="error-icon" role="img" aria-label={`${errorType} error`}>
          {config.icon}
        </span>
        <div className="error-icon-pulse"></div>
      </div>
    </div>
  );

  /**
   * Render action buttons
   */
  const renderActions = () => {
    if (actions) {
      return <div className="error-actions">{actions}</div>;
    }

    return (
      <div className="error-actions">
        {canRetry && (
          <button 
            onClick={handleRetry} 
            disabled={isRetrying}
            className={`btn btn-primary error-retry-btn ${isRetrying ? 'loading' : ''}`}
            aria-describedby="retry-description"
          >
            {getRetryButtonText()}
          </button>
        )}
        
        <button 
          onClick={handleGoBack} 
          className="btn btn-secondary error-back-btn"
        >
          Go Back
        </button>
        
        {showDetails && error && (
          <button 
            onClick={() => {
              const details = document.querySelector('.error-details');
              details.style.display = details.style.display === 'none' ? 'block' : 'none';
            }}
            className="btn btn-ghost error-details-btn"
          >
            Show Details
          </button>
        )}
      </div>
    );
  };

  // Container classes
  const containerClasses = [
    'error-screen',
    `error-${errorType}`,
    fullScreen ? 'error-fullscreen' : 'error-inline',
    isRetrying ? 'error-retrying' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} role="alert" aria-live="assertive">
      <div className="error-screen-container">
        {/* Error Icon */}
        {renderErrorIcon()}

        {/* Error Content */}
        <div className="error-content">
          <h2 className="error-title">
            {title || config.title}
          </h2>
          
          <p className="error-description">
            {description || config.description}
          </p>
          
          {error && typeof error === 'string' && error !== (description || config.description) && (
            <p className="error-message">
              {error}
            </p>
          )}

          {/* Error ID for support */}
          {errorId && (
            <div className="error-id">
              <small>Error ID: <code>{errorId}</code></small>
            </div>
          )}

          {/* Retry information */}
          {retryCount > 0 && (
            <div className="retry-info">
              <small>
                {retryCount >= maxRetries 
                  ? `Maximum retry attempts reached (${maxRetries})`
                  : `Attempt ${retryCount} of ${maxRetries}`
                }
              </small>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {renderActions()}

        {/* Error Details (Development) */}
        {showDetails && error && (
          <details className="error-details" style={{ display: 'none' }}>
            <summary>Technical Details</summary>
            <pre className="error-stack">
              {typeof error === 'object' ? JSON.stringify(error, null, 2) : error}
            </pre>
          </details>
        )}

        {/* Accessibility descriptions */}
        <div id="retry-description" className="sr-only">
          {canRetry && onRetry && retryCount < maxRetries
            ? `You can try again. This is attempt ${retryCount + 1} of ${maxRetries}.`
            : 'Retry option is not available for this error.'
          }
        </div>
      </div>

      {/* Error Screen Styles */}
      <style jsx>{`
        .error-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-dark, #1a202c);
          color: var(--text-light, #e2e8f0);
          text-align: center;
          position: relative;
        }

        .error-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
        }

        .error-inline {
          min-height: 400px;
          width: 100%;
          border-radius: 12px;
          border: 1px solid var(--border-color, #2d3748);
        }

        .error-screen-container {
          max-width: 500px;
          padding: 40px 20px;
          animation: fadeInUp 0.5s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Error Icon */
        .error-icon-container {
          margin-bottom: 24px;
          position: relative;
        }

        .error-icon-wrapper {
          position: relative;
          display: inline-block;
        }

        .error-icon {
          font-size: 4rem;
          display: block;
          filter: grayscale(0.3);
        }

        .error-icon-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(229, 62, 62, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        /* Error Content */
        .error-content {
          margin-bottom: 32px;
        }

        .error-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 16px;
          color: var(--text-light, #e2e8f0);
        }

        .error-description {
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 16px;
          color: var(--text-muted, #a0aec0);
        }

        .error-message {
          font-size: 0.9rem;
          color: var(--danger-color, #e53e3e);
          background-color: rgba(229, 62, 62, 0.1);
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 16px;
          border: 1px solid rgba(229, 62, 62, 0.2);
        }

        .error-id {
          background-color: var(--secondary-color, #232b3a);
          border: 1px solid var(--border-color, #2d3748);
          border-radius: 6px;
          padding: 8px 12px;
          margin: 12px 0;
          font-size: 0.8rem;
        }

        .error-id code {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          color: var(--primary-color, #4a6cf7);
          font-weight: 600;
        }

        .retry-info {
          margin-top: 8px;
          color: var(--text-muted, #a0aec0);
          font-size: 0.85rem;
        }

        /* Action Buttons */
        .error-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .error-retry-btn {
          min-width: 120px;
          position: relative;
        }

        .error-retry-btn.loading {
          color: transparent;
        }

        .error-retry-btn.loading::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          transform: translate(-50%, -50%);
        }

        @keyframes spin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .error-back-btn,
        .error-details-btn {
          min-width: 100px;
        }

        /* Error Details */
        .error-details {
          margin-top: 20px;
          text-align: left;
          background-color: var(--secondary-color, #232b3a);
          border: 1px solid var(--border-color, #2d3748);
          border-radius: 8px;
          padding: 16px;
        }

        .error-details summary {
          cursor: pointer;
          font-weight: 600;
          color: var(--text-light, #e2e8f0);
          margin-bottom: 12px;
        }

        .error-details summary:hover {
          color: var(--primary-color, #4a6cf7);
        }

        .error-stack {
          background-color: #1a1a1a;
          border: 1px solid #333;
          border-radius: 4px;
          padding: 12px;
          overflow-x: auto;
          font-size: 0.8rem;
          line-height: 1.4;
          color: #f8f8f2;
          margin: 0;
          white-space: pre-wrap;
          word-break: break-all;
        }

        /* Error Type Specific Styles */
        .error-network .error-icon {
          color: #4299e1;
        }

        .error-permission .error-icon {
          color: #ed8936;
        }

        .error-notFound .error-icon {
          color: #a0aec0;
        }

        .error-server .error-icon {
          color: #e53e3e;
        }

        .error-timeout .error-icon {
          color: #d69e2e;
        }

        .error-validation .error-icon {
          color: #9f7aea;
        }

        /* Retrying State */
        .error-retrying .error-icon-wrapper {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
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
          .error-screen-container {
            padding: 20px 15px;
          }

          .error-title {
            font-size: 1.3rem;
          }

          .error-description {
            font-size: 0.9rem;
          }

          .error-actions {
            flex-direction: column;
            align-items: center;
          }

          .error-actions .btn {
            width: 100%;
            max-width: 250px;
          }

          .error-icon {
            font-size: 3rem;
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .error-screen {
            background-color: #000;
            color: #fff;
          }

          .error-details {
            background-color: #222;
            border-color: #666;
          }

          .error-stack {
            background-color: #111;
            border-color: #555;
            color: #fff;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .error-screen-container,
          .error-icon-pulse,
          .error-retrying .error-icon-wrapper,
          .error-retry-btn.loading::after {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
});

// Display name for debugging
ErrorScreen.displayName = 'ErrorScreen';

// PropTypes
ErrorScreen.propTypes = {
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  errorType: PropTypes.oneOf([
    'network', 'permission', 'notFound', 'server', 
    'timeout', 'validation', 'generic'
  ]),
  onRetry: PropTypes.func,
  onGoBack: PropTypes.func,
  showDetails: PropTypes.bool,
  retryCount: PropTypes.number,
  maxRetries: PropTypes.number,
  retryDelay: PropTypes.number,
  autoRetry: PropTypes.bool,
  fullScreen: PropTypes.bool,
  className: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  actions: PropTypes.node,
  trackError: PropTypes.bool,
  errorId: PropTypes.string
};

export default ErrorScreen;

// Convenience components for specific error types
export const NetworkErrorScreen = (props) => (
  <ErrorScreen errorType="network" autoRetry {...props} />
);

export const PermissionErrorScreen = (props) => (
  <ErrorScreen errorType="permission" {...props} />
);

export const NotFoundErrorScreen = (props) => (
  <ErrorScreen errorType="notFound" {...props} />
);

export const ServerErrorScreen = (props) => (
  <ErrorScreen errorType="server" autoRetry {...props} />
);

export const TimeoutErrorScreen = (props) => (
  <ErrorScreen errorType="timeout" {...props} />
);

export const ValidationErrorScreen = (props) => (
  <ErrorScreen errorType="validation" {...props} />
);