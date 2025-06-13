/**
 * ErrorActions Component
 * Displays action buttons with accessibility and customization options
 */

import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import RetryButton from './RetryButton';
import { ERROR_TYPES } from '../constants';
import './ErrorActions.css'; // Import external CSS file

/**
 * ErrorActions component for displaying action buttons
 */
const ErrorActions = memo(({
  errorType = ERROR_TYPES.GENERIC,
  canRetry = false,
  isRetrying = false,
  retryCount = 0,
  maxRetries = 3,
  retryButtonText = null,
  showGoBack = true,
  showHelp = false,
  showReport = false,
  onRetry = null,
  onGoBack = null,
  onHelp = null,
  onReport = null,
  customActions = null,
  actionAlignment = 'center',
  actionSize = 'medium',
  className = "",
  ariaLabel = "Error actions"
}) => {
  /**
   * Handle go back action with improved navigation logic
   */
  const handleGoBack = useCallback(() => {
    if (onGoBack) {
      onGoBack();
    } else {
      try {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          // Fallback to teams page or home
          const fallbackUrls = ['/teams', '/dashboard', '/'];
          window.location.href = fallbackUrls[0];
        }
      } catch (error) {
        console.warn('Navigation failed:', error);
        window.location.href = '/';
      }
    }
  }, [onGoBack]);

  /**
   * Handle help action with proper error handling
   */
  const handleHelp = useCallback(() => {
    if (onHelp) {
      onHelp();
    } else {
      const helpUrl = getHelpUrl(errorType);
      try {
        window.open(helpUrl, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.warn('Failed to open help URL:', error);
        window.location.href = helpUrl;
      }
    }
  }, [onHelp, errorType]);

  /**
   * Handle report error action with improved error reporting
   */
  const handleReport = useCallback(() => {
    if (onReport) {
      onReport();
    } else {
      try {
        const subject = encodeURIComponent(`Error Report - ${errorType}`);
        const body = encodeURIComponent(
          `Error Type: ${errorType}\n` +
          `Retry Count: ${retryCount}\n` +
          `URL: ${window.location.href}\n` +
          `User Agent: ${navigator.userAgent}\n` +
          `Timestamp: ${new Date().toISOString()}\n\n` +
          `Please describe what you were doing when this error occurred:`
        );
        
        // Try mailto first, fallback to copying to clipboard
        const mailtoUrl = `mailto:support@eskore.com?subject=${subject}&body=${body}`;
        if (navigator.userAgent.includes('Mobile')) {
          window.location.href = mailtoUrl;
        } else {
          window.open(mailtoUrl);
        }
      } catch (error) {
        console.warn('Failed to open email client:', error);
        copyErrorToClipboard();
      }
    }
  }, [onReport, errorType, retryCount]);

  /**
   * Copy error information to clipboard as fallback
   */
  const copyErrorToClipboard = useCallback(async () => {
    try {
      const errorInfo = `Error Report - ${errorType}\n` +
        `Retry Count: ${retryCount}\n` +
        `URL: ${window.location.href}\n` +
        `Timestamp: ${new Date().toISOString()}`;
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(errorInfo);
        alert('Error information copied to clipboard. Please paste it in your email to support@eskore.com');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = errorInfo;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Error information copied to clipboard. Please paste it in your email to support@eskore.com');
      }
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
      alert(`Please manually copy this error information:\n\n${errorInfo}`);
    }
  }, [errorType, retryCount]);

  /**
   * Get help URL based on error type
   */
  const getHelpUrl = useCallback((type) => {
    const helpUrls = {
      [ERROR_TYPES.NETWORK]: '/help/network-issues',
      [ERROR_TYPES.PERMISSION]: '/help/permissions',
      [ERROR_TYPES.NOT_FOUND]: '/help/navigation',
      [ERROR_TYPES.SERVER]: '/help/server-issues',
      [ERROR_TYPES.TIMEOUT]: '/help/performance',
      [ERROR_TYPES.VALIDATION]: '/help/data-validation',
      [ERROR_TYPES.AUTHENTICATION]: '/help/sign-in',
      [ERROR_TYPES.RATE_LIMIT]: '/help/rate-limits',
      [ERROR_TYPES.GENERIC]: '/help/general'
    };
    
    return helpUrls[type] || '/help';
  }, []);

  // Container classes
  const containerClasses = [
    'error-actions',
    `error-actions-${actionAlignment}`,
    `error-actions-${actionSize}`,
    isRetrying ? 'error-actions-retrying' : '',
    className
  ].filter(Boolean).join(' ');

  // If custom actions are provided, use them instead
  if (customActions) {
    return (
      <div className={containerClasses} role="group" aria-label={ariaLabel}>
        {customActions}
      </div>
    );
  }

  // Render default actions
  return (
    <div className={containerClasses} role="group" aria-label={ariaLabel}>
      {/* Primary Actions */}
      <div className="error-actions-primary">
        {/* Retry Button */}
        {canRetry && onRetry && (
          <RetryButton
            canRetry={canRetry}
            isRetrying={isRetrying}
            retryCount={retryCount}
            maxRetries={maxRetries}
            retryButtonText={retryButtonText}
            onRetry={onRetry}
            size={actionSize}
            errorType={errorType}
            disabled={isRetrying || retryCount >= maxRetries}
            aria-describedby="retry-description"
          />
        )}
        
        {/* Go Back Button */}
        {showGoBack && (
          <button 
            type="button"
            onClick={handleGoBack} 
            className="btn btn-secondary error-back-btn"
            aria-describedby="go-back-description"
            disabled={isRetrying}
          >
            <span className="btn-icon" aria-hidden="true">←</span>
            Go Back
          </button>
        )}
      </div>

      {/* Secondary Actions */}
      {(showHelp || showReport) && (
        <div className="error-actions-secondary">
          {/* Help Button */}
          {showHelp && (
            <button 
              type="button"
              onClick={handleHelp}
              className="btn btn-ghost error-help-btn"
              aria-describedby="help-description"
              disabled={isRetrying}
            >
              <span className="btn-icon" aria-hidden="true">?</span>
              Get Help
            </button>
          )}
          
          {/* Report Error Button */}
          {showReport && (
            <button 
              type="button"
              onClick={handleReport}
              className="btn btn-ghost error-report-btn"
              aria-describedby="report-description"
              disabled={isRetrying}
            >
              <span className="btn-icon" aria-hidden="true">📝</span>
              Report Issue
            </button>
          )}
        </div>
      )}

      {/* Accessibility descriptions */}
      <div className="sr-only">
        <div id="retry-description">
          {canRetry 
            ? `Retry the failed operation. Attempt ${retryCount + 1} of ${maxRetries}.`
            : 'Retry is not available for this error type.'
          }
        </div>
        <div id="go-back-description">
          Navigate back to the previous page or dashboard
        </div>
        <div id="help-description">
          Open help documentation for {errorType} errors
        </div>
        <div id="report-description">
          Send detailed error report to support team
        </div>
      </div>
    </div>
  );
});

// Display name for debugging
ErrorActions.displayName = 'ErrorActions';

// PropTypes
ErrorActions.propTypes = {
  errorType: PropTypes.oneOf(Object.values(ERROR_TYPES)),
  canRetry: PropTypes.bool,
  isRetrying: PropTypes.bool,
  retryCount: PropTypes.number,
  maxRetries: PropTypes.number,
  retryButtonText: PropTypes.string,
  showGoBack: PropTypes.bool,
  showHelp: PropTypes.bool,
  showReport: PropTypes.bool,
  onRetry: PropTypes.func,
  onGoBack: PropTypes.func,
  onHelp: PropTypes.func,
  onReport: PropTypes.func,
  customActions: PropTypes.node,
  actionAlignment: PropTypes.oneOf(['left', 'center', 'right']),
  actionSize: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  ariaLabel: PropTypes.string
};

export default ErrorActions;