import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Industry-standard Toast Notification System for TeamSpace
 * Features: Multiple types, animations, progress bars, actions, auto-dismiss, accessibility
 */
const TeamSpaceToast = memo(({
  id = null,
  type = 'info', // success, error, warning, info, loading
  title = null,
  message = '',
  duration = 5000,
  showProgress = true,
  dismissible = true,
  persistent = false,
  onDismiss = null,
  onAction = null,
  actionText = null,
  position = 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
  size = 'default', // small, default, large
  animate = true,
  sound = false,
  icon = null,
  className = '',
  trackInteraction = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const toastRef = useRef(null);
  const progressRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const remainingTimeRef = useRef(duration);

  // Toast type configurations
  const toastConfigs = {
    success: {
      iconDefault: '✅',
      bgColor: 'var(--success-color, #48bb78)',
      textColor: '#ffffff',
      borderColor: 'var(--success-dark, #38a169)',
      progressColor: 'rgba(255, 255, 255, 0.3)',
      ariaLabel: 'Success notification'
    },
    error: {
      iconDefault: '❌',
      bgColor: 'var(--danger-color, #e53e3e)',
      textColor: '#ffffff',
      borderColor: 'var(--danger-dark, #c53030)',
      progressColor: 'rgba(255, 255, 255, 0.3)',
      ariaLabel: 'Error notification'
    },
    warning: {
      iconDefault: '⚠️',
      bgColor: 'var(--warning-color, #ed8936)',
      textColor: '#ffffff',
      borderColor: 'var(--warning-dark, #dd6b20)',
      progressColor: 'rgba(255, 255, 255, 0.3)',
      ariaLabel: 'Warning notification'
    },
    info: {
      iconDefault: 'ℹ️',
      bgColor: 'var(--info-color, #4299e1)',
      textColor: '#ffffff',
      borderColor: 'var(--info-dark, #3182ce)',
      progressColor: 'rgba(255, 255, 255, 0.3)',
      ariaLabel: 'Information notification'
    },
    loading: {
      iconDefault: '⏳',
      bgColor: 'var(--secondary-color, #232b3a)',
      textColor: 'var(--text-light, #e2e8f0)',
      borderColor: 'var(--border-color, #2d3748)',
      progressColor: 'var(--primary-color, #4a6cf7)',
      ariaLabel: 'Loading notification'
    }
  };

  const config = toastConfigs[type] || toastConfigs.info;

  // Show toast with animation
  useEffect(() => {
    if (animate) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(true);
    }

    // Play sound if enabled
    if (sound && window.AudioContext) {
      playNotificationSound();
    }

    // Track toast display
    if (trackInteraction && window.gtag) {
      window.gtag('event', 'toast_displayed', {
        toast_type: type,
        toast_id: id || 'anonymous'
      });
    }
  }, [animate, sound, trackInteraction, type, id]);

  // Auto-dismiss timer
  useEffect(() => {
    if (!persistent && duration > 0 && !isPaused) {
      startTimeRef.current = Date.now();
      remainingTimeRef.current = duration;
      
      const startTimer = () => {
        timerRef.current = setTimeout(() => {
          handleDismiss();
        }, remainingTimeRef.current);
      };

      startTimer();

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [duration, persistent, isPaused]);

  // Progress bar animation
  useEffect(() => {
    if (!persistent && duration > 0 && showProgress && !isPaused) {
      progressRef.current = setInterval(() => {
        setProgress(prev => {
          const elapsed = Date.now() - startTimeRef.current;
          const remaining = Math.max(0, (remainingTimeRef.current - elapsed) / remainingTimeRef.current * 100);
          
          if (remaining <= 0) {
            clearInterval(progressRef.current);
            return 0;
          }
          
          return remaining;
        });
      }, 16); // ~60fps

      return () => {
        if (progressRef.current) {
          clearInterval(progressRef.current);
        }
      };
    }
  }, [duration, persistent, showProgress, isPaused]);

  /**
   * Play notification sound
   */
  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different types
      const frequencies = {
        success: 800,
        error: 400,
        warning: 600,
        info: 500,
        loading: 300
      };

      oscillator.frequency.setValueAtTime(frequencies[type] || 500, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('TeamSpaceToast: Could not play notification sound:', error);
    }
  }, [type]);

  /**
   * Pause auto-dismiss timer
   */
  const pauseTimer = useCallback(() => {
    if (!persistent && !isPaused) {
      setIsPaused(true);
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        const elapsed = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
      }
      
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    }
  }, [persistent, isPaused]);

  /**
   * Resume auto-dismiss timer
   */
  const resumeTimer = useCallback(() => {
    if (!persistent && isPaused && remainingTimeRef.current > 0) {
      setIsPaused(false);
      startTimeRef.current = Date.now();
    }
  }, [persistent, isPaused]);

  /**
   * Handle toast dismissal
   */
  const handleDismiss = useCallback(() => {
    if (trackInteraction && window.gtag) {
      window.gtag('event', 'toast_dismissed', {
        toast_type: type,
        toast_id: id || 'anonymous'
      });
    }

    if (animate) {
      setIsExiting(true);
      setTimeout(() => {
        if (onDismiss) {
          onDismiss(id);
        }
      }, 300);
    } else {
      if (onDismiss) {
        onDismiss(id);
      }
    }
  }, [animate, onDismiss, id, trackInteraction, type]);

  /**
   * Handle action click
   */
  const handleAction = useCallback(() => {
    if (trackInteraction && window.gtag) {
      window.gtag('event', 'toast_action_clicked', {
        toast_type: type,
        toast_id: id || 'anonymous'
      });
    }

    if (onAction) {
      onAction(id);
    }
  }, [onAction, id, trackInteraction, type]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'Escape':
        if (dismissible) {
          e.preventDefault();
          handleDismiss();
        }
        break;
      case 'Enter':
      case ' ':
        if (onAction && actionText) {
          e.preventDefault();
          handleAction();
        } else if (dismissible) {
          e.preventDefault();
          handleDismiss();
        }
        break;
    }
  }, [dismissible, onAction, actionText, handleDismiss, handleAction]);

  /**
   * Render toast icon
   */
  const renderIcon = () => {
    const iconToRender = icon || config.iconDefault;
    
    if (type === 'loading') {
      return (
        <div className="toast-icon loading-icon" aria-hidden="true">
          <div className="loading-spinner-small"></div>
        </div>
      );
    }
    
    return (
      <div className="toast-icon" aria-hidden="true">
        {typeof iconToRender === 'string' ? (
          <span className="toast-icon-emoji">{iconToRender}</span>
        ) : (
          iconToRender
        )}
      </div>
    );
  };

  /**
   * Render progress bar
   */
  const renderProgress = () => {
    if (!showProgress || persistent || type === 'loading') return null;
    
    return (
      <div className="toast-progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
        <div 
          className="toast-progress-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  };

  // Container classes
  const containerClasses = [
    'team-space-toast',
    `toast-${type}`,
    `toast-${size}`,
    `toast-${position}`,
    isVisible ? 'toast-visible' : '',
    isExiting ? 'toast-exiting' : '',
    animate ? 'toast-animated' : '',
    isPaused ? 'toast-paused' : '',
    dismissible ? 'toast-dismissible' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={toastRef}
      className={containerClasses}
      role="alert"
      aria-live="polite"
      aria-label={config.ariaLabel}
      tabIndex={dismissible ? 0 : -1}
      onKeyDown={handleKeyDown}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onFocus={pauseTimer}
      onBlur={resumeTimer}
    >
      {/* Toast Content */}
      <div className="toast-content">
        {/* Icon */}
        {renderIcon()}

        {/* Message Content */}
        <div className="toast-message">
          {title && (
            <div className="toast-title">{title}</div>
          )}
          <div className="toast-text">{message}</div>
        </div>

        {/* Action Button */}
        {onAction && actionText && (
          <button
            onClick={handleAction}
            className="toast-action-btn"
            aria-label={`${actionText} - ${message}`}
          >
            {actionText}
          </button>
        )}

        {/* Dismiss Button */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="toast-dismiss-btn"
            aria-label="Dismiss notification"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {renderProgress()}

      {/* Toast Styles */}
      <style jsx>{`
        .team-space-toast {
          position: fixed;
          z-index: 10000;
          min-width: 300px;
          max-width: 500px;
          background-color: ${config.bgColor};
          color: ${config.textColor};
          border: 1px solid ${config.borderColor};
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          opacity: 0;
          transform: translateY(-20px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(8px);
        }

        /* Position variants */
        .toast-top-right {
          top: 20px;
          right: 20px;
        }

        .toast-top-left {
          top: 20px;
          left: 20px;
        }

        .toast-bottom-right {
          bottom: 20px;
          right: 20px;
        }

        .toast-bottom-left {
          bottom: 20px;
          left: 20px;
        }

        .toast-top-center {
          top: 20px;
          left: 50%;
          transform: translateX(-50%) translateY(-20px);
        }

        .toast-bottom-center {
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
        }

        /* Size variants */
        .toast-small {
          min-width: 250px;
          max-width: 350px;
        }

        .toast-large {
          min-width: 400px;
          max-width: 600px;
        }

        /* Visibility states */
        .toast-animated.toast-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .toast-animated.toast-visible.toast-top-center {
          transform: translateX(-50%) translateY(0);
        }

        .toast-animated.toast-visible.toast-bottom-center {
          transform: translateX(-50%) translateY(0);
        }

        .toast-animated.toast-exiting {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }

        .toast-animated.toast-exiting.toast-bottom-right,
        .toast-animated.toast-exiting.toast-bottom-left,
        .toast-animated.toast-exiting.toast-bottom-center {
          transform: translateY(20px) scale(0.95);
        }

        .toast-animated.toast-exiting.toast-top-center {
          transform: translateX(-50%) translateY(-20px) scale(0.95);
        }

        .toast-animated.toast-exiting.toast-bottom-center {
          transform: translateX(-50%) translateY(20px) scale(0.95);
        }

        /* Content */
        .toast-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          position: relative;
        }

        .toast-small .toast-content {
          padding: 12px;
          gap: 8px;
        }

        .toast-large .toast-content {
          padding: 20px;
          gap: 16px;
        }

        /* Icon */
        .toast-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }

        .toast-icon-emoji {
          font-size: 1.2rem;
        }

        .loading-icon {
          animation: pulse 1.5s ease-in-out infinite;
        }

        .loading-spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Message */
        .toast-message {
          flex: 1;
          min-width: 0;
        }

        .toast-title {
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 4px;
          line-height: 1.3;
        }

        .toast-text {
          font-size: 0.85rem;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .toast-small .toast-title {
          font-size: 0.85rem;
        }

        .toast-small .toast-text {
          font-size: 0.8rem;
        }

        .toast-large .toast-title {
          font-size: 1rem;
        }

        .toast-large .toast-text {
          font-size: 0.9rem;
        }

        /* Action Button */
        .toast-action-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: currentColor;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .toast-action-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .toast-action-btn:focus {
          outline: 2px solid rgba(255, 255, 255, 0.5);
          outline-offset: 2px;
        }

        /* Dismiss Button */
        .toast-dismiss-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: none;
          border: none;
          color: currentColor;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          opacity: 0.7;
          transition: all 0.2s ease;
        }

        .toast-dismiss-btn:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.1);
        }

        .toast-dismiss-btn:focus {
          outline: 2px solid rgba(255, 255, 255, 0.5);
          outline-offset: 2px;
          opacity: 1;
        }

        /* Progress Bar */
        .toast-progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .toast-progress-fill {
          height: 100%;
          background: ${config.progressColor};
          transition: width 0.1s linear;
          border-radius: 0 2px 2px 0;
        }

        /* Paused state */
        .toast-paused .toast-progress-fill {
          animation: glow 1s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from { opacity: 0.7; }
          to { opacity: 1; }
        }

        /* Focus states */
        .toast-dismissible:focus {
          outline: 2px solid rgba(255, 255, 255, 0.5);
          outline-offset: 2px;
        }

        /* Type-specific adjustments */
        .toast-loading .toast-progress-bar {
          display: none;
        }

        .toast-loading .toast-content {
          padding-right: 20px; /* No dismiss button for loading */
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .team-space-toast {
            min-width: 280px;
            max-width: calc(100vw - 40px);
            margin: 0 20px;
          }

          .toast-top-center,
          .toast-bottom-center {
            left: 20px;
            right: 20px;
            transform: none;
            max-width: none;
          }

          .toast-animated.toast-visible.toast-top-center,
          .toast-animated.toast-visible.toast-bottom-center {
            transform: translateY(0);
          }

          .toast-animated.toast-exiting.toast-top-center {
            transform: translateY(-20px) scale(0.95);
          }

          .toast-animated.toast-exiting.toast-bottom-center {
            transform: translateY(20px) scale(0.95);
          }

          .toast-content {
            padding: 12px;
            gap: 8px;
          }

          .toast-title {
            font-size: 0.85rem;
          }

          .toast-text {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .team-space-toast {
            min-width: 260px;
          }

          .toast-action-btn {
            padding: 4px 8px;
            font-size: 0.75rem;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .team-space-toast {
            border-width: 2px;
          }

          .toast-action-btn,
          .toast-dismiss-btn {
            border-width: 2px;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .team-space-toast {
            transition: none;
          }

          .loading-spinner-small,
          .loading-icon {
            animation: none;
          }

          .toast-progress-fill {
            transition: none;
          }

          .toast-paused .toast-progress-fill {
            animation: none;
          }
        }

        /* Print styles */
        @media print {
          .team-space-toast {
            display: none;
          }
        }
      `}</style>
    </div>
  );
});

// Display name for debugging
TeamSpaceToast.displayName = 'TeamSpaceToast';

// PropTypes
TeamSpaceToast.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info', 'loading']),
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  duration: PropTypes.number,
  showProgress: PropTypes.bool,
  dismissible: PropTypes.bool,
  persistent: PropTypes.bool,
  onDismiss: PropTypes.func,
  onAction: PropTypes.func,
  actionText: PropTypes.string,
  position: PropTypes.oneOf([
    'top-right', 'top-left', 'bottom-right', 
    'bottom-left', 'top-center', 'bottom-center'
  ]),
  size: PropTypes.oneOf(['small', 'default', 'large']),
  animate: PropTypes.bool,
  sound: PropTypes.bool,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  className: PropTypes.string,
  trackInteraction: PropTypes.bool
};

