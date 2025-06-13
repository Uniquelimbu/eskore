import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { TOAST_CONFIGS } from './utils/toastConfig';
import { playNotificationSound } from './utils/soundUtils';
import { useToastTimer } from './hooks/useToastTimer';

// Import CSS files
import './TeamSpaceToast.css';
import './styles/animation.css';
import './styles/variants.css';
import './styles/positions.css';
import './styles/responsive.css';

/**
 * TeamSpace Toast Notification Component
 * Clean, focused component handling only the display logic
 */
const TeamSpaceToast = memo(({
  id = null,
  type = 'info',
  title = null,
  message = '',
  duration = 5000,
  showProgress = true,
  dismissible = true,
  persistent = false,
  onDismiss = null,
  onAction = null,
  actionText = null,
  position = 'top-right',
  size = 'default',
  animate = true,
  sound = false,
  icon = null,
  className = '',
  trackInteraction = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const toastRef = useRef(null);

  // Get configuration for toast type
  const config = TOAST_CONFIGS[type] || TOAST_CONFIGS.info;

  // Use custom timer hook
  const { progress, isPaused, pauseTimer, resumeTimer, handleDismiss: timerDismiss } = useToastTimer({
    duration,
    persistent,
    animate,
    onDismiss,
    id,
    trackInteraction,
    type
  });

  // Show toast with animation
  useEffect(() => {
    if (animate) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(true);
    }

    // Play sound if enabled
    if (sound && window.AudioContext) {
      playNotificationSound(type);
    }

    // Track toast display
    if (trackInteraction && window.gtag) {
      window.gtag('event', 'toast_displayed', {
        toast_type: type,
        toast_id: id || 'anonymous'
      });
    }
  }, [animate, sound, trackInteraction, type, id]);

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
          style={{ 
            width: `${progress}%`,
            backgroundColor: config.progressColor
          }}
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
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        borderColor: config.borderColor
      }}
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
    </div>
  );
});

// Display name for debugging
TeamSpaceToast.displayName = 'TeamSpaceToast';

// PropTypes validation
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