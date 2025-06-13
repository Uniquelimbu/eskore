/**
 * ErrorIcon Component
 * Displays animated error icons with customizable styling
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { ERROR_TYPES, ERROR_ICONS, ERROR_COLORS } from '../constants';

/**
 * ErrorIcon component with animation and customization
 */
const ErrorIcon = memo(({
  errorType = ERROR_TYPES.GENERIC,
  size = 'default',
  animated = true,
  customIcon = null,
  customColor = null,
  ariaLabel = null,
  className = ""
}) => {
  // Get icon and color from configuration
  const icon = customIcon || ERROR_ICONS[errorType] || ERROR_ICONS[ERROR_TYPES.GENERIC];
  const color = customColor || ERROR_COLORS[errorType] || ERROR_COLORS[ERROR_TYPES.GENERIC];
  
  // Size configurations
  const sizeConfig = {
    small: '2.5rem',
    default: '4rem',
    large: '5rem'
  };
  
  const iconSize = sizeConfig[size] || sizeConfig.default;
  
  // Generate aria label
  const label = ariaLabel || `${errorType} error icon`;
  
  // Container classes
  const containerClasses = [
    'error-icon-container',
    `error-icon-${size}`,
    animated ? 'error-icon-animated' : '',
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
            color: color
          }}
        >
          {icon}
        </span>
        {animated && <div className="error-icon-pulse" style={{ color: color }}></div>}
      </div>

      {/* Icon Styles */}
      <style jsx>{`
        .error-icon-container {
          margin-bottom: 24px;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .error-icon-wrapper {
          position: relative;
          display: inline-block;
        }

        .error-icon {
          display: block;
          filter: grayscale(0.2);
          transition: all 0.3s ease;
        }

        .error-icon-animated .error-icon {
          animation: iconFloat 3s ease-in-out infinite;
        }

        @keyframes iconFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .error-icon-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 120%;
          height: 120%;
          background: radial-gradient(circle, currentColor 0%, transparent 70%);
          border-radius: 50%;
          opacity: 0.3;
          transform: translate(-50%, -50%);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.4;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        /* Size variations */
        .error-icon-small {
          margin-bottom: 16px;
        }

        .error-icon-large {
          margin-bottom: 32px;
        }

        /* Hover effects */
        .error-icon-container:hover .error-icon {
          filter: grayscale(0);
          transform: scale(1.05);
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .error-icon,
          .error-icon-pulse {
            animation: none;
          }
          
          .error-icon-container:hover .error-icon {
            transform: none;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .error-icon {
            filter: none;
            border: 2px solid currentColor;
            border-radius: 50%;
            padding: 8px;
          }
          
          .error-icon-pulse {
            display: none;
          }
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .error-icon-container {
            margin-bottom: 20px;
          }
          
          .error-icon {
            font-size: calc(${iconSize} * 0.8) !important;
          }
        }

        @media (max-width: 480px) {
          .error-icon {
            font-size: calc(${iconSize} * 0.7) !important;
          }
        }
      `}</style>
    </div>
  );
});

// Display name for debugging
ErrorIcon.displayName = 'ErrorIcon';

// PropTypes
ErrorIcon.propTypes = {
  errorType: PropTypes.oneOf(Object.values(ERROR_TYPES)),
  size: PropTypes.oneOf(['small', 'default', 'large']),
  animated: PropTypes.bool,
  customIcon: PropTypes.string,
  customColor: PropTypes.string,
  ariaLabel: PropTypes.string,
  className: PropTypes.string
};

export default ErrorIcon;