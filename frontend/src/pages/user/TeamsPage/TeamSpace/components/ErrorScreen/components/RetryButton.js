/**
 * RetryButton Component
 * Specialized retry button with countdown, loading states, and accessibility
 */

import React, { memo, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './RetryButton.css';

/**
 * RetryButton component with advanced retry functionality
 */
const RetryButton = memo(({
  onRetry = null,
  isRetrying = false,
  retryCount = 0,
  maxRetries = 3,
  retryButtonText = null,
  disabled = false,
  size = 'medium',
  variant = 'primary',
  countdown = 0,
  errorType = 'generic',
  showIcon = true,
  className = ''
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [internalCountdown, setInternalCountdown] = useState(countdown);

  // Handle countdown timer
  useEffect(() => {
    if (internalCountdown > 0) {
      const timer = setTimeout(() => {
        setInternalCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [internalCountdown]);

  // Reset countdown when external countdown changes
  useEffect(() => {
    setInternalCountdown(countdown);
  }, [countdown]);

  /**
   * Handle retry click
   */
  const handleRetryClick = useCallback(async () => {
    if (disabled || isRetrying || internalCountdown > 0 || !onRetry) return;

    setIsClicked(true);
    
    try {
      await onRetry();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      // Keep clicked state briefly for visual feedback
      setTimeout(() => setIsClicked(false), 200);
    }
  }, [disabled, isRetrying, internalCountdown, onRetry]);

  /**
   * Generate button text based on state
   */
  const getButtonText = useCallback(() => {
    if (retryButtonText) return retryButtonText;
    
    if (internalCountdown > 0) {
      return `Retry in ${internalCountdown}s`;
    }
    
    if (isRetrying) {
      return 'Retrying...';
    }
    
    if (retryCount >= maxRetries) {
      return 'Max Retries Reached';
    }
    
    if (retryCount > 0) {
      return `Retry (${retryCount + 1}/${maxRetries})`;
    }
    
    return 'Try Again';
  }, [retryButtonText, internalCountdown, isRetrying, retryCount, maxRetries]);

  /**
   * Determine if button should be disabled
   */
  const isDisabled = disabled || 
                    isRetrying || 
                    internalCountdown > 0 || 
                    retryCount >= maxRetries || 
                    !onRetry;

  /**
   * Get retry icon based on error type
   */
  const getRetryIcon = () => {
    if (!showIcon) return null;
    
    const iconMap = {
      network: '🔄',
      server: '⚠️',
      permission: '🔒',
      notFound: '🔍',
      validation: '✏️',
      timeout: '⏱️',
      generic: '↻'
    };
    
    return iconMap[errorType] || '↻';
  };

  // Container classes
  const containerClasses = [
    'retry-button',
    `retry-button-${size}`,
    `retry-button-${variant}`,
    isRetrying ? 'retry-button-loading' : '',
    isClicked ? 'retry-button-clicked' : '',
    isDisabled ? 'retry-button-disabled' : '',
    internalCountdown > 0 ? 'retry-button-countdown' : '',
    retryCount >= maxRetries ? 'retry-button-max-retries' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={containerClasses}
      onClick={handleRetryClick}
      disabled={isDisabled}
      aria-describedby="retry-button-description"
      aria-label={`${getButtonText()}${retryCount > 0 ? `. Attempt ${retryCount + 1} of ${maxRetries}` : ''}`}
      data-max-retries={retryCount >= maxRetries}
    >
      {/* Button Icon */}
      {showIcon && !isRetrying && (
        <span 
          className="retry-button-icon" 
          aria-hidden="true"
        >
          {getRetryIcon()}
        </span>
      )}
      
      {/* Button Text */}
      <span className="retry-button-text">
        {getButtonText()}
      </span>
      
      {/* Loading Spinner */}
      {isRetrying && (
        <span className="retry-button-spinner" aria-hidden="true"></span>
      )}

      {/* Accessibility Description */}
      <span id="retry-button-description" className="sr-only">
        {isDisabled 
          ? 'Retry is not available at this time'
          : `Click to retry the operation. This will be attempt ${retryCount + 1} of ${maxRetries}.`
        }
      </span>
    </button>
  );
});

// Display name for debugging
RetryButton.displayName = 'RetryButton';

// PropTypes validation
RetryButton.propTypes = {
  onRetry: PropTypes.func,
  isRetrying: PropTypes.bool,
  retryCount: PropTypes.number,
  maxRetries: PropTypes.number,
  retryButtonText: PropTypes.string,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  countdown: PropTypes.number,
  errorType: PropTypes.string,
  showIcon: PropTypes.bool,
  className: PropTypes.string
};

export default RetryButton;