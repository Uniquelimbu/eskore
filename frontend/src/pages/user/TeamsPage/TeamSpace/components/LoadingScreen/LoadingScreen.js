/**
 * LoadingScreen Component
 * Advanced loading screen with multiple animation variants, progress tracking, and accessibility
 */

import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

// Import CSS files
import './LoadingScreen.css';
import './animations.css';
import './variants.css';
import './responsive.css';

/**
 * LoadingScreen component with comprehensive loading states and animations
 */
const LoadingScreen = memo(({
  message = "Loading...",
  size = 'default',
  showProgress = false,
  progress = 0,
  timeout = 0,
  onTimeout = null,
  animated = true,
  fullScreen = true,
  overlay = false,
  className = '',
  children = null,
  variant = 'spinner',
  details = null,
  cancelable = false,
  onCancel = null,
  showElapsedTime = false,
  customIcon = null,
  theme = 'auto'
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);

  // Timer for elapsed time
  useEffect(() => {
    if (!showElapsedTime && elapsedTime <= 5) return;

    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showElapsedTime, elapsedTime]);

  // Visibility animation
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [animated]);

  // Timeout handling
  useEffect(() => {
    if (timeout > 0) {
      const timer = setTimeout(() => {
        setIsTimedOut(true);
        if (onTimeout) onTimeout();
      }, timeout * 1000);

      return () => clearTimeout(timer);
    }
  }, [timeout, onTimeout]);

  /**
   * Format elapsed time for display
   */
  const formatElapsedTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  }, []);

  /**
   * Render loading animation based on variant
   */
  const renderLoadingAnimation = useCallback(() => {
    if (customIcon) {
      return <div className="loading-custom-icon">{customIcon}</div>;
    }

    switch (variant) {
      case 'dots':
        return (
          <div className="loading-dots">
            <div className="dot dot-1"></div>
            <div className="dot dot-2"></div>
            <div className="dot dot-3"></div>
          </div>
        );

      case 'pulse':
        return (
          <div className="loading-pulse">
            <div className="pulse-circle pulse-1"></div>
            <div className="pulse-circle pulse-2"></div>
            <div className="pulse-circle pulse-3"></div>
          </div>
        );

      case 'bars':
        return (
          <div className="loading-bars">
            <div className="bar bar-1"></div>
            <div className="bar bar-2"></div>
            <div className="bar bar-3"></div>
            <div className="bar bar-4"></div>
            <div className="bar bar-5"></div>
          </div>
        );

      case 'ripple':
        return (
          <div className="loading-ripple">
            <div className="ripple-circle ripple-1"></div>
            <div className="ripple-circle ripple-2"></div>
          </div>
        );

      case 'skeleton':
        return (
          <div className="loading-skeleton">
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line skeleton-text"></div>
            <div className="skeleton-line skeleton-text short"></div>
            <div className="skeleton-grid">
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </div>
          </div>
        );

      case 'spinner':
      default:
        return <div className="loading-spinner"></div>;
    }
  }, [variant, customIcon]);

  /**
   * Render progress bar
   */
  const renderProgress = useCallback(() => {
    if (!showProgress) return null;

    const progressPercentage = Math.min(Math.max(progress, 0), 100);

    return (
      <div className="loading-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {progressPercentage}% Complete
        </div>
      </div>
    );
  }, [showProgress, progress]);

  /**
   * Render timeout UI
   */
  const renderTimeoutUI = useCallback(() => (
    <div className="timeout-container">
      <div className="timeout-icon">⏰</div>
      <h3>Loading is taking longer than expected</h3>
      <p>This might be due to a slow connection or server issues.</p>
      <div className="timeout-actions">
        <button 
          className="btn btn-primary" 
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
        {onCancel && (
          <button 
            className="btn btn-secondary" 
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
      <div className="elapsed-time">
        Elapsed: {formatElapsedTime(elapsedTime)}
      </div>
    </div>
  ), [elapsedTime, formatElapsedTime, onCancel]);

  // Determine container classes
  const containerClasses = useMemo(() => [
    'loading-screen',
    `loading-${size}`,
    `loading-${variant}`,
    `loading-theme-${theme}`,
    fullScreen ? 'loading-fullscreen' : 'loading-inline',
    overlay ? 'loading-overlay' : '',
    animated ? 'loading-animated' : '',
    isVisible ? 'loading-visible' : '',
    isTimedOut ? 'loading-timeout' : '',
    className
  ].filter(Boolean).join(' '), [
    size, variant, theme, fullScreen, overlay, animated, isVisible, isTimedOut, className
  ]);

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className="loading-container">
        {isTimedOut ? renderTimeoutUI() : (
          <>
            {/* Loading Animation */}
            <div className="loading-animation" aria-hidden="true">
              {renderLoadingAnimation()}
            </div>

            {/* Loading Message */}
            <div className="loading-message">
              <h3>{message}</h3>
              {details && <p className="loading-details">{details}</p>}
            </div>

            {/* Progress Bar */}
            {renderProgress()}

            {/* Elapsed Time */}
            {(showElapsedTime || elapsedTime > 5) && (
              <div className="elapsed-time">
                {formatElapsedTime(elapsedTime)}
              </div>
            )}

            {/* Cancel Button */}
            {cancelable && onCancel && (
              <button 
                className="btn btn-ghost loading-cancel" 
                onClick={onCancel}
                aria-label="Cancel loading"
              >
                Cancel
              </button>
            )}

            {/* Custom Children */}
            {children}
          </>
        )}
      </div>

      {/* Screen Reader Content */}
      <div className="sr-only">
        Loading content. {details ? details : message}
        {showProgress && ` Progress: ${progress}%`}
        {elapsedTime > 0 && ` Elapsed time: ${formatElapsedTime(elapsedTime)}`}
      </div>
    </div>
  );
});

// Display name for debugging
LoadingScreen.displayName = 'LoadingScreen';

// PropTypes validation
LoadingScreen.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['small', 'default', 'large']),
  showProgress: PropTypes.bool,
  progress: PropTypes.number,
  timeout: PropTypes.number,
  onTimeout: PropTypes.func,
  animated: PropTypes.bool,
  fullScreen: PropTypes.bool,
  overlay: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
  variant: PropTypes.oneOf(['spinner', 'dots', 'pulse', 'skeleton', 'bars', 'ripple']),
  details: PropTypes.string,
  cancelable: PropTypes.bool,
  onCancel: PropTypes.func,
  showElapsedTime: PropTypes.bool,
  customIcon: PropTypes.node,
  theme: PropTypes.oneOf(['dark', 'light', 'auto'])
};

export default LoadingScreen;

// Enhanced convenience exports for different loading states
export const TeamSpaceLoading = (props) => (
  <LoadingScreen 
    message="Loading TeamSpace..."
    variant="spinner"
    {...props}
  />
);

export const TeamDataLoading = (props) => (
  <LoadingScreen 
    message="Loading team data..."
    variant="pulse"
    showProgress
    {...props}
  />
);

export const FormationLoading = (props) => (
  <LoadingScreen 
    message="Loading formation..."
    variant="dots"
    size="small"
    fullScreen={false}
    {...props}
  />
);

export const SkeletonLoading = (props) => (
  <LoadingScreen 
    message="Preparing content..."
    variant="skeleton"
    fullScreen={false}
    animated
    {...props}
  />
);

export const UploadLoading = (props) => (
  <LoadingScreen 
    message="Uploading..."
    variant="bars"
    showProgress
    size="small"
    {...props}
  />
);

export const SyncLoading = (props) => (
  <LoadingScreen 
    message="Syncing data..."
    variant="ripple"
    showElapsedTime
    {...props}
  />
);

// Loading screen with custom icon
export const CustomIconLoading = ({ icon, message, ...props }) => (
  <LoadingScreen 
    message={message}
    customIcon={icon}
    variant="spinner"
    {...props}
  />
);

// Hook for loading state management
export const useLoadingScreen = (initialLoading = false) => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [progress, setProgress] = useState(0);

  const startLoading = useCallback((message = 'Loading...') => {
    setLoadingMessage(message);
    setProgress(0);
    setIsLoading(true);
  }, []);

  const updateProgress = useCallback((newProgress) => {
    setProgress(Math.min(Math.max(newProgress, 0), 100));
  }, []);

  const updateMessage = useCallback((message) => {
    setLoadingMessage(message);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setProgress(0);
  }, []);

  return {
    isLoading,
    loadingMessage,
    progress,
    startLoading,
    updateProgress,
    updateMessage,
    stopLoading
  };
};