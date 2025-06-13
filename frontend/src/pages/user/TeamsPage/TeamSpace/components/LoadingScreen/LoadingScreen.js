import React, { memo, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Industry-standard Loading Screen for TeamSpace
 * Features: Multiple loading states, progress tracking, timeout handling, accessibility
 */
const LoadingScreen = memo(({
  message = "Loading team data...",
  size = "default",
  showProgress = false,
  progress = 0,
  timeout = 30000, // 30 seconds
  onTimeout = null,
  animated = true,
  fullScreen = true,
  overlay = false,
  className = "",
  children = null,
  variant = "spinner", // spinner, dots, pulse, skeleton, bars, ripple
  details = null,
  cancelable = false,
  onCancel = null,
  showElapsedTime = false,
  customIcon = null,
  theme = "dark" // dark, light, auto
}) => {
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Show loading with animation
  useEffect(() => {
    if (animated) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(true);
    }
  }, [animated]);

  // Handle timeout
  useEffect(() => {
    if (!timeout) return;

    const timer = setTimeout(() => {
      setIsTimedOut(true);
      if (onTimeout) {
        onTimeout();
      }
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Render loading animation based on variant
   */
  const renderLoadingAnimation = () => {
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
  };

  /**
   * Format elapsed time for display
   */
  const formatElapsedTime = useCallback((seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }, []);

  /**
   * Render progress bar if enabled
   */
  const renderProgress = () => {
    if (!showProgress) return null;

    return (
      <div className="loading-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {progress > 0 ? `${Math.round(progress)}%` : 'Initializing...'}
        </div>
      </div>
    );
  };

  /**
   * Render timeout UI
   */
  const renderTimeoutUI = () => (
    <div className="timeout-container">
      <div className="timeout-icon">⚠️</div>
      <h3>Loading is taking longer than expected</h3>
      <p>This might be due to network issues or server load.</p>
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
  );

  // Determine container classes
  const containerClasses = [
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
  ].filter(Boolean).join(' ');

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

      {/* Enhanced Loading Screen Styles */}
      <style jsx>{`
        .loading-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .loading-animated.loading-visible {
          opacity: 1;
        }

        /* Theme variants */
        .loading-theme-dark {
          background-color: var(--bg-dark, #1a202c);
          color: var(--text-light, #e2e8f0);
        }

        .loading-theme-light {
          background-color: var(--bg-light, #ffffff);
          color: var(--text-dark, #2d3748);
        }

        .loading-theme-auto {
          background-color: var(--bg-primary, #1a202c);
          color: var(--text-primary, #e2e8f0);
        }

        .loading-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
        }

        .loading-overlay {
          background-color: rgba(26, 32, 44, 0.9);
          backdrop-filter: blur(2px);
        }

        .loading-inline {
          min-height: 300px;
          width: 100%;
          border-radius: 12px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          max-width: 500px;
          padding: 40px 20px;
        }

        .loading-small .loading-container {
          padding: 20px 10px;
          max-width: 300px;
        }

        .loading-large .loading-container {
          padding: 60px 30px;
          max-width: 700px;
        }

        .loading-animation {
          margin-bottom: 24px;
        }

        /* Enhanced Spinner Animation */
        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(74, 108, 247, 0.2);
          border-left: 4px solid var(--primary-color, #4a6cf7);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-small .loading-spinner {
          width: 32px;
          height: 32px;
          border-width: 3px;
        }

        .loading-large .loading-spinner {
          width: 64px;
          height: 64px;
          border-width: 5px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Enhanced Dots Animation */
        .loading-dots {
          display: flex;
          gap: 8px;
        }

        .dot {
          width: 12px;
          height: 12px;
          background-color: var(--primary-color, #4a6cf7);
          border-radius: 50%;
          animation: dot-bounce 1.4s ease-in-out infinite both;
        }

        .dot-1 { animation-delay: -0.32s; }
        .dot-2 { animation-delay: -0.16s; }
        .dot-3 { animation-delay: 0s; }

        @keyframes dot-bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Enhanced Pulse Animation */
        .loading-pulse {
          position: relative;
          width: 60px;
          height: 60px;
        }

        .pulse-circle {
          position: absolute;
          width: 60px;
          height: 60px;
          border: 3px solid var(--primary-color, #4a6cf7);
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .pulse-1 { animation-delay: 0s; }
        .pulse-2 { animation-delay: -0.5s; }
        .pulse-3 { animation-delay: -1s; }

        @keyframes pulse {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        /* Bars Animation */
        .loading-bars {
          display: flex;
          gap: 4px;
          align-items: flex-end;
          height: 40px;
        }

        .bar {
          width: 6px;
          background-color: var(--primary-color, #4a6cf7);
          border-radius: 3px;
          animation: bar-scale 1.2s ease-in-out infinite;
        }

        .bar-1 { animation-delay: -0.8s; }
        .bar-2 { animation-delay: -0.6s; }
        .bar-3 { animation-delay: -0.4s; }
        .bar-4 { animation-delay: -0.2s; }
        .bar-5 { animation-delay: 0s; }

        @keyframes bar-scale {
          0%, 40%, 100% {
            height: 10px;
          }
          20% {
            height: 40px;
          }
        }

        /* Ripple Animation */
        .loading-ripple {
          position: relative;
          width: 64px;
          height: 64px;
        }

        .ripple-circle {
          position: absolute;
          border: 3px solid var(--primary-color, #4a6cf7);
          border-radius: 50%;
          animation: ripple 1s ease-out infinite;
        }

        .ripple-1 { animation-delay: 0s; }
        .ripple-2 { animation-delay: -0.5s; }

        @keyframes ripple {
          0% {
            top: 28px;
            left: 28px;
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            top: -1px;
            left: -1px;
            width: 58px;
            height: 58px;
            opacity: 0;
          }
        }

        /* Enhanced Skeleton Animation */
        .loading-skeleton {
          width: 300px;
        }

        .skeleton-line {
          height: 16px;
          background: linear-gradient(
            90deg,
            var(--secondary-color, #232b3a) 25%,
            var(--border-color, #2d3748) 50%,
            var(--secondary-color, #232b3a) 75%
          );
          background-size: 200% 100%;
          border-radius: 4px;
          margin-bottom: 12px;
          animation: skeleton-loading 1.5s ease-in-out infinite;
        }

        .skeleton-title {
          height: 20px;
          width: 60%;
        }

        .skeleton-text {
          width: 100%;
        }

        .skeleton-text.short {
          width: 40%;
        }

        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 20px;
        }

        .skeleton-card {
          height: 80px;
          background: linear-gradient(
            90deg,
            var(--secondary-color, #232b3a) 25%,
            var(--border-color, #2d3748) 50%,
            var(--secondary-color, #232b3a) 75%
          );
          background-size: 200% 100%;
          border-radius: 8px;
          animation: skeleton-loading 1.5s ease-in-out infinite;
        }

        @keyframes skeleton-loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Custom Icon */
        .loading-custom-icon {
          font-size: 3rem;
          animation: custom-icon-pulse 2s ease-in-out infinite;
        }

        @keyframes custom-icon-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        /* Loading Message */
        .loading-message {
          margin-bottom: 20px;
        }

        .loading-message h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text-light, #e2e8f0);
        }

        .loading-details {
          font-size: 0.9rem;
          color: var(--text-muted, #a0aec0);
          margin: 0;
          line-height: 1.5;
        }

        .loading-small .loading-message h3 {
          font-size: 1rem;
        }

        .loading-large .loading-message h3 {
          font-size: 1.4rem;
        }

        /* Progress Bar */
        .loading-progress {
          width: 100%;
          max-width: 300px;
          margin-bottom: 16px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background-color: var(--secondary-color, #232b3a);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
          border: 1px solid var(--border-color, #2d3748);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(
            90deg,
            var(--primary-color, #4a6cf7),
            var(--primary-light, #6a7cf7)
          );
          border-radius: 4px;
          transition: width 0.3s ease;
          position: relative;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            45deg,
            transparent 25%,
            rgba(255,255,255,0.1) 25%,
            rgba(255,255,255,0.1) 50%,
            transparent 50%,
            transparent 75%,
            rgba(255,255,255,0.1) 75%
          );
          background-size: 20px 20px;
          animation: progress-shine 1s linear infinite;
        }

        @keyframes progress-shine {
          0% { background-position: 0 0; }
          100% { background-position: 20px 0; }
        }

        .progress-text {
          font-size: 0.85rem;
          color: var(--text-muted, #a0aec0);
          text-align: center;
          font-weight: 500;
        }

        /* Elapsed Time */
        .elapsed-time {
          font-size: 0.8rem;
          color: var(--text-muted, #a0aec0);
          margin-top: 12px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          background-color: var(--secondary-color, #232b3a);
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid var(--border-color, #2d3748);
        }

        /* Cancel Button */
        .loading-cancel {
          margin-top: 16px;
          min-width: 100px;
        }

        /* Timeout State */
        .loading-timeout .loading-container {
          max-width: 500px;
        }

        .timeout-container {
          text-align: center;
        }

        .timeout-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .timeout-container h3 {
          color: var(--warning-color, #ed8936);
          margin-bottom: 12px;
        }

        .timeout-actions {
          display: flex;
          gap: 12px;
          margin: 20px 0;
          flex-wrap: wrap;
          justify-content: center;
        }

        .timeout-actions .btn {
          min-width: 120px;
        }

        /* Light theme adjustments */
        .loading-theme-light .skeleton-line,
        .loading-theme-light .skeleton-card {
          background: linear-gradient(
            90deg,
            #f7fafc 25%,
            #edf2f7 50%,
            #f7fafc 75%
          );
        }

        .loading-theme-light .progress-bar {
          background-color: #edf2f7;
        }

        .loading-theme-light .elapsed-time {
          background-color: #f7fafc;
          border-color: #e2e8f0;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .loading-container {
            padding: 30px 15px;
          }

          .loading-skeleton {
            width: 250px;
          }

          .skeleton-grid {
            grid-template-columns: 1fr;
          }

          .timeout-actions {
            flex-direction: column;
            align-items: center;
          }

          .timeout-actions .btn {
            width: 100%;
            max-width: 200px;
          }
        }

        @media (max-width: 480px) {
          .loading-container {
            padding: 20px 10px;
          }

          .loading-message h3 {
            font-size: 1.1rem;
          }

          .loading-skeleton {
            width: 200px;
          }

          .loading-bars {
            height: 30px;
          }

          .bar {
            width: 4px;
          }

          @keyframes bar-scale {
            0%, 40%, 100% {
              height: 8px;
            }
            20% {
              height: 30px;
            }
          }
        }

        /* High Contrast */
        @media (prefers-contrast: high) {
          .loading-spinner {
            border-color: #000;
            border-left-color: #fff;
          }

          .progress-bar {
            border-width: 2px;
          }

          .elapsed-time {
            border-width: 2px;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .loading-spinner,
          .dot,
          .pulse-circle,
          .bar,
          .ripple-circle,
          .skeleton-line,
          .skeleton-card,
          .progress-fill::after,
          .loading-custom-icon {
            animation: none;
          }

          .loading-spinner {
            border-left-color: var(--primary-color, #4a6cf7);
          }
        }
      `}</style>
    </div>
  );
});

// Display name for debugging
LoadingScreen.displayName = 'LoadingScreen';

// PropTypes
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
    {...props}
  />
);