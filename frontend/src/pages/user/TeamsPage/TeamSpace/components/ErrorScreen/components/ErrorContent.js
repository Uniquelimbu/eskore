/**
 * ErrorContent Component
 * Displays error content with proper typography and accessibility
 */

import React, { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ERROR_TYPES } from '../constants';
import './ErrorContent.css'; // Import CSS file instead of styled-jsx

/**
 * ErrorContent component for displaying error information
 */
const ErrorContent = memo(({
  title = null,
  description = null,
  error = null,
  errorId = null,
  errorType = ERROR_TYPES.GENERIC,
  showErrorId = true,
  showRetryInfo = false,
  showDetails = false,
  retryCount = 0,
  maxRetries = 0,
  onToggleDetails = null,
  className = "",
  titleId = null,
  descriptionId = null
}) => {
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  /**
   * Handle details toggle
   */
  const handleToggleDetails = useCallback(() => {
    const newExpanded = !detailsExpanded;
    setDetailsExpanded(newExpanded);
    
    if (onToggleDetails) {
      onToggleDetails(newExpanded);
    }
  }, [detailsExpanded, onToggleDetails]);

  /**
   * Format error details for display
   */
  const formatErrorDetails = useCallback(() => {
    if (!error) return 'No error details available';
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
        name: error.name
      };
    }
    
    return error;
  }, [error]);

  // Generate unique IDs for accessibility
  const errorTitleId = titleId || `error-title-${errorId || Date.now()}`;
  const errorDescriptionId = descriptionId || `error-description-${errorId || Date.now()}`;
  const errorDetailsId = `error-details-${errorId || Date.now()}`;

  // Default error messages
  const defaultMessages = {
    [ERROR_TYPES.NETWORK]: {
      title: 'Connection Error',
      description: 'Unable to connect to the server. Please check your internet connection.'
    },
    [ERROR_TYPES.PERMISSION]: {
      title: 'Access Denied',
      description: 'You don\'t have permission to access this resource.'
    },
    [ERROR_TYPES.NOT_FOUND]: {
      title: 'Not Found',
      description: 'The requested resource could not be found.'
    },
    [ERROR_TYPES.SERVER]: {
      title: 'Server Error',
      description: 'An internal server error occurred. Please try again later.'
    },
    [ERROR_TYPES.TIMEOUT]: {
      title: 'Request Timeout',
      description: 'The request took too long to complete. Please try again.'
    },
    [ERROR_TYPES.VALIDATION]: {
      title: 'Validation Error',
      description: 'The submitted data contains errors. Please check and try again.'
    },
    [ERROR_TYPES.GENERIC]: {
      title: 'An Error Occurred',
      description: 'Something went wrong. Please try again.'
    }
  };

  const defaultMessage = defaultMessages[errorType] || defaultMessages[ERROR_TYPES.GENERIC];
  const displayTitle = title || defaultMessage.title;
  const displayDescription = description || defaultMessage.description;

  // Container classes
  const containerClasses = [
    'error-content',
    `error-content-${errorType}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} role="main">
      {/* Error Title */}
      <h2 
        id={errorTitleId}
        className="error-title"
        role="heading"
        aria-level="1"
      >
        {displayTitle}
      </h2>
      
      {/* Error Description */}
      <div 
        id={errorDescriptionId}
        className="error-description"
        role="region"
        aria-labelledby={errorTitleId}
      >
        <p>{displayDescription}</p>
        
        {/* Additional error message */}
        {error && typeof error === 'string' && error !== displayDescription && (
          <p className="error-message">
            {error}
          </p>
        )}
      </div>

      {/* Error ID and Metadata */}
      {(showErrorId || showRetryInfo) && (
        <div className="error-metadata">
          {/* Error ID for support */}
          {showErrorId && errorId && (
            <div className="error-id">
              <small>
                <strong>Error ID:</strong> 
                <code 
                  className="error-id-code"
                  title="Reference this ID when contacting support"
                >
                  {errorId}
                </code>
              </small>
            </div>
          )}

          {/* Retry information */}
          {showRetryInfo && retryCount > 0 && (
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
      )}

      {/* Error Details Toggle */}
      {showDetails && error && (
        <div className="error-details-section">
          <button
            type="button"
            className="error-details-toggle"
            onClick={handleToggleDetails}
            aria-expanded={detailsExpanded}
            aria-controls={errorDetailsId}
            aria-describedby="details-help-text"
          >
            {detailsExpanded ? '▼' : '▶'} Technical Details
          </button>
          
          <div 
            id="details-help-text" 
            className="sr-only"
          >
            Shows detailed error information for debugging purposes
          </div>

          {/* Expandable Details */}
          {detailsExpanded && (
            <div 
              id={errorDetailsId}
              className="error-details"
              role="region"
              aria-labelledby="error-details-toggle"
            >
              <div className="error-details-content">
                <h3>Error Information</h3>
                <pre className="error-details-text">
                  {typeof formatErrorDetails() === 'object' 
                    ? JSON.stringify(formatErrorDetails(), null, 2)
                    : formatErrorDetails()
                  }
                </pre>
                
                <div className="error-context">
                  <h4>Context</h4>
                  <ul>
                    <li><strong>Error Type:</strong> {errorType}</li>
                    <li><strong>Timestamp:</strong> {new Date().toISOString()}</li>
                    <li><strong>User Agent:</strong> {navigator.userAgent}</li>
                    <li><strong>Page URL:</strong> {window.location.href}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// Display name for debugging
ErrorContent.displayName = 'ErrorContent';

// PropTypes
ErrorContent.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  errorId: PropTypes.string,
  errorType: PropTypes.oneOf(Object.values(ERROR_TYPES)),
  showErrorId: PropTypes.bool,
  showRetryInfo: PropTypes.bool,
  showDetails: PropTypes.bool,
  retryCount: PropTypes.number,
  maxRetries: PropTypes.number,
  onToggleDetails: PropTypes.func,
  className: PropTypes.string,
  titleId: PropTypes.string,
  descriptionId: PropTypes.string
};

export default ErrorContent;