export default TeamSpaceToast;

// Toast Container Component
export const TeamSpaceToastContainer = memo(({ 
  toasts = [], 
  maxToasts = 5,
  position = 'top-right',
  onRemove = null 
}) => {
  // Limit number of visible toasts
  const visibleToasts = toasts.slice(-maxToasts);

  if (visibleToasts.length === 0) return null;

  return (
    <div className={`toast-container toast-container-${position}`}>
      {visibleToasts.map((toast, index) => (
        <TeamSpaceToast
          key={toast.id || index}
          {...toast}
          position={position}
          onDismiss={onRemove}
        />
      ))}
      
      <style jsx>{`
        .toast-container {
          position: fixed;
          z-index: 10000;
          pointer-events: none;
        }

        .toast-container > * {
          pointer-events: auto;
          margin-bottom: 8px;
        }

        .toast-container-top-right {
          top: 20px;
          right: 20px;
        }

        .toast-container-top-left {
          top: 20px;
          left: 20px;
        }

        .toast-container-bottom-right {
          bottom: 20px;
          right: 20px;
        }

        .toast-container-bottom-left {
          bottom: 20px;
          left: 20px;
        }

        .toast-container-top-center {
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
        }

        .toast-container-bottom-center {
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
        }

        @media (max-width: 768px) {
          .toast-container-top-center,
          .toast-container-bottom-center {
            left: 20px;
            right: 20px;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
});

TeamSpaceToastContainer.displayName = 'TeamSpaceToastContainer';

TeamSpaceToastContainer.propTypes = {
  toasts: PropTypes.array,
  maxToasts: PropTypes.number,
  position: PropTypes.oneOf([
    'top-right', 'top-left', 'bottom-right', 
    'bottom-left', 'top-center', 'bottom-center'
  ]),
  onRemove: PropTypes.func
};

// ✅ FIXED: Add missing exports at the end of the file

// Toast Manager Hook
export const useTeamSpaceToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toastConfig) => {
    const id = toastConfig.id || `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { ...toastConfig, id };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return addToast({ type: 'success', message, ...options });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({ type: 'error', message, persistent: true, ...options });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({ type: 'warning', message, ...options });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({ type: 'info', message, ...options });
  }, [addToast]);

  const loading = useCallback((message, options = {}) => {
    return addToast({ 
      type: 'loading', 
      message, 
      persistent: true, 
      dismissible: false, 
      showProgress: false,
      ...options 
    });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    loading
  };
};

// ✅ FIXED: Add missing exports
export const ToastProvider = TeamSpaceToastContainer;
export const ToastContainer = TeamSpaceToastContainer;

// Global toast management functions
let globalToastManager = null;

export const showToast = (config) => {
  if (globalToastManager) {
    return globalToastManager.addToast(config);
  }
  console.warn('Toast manager not initialized. Use ToastProvider first.');
  return null;
};

export const hideToast = (id) => {
  if (globalToastManager) {
    return globalToastManager.removeToast(id);
  }
  console.warn('Toast manager not initialized. Use ToastProvider first.');
};

export const clearAllToasts = () => {
  if (globalToastManager) {
    return globalToastManager.clearAllToasts();
  }
  console.warn('Toast manager not initialized. Use ToastProvider first.');
};

// Set global toast manager
export const setGlobalToastManager = (manager) => {
  globalToastManager = manager;
};

// Convenience toast functions
export const showSuccessToast = (message, options = {}) => {
  return showToast({ type: 'success', message, ...options });
};

export const showErrorToast = (message, options = {}) => {
  return showToast({ type: 'error', message, persistent: true, ...options });
};

export const showWarningToast = (message, options = {}) => {
  return showToast({ type: 'warning', message, ...options });
};

export const showInfoToast = (message, options = {}) => {
  return showToast({ type: 'info', message, ...options });
};

export const showLoadingToast = (message, options = {}) => {
  return showToast({ 
    type: 'loading', 
    message, 
    persistent: true, 
    dismissible: false, 
    showProgress: false,
    ...options 
  });
};