/**
 * ErrorIcon Component
 * Displays contextual icons for different error types with animations
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { ERROR_TYPES } from '../constants';
import './ErrorIcon.css';

/**
 * ErrorIcon component for displaying error type specific icons
 */
const ErrorIcon = memo(({
  errorType = ERROR_TYPES.GENERIC,
  size = 'large',
  animated = true,
  className = '',
  ariaLabel = null,
  showPulse = false,
  color = null
}) => {
  // Icon mapping for different error types
  const iconMap = {
    [ERROR_TYPES.NETWORK]: '🌐',
    [ERROR_TYPES.PERMISSION]: '🔒',
    [ERROR_TYPES.NOT_FOUND]: '❓',
    [ERROR_TYPES.SERVER]: '⚠️',
    [ERROR_TYPES.TIMEOUT]: '⏱️',
    [ERROR_TYPES.VALIDATION]: '✏️',
    [ERROR_TYPES.AUTHENTICATION]: '🔐',
    [ERROR_TYPES.RATE_LIMIT]: '🚦',
    [ERROR_TYPES.GENERIC]: '❌'
  };

  // Color mapping for different error types
  const colorMap = {
    [ERROR_TYPES.NETWORK]: '#4299e1',
    [ERROR_TYPES.PERMISSION]: '#ed8936',
    [ERROR_TYPES.NOT_FOUND]: '#a0aec0',
    [ERROR_TYPES.SERVER]: '#e53e3e',
    [ERROR_TYPES.TIMEOUT]: '#d69e2e',
    [ERROR_TYPES.VALIDATION]: '#9f7aea',
    [ERROR_TYPES.AUTHENTICATION]: '#38b2ac',
    [ERROR_TYPES.RATE_LIMIT]: '#f56565',
    [ERROR_TYPES.GENERIC]: '#718096'
  };

  // Size mapping
  const sizeMap = {
    small: '2rem',
    medium: '3rem',
    large: '4rem',
    xlarge: '5rem'
  };

  const icon = iconMap[errorType] || iconMap[ERROR_TYPES.GENERIC];
  const iconColor = color || colorMap[errorType] || colorMap[ERROR_TYPES.GENERIC];
  const iconSize = sizeMap[size] || sizeMap.large;
  const label = ariaLabel || `${errorType} error icon`;

  // Container classes
  const containerClasses = [
    'error-icon-container',
    `error-icon-${size}`,
    `error-icon-${errorType}`,
    animated ? 'error-icon-animated' : '',
    showPulse ? 'error-icon-pulse' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className="error-icon-wrapper">
        <span 
          className="error-icon" 
          role="img" 
          aria-label={label}
          style={{ 
            fontSize: iconSize,
            color: iconColor 
          }}
        >
          {icon}
        </span>
        
        {/* Pulse rings for animation effect */}
        {showPulse && (
          <>
            <div className="error-icon-pulse-ring"></div>
            <div className="error-icon-pulse-ring"></div>
            <div className="error-icon-pulse-ring"></div>
          </>
        )}
      </div>
    </div>
  );
});

// Display name for debugging
ErrorIcon.displayName = 'ErrorIcon';

// PropTypes validation
ErrorIcon.propTypes = {
  errorType: PropTypes.oneOf(Object.values(ERROR_TYPES)),
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  animated: PropTypes.bool,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
  showPulse: PropTypes.bool,
  color: PropTypes.string
};

export default ErrorIcon;