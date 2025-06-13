import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Industry-standard Error Boundary for TeamSpace
 * Catches JavaScript errors anywhere in the child component tree
 * Logs those errors and displays a fallback UI
 */
class TeamSpaceErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    };

    // Bind methods
    this.handleRetry = this.handleRetry.bind(this);
    this.handleReportError = this.handleReportError.bind(this);
    this.handleGoBack = this.handleGoBack.bind(this);
  }

  /**
   * Static method to derive state from error
   * @param {Error} error - The error that was thrown
   * @returns {Object} New state object
   */
  static getDerivedStateFromError(error) {
    console.error('TeamSpace Error Boundary: Error caught', error);
    
    return {
      hasError: true,
      error: error
    };
  }

  /**
   * Lifecycle method called when an error is caught
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - Object with componentStack key containing information about which component threw the error
   */
  componentDidCatch(error, errorInfo) {
    const errorDetails = {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.props.userId || 'unknown',
      teamId: this.props.teamId || 'unknown'
    };

    // Log to console
    console.error('TeamSpace Error Boundary Details:', errorDetails);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
      eventId: this.generateEventId()
    });

    // Report to error tracking service (if available)
    this.reportToErrorTracking(errorDetails);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorDetails);
    }
  }

  /**
   * Generate unique error event ID for tracking
   * @returns {string} Unique event ID
   */
  generateEventId() {
    return `ts_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Report error to external tracking service
   * @param {Object} errorDetails - Detailed error information
   */
  reportToErrorTracking(errorDetails) {
    // Integration with error tracking services like Sentry, LogRocket, etc.
    if (window.Sentry) {
      window.Sentry.captureException(errorDetails.error, {
        tags: {
          component: 'TeamSpace',
          section: this.props.section || 'unknown'
        },
        extra: errorDetails
      });
    }

    // Custom error reporting endpoint
    if (this.props.errorReportEndpoint) {
      fetch(this.props.errorReportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorDetails)
      }).catch(err => {
        console.error('Failed to report error:', err);
      });
    }
  }

  /**
   * Handle retry action
   */
  handleRetry() {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    });

    // Call custom retry handler if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  }

  /**
   * Handle error reporting action
   */
  handleReportError() {
    const { error, errorInfo, eventId } = this.state;
    
    // Create error report
    const errorReport = {
      eventId,
      error: error?.toString(),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      description: this.props.description || 'No description provided'
    };

    // Copy to clipboard for user to send
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
        .then(() => {
          alert('Error report copied to clipboard. Please paste it when contacting support.');
        })
        .catch(() => {
          // Fallback: show error report in modal
          this.showErrorReport(errorReport);
        });
    } else {
      this.showErrorReport(errorReport);
    }
  }

  /**
   * Show error report in a modal/alert
   * @param {Object} errorReport - Error report object
   */
  showErrorReport(errorReport) {
    const reportText = JSON.stringify(errorReport, null, 2);
    const textarea = document.createElement('textarea');
    textarea.value = reportText;
    textarea.style.position = 'fixed';
    textarea.style.top = '50%';
    textarea.style.left = '50%';
    textarea.style.transform = 'translate(-50%, -50%)';
    textarea.style.width = '80%';
    textarea.style.height = '60%';
    textarea.style.zIndex = '10000';
    textarea.style.background = 'white';
    textarea.style.color = 'black';
    textarea.style.padding = '20px';
    textarea.style.border = '2px solid #333';
    textarea.readOnly = true;
    
    document.body.appendChild(textarea);
    textarea.select();
    
    // Remove after 10 seconds
    setTimeout(() => {
      if (textarea.parentNode) {
        textarea.parentNode.removeChild(textarea);
      }
    }, 10000);
  }

  /**
   * Handle go back action
   */
  handleGoBack() {
    if (this.props.onGoBack) {
      this.props.onGoBack();
    } else {
      // Default behavior
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/teams';
      }
    }
  }

  /**
   * Render fallback UI when error occurs
   * @returns {JSX.Element} Error UI
   */
  renderErrorUI() {
    const { error, errorInfo, eventId } = this.state;
    const { 
      showDetails = process.env.NODE_ENV === 'development',
      customErrorMessage,
      hideRetry = false,
      hideReport = false,
      hideGoBack = false
    } = this.props;

    return (
      <div className="team-space-error-boundary">
        <div className="team-space-layout">
          <div className="team-space-container" style={{ paddingTop: 0 }}>
            <div className="error-container">
              {/* Error Icon */}
              <div className="error-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#e53e3e" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="#e53e3e" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="#e53e3e" strokeWidth="2"/>
                </svg>
              </div>

              {/* Error Message */}
              <h2>Oops! Something went wrong</h2>
              <p className="error-description">
                {customErrorMessage || 
                 'We encountered an unexpected error in the TeamSpace. Our team has been notified and is working on a fix.'}
              </p>

              {/* Error ID for support */}
              {eventId && (
                <div className="error-id">
                  <small>Error ID: <code>{eventId}</code></small>
                </div>
              )}

              {/* Error Details (Development) */}
              {showDetails && error && (
                <details className="error-details">
                  <summary>Technical Details (Development)</summary>
                  <div className="error-stack">
                    <h4>Error:</h4>
                    <pre>{error.toString()}</pre>
                    
                    {error.stack && (
                      <>
                        <h4>Stack Trace:</h4>
                        <pre>{error.stack}</pre>
                      </>
                    )}
                    
                    {errorInfo?.componentStack && (
                      <>
                        <h4>Component Stack:</h4>
                        <pre>{errorInfo.componentStack}</pre>
                      </>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="error-actions">
                {!hideRetry && (
                  <button 
                    onClick={this.handleRetry} 
                    className="btn btn-primary error-btn"
                  >
                    Try Again
                  </button>
                )}
                
                {!hideGoBack && (
                  <button 
                    onClick={this.handleGoBack} 
                    className="btn btn-secondary error-btn"
                  >
                    Go Back
                  </button>
                )}
                
                {!hideReport && (
                  <button 
                    onClick={this.handleReportError} 
                    className="btn btn-ghost error-btn"
                  >
                    Report Issue
                  </button>
                )}
              </div>

              {/* Additional Help */}
              <div className="error-help">
                <p>
                  If this problem persists, please contact support with the Error ID above.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Boundary Styles */}
        <style jsx>{`
          .team-space-error-boundary {
            width: 100%;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--bg-dark, #1a202c);
            color: var(--text-light, #e2e8f0);
          }

          .error-container {
            text-align: center;
            max-width: 600px;
            padding: 40px;
          }

          .error-icon {
            margin-bottom: 24px;
          }

          .error-container h2 {
            color: var(--danger-color, #e53e3e);
            font-size: 2rem;
            margin-bottom: 16px;
          }

          .error-description {
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 24px;
            color: var(--text-muted, #a0aec0);
          }

          .error-id {
            margin-bottom: 24px;
            padding: 12px;
            background-color: var(--secondary-color, #232b3a);
            border-radius: 6px;
            border: 1px solid var(--border-color, #2d3748);
          }

          .error-id code {
            font-family: monospace;
            font-size: 0.9rem;
            color: var(--primary-color, #4a6cf7);
          }

          .error-details {
            margin: 24px 0;
            text-align: left;
            background-color: var(--secondary-color, #232b3a);
            border: 1px solid var(--border-color, #2d3748);
            border-radius: 8px;
            padding: 16px;
          }

          .error-details summary {
            cursor: pointer;
            font-weight: 600;
            margin-bottom: 12px;
            color: var(--text-light, #e2e8f0);
          }

          .error-stack h4 {
            color: var(--danger-color, #e53e3e);
            margin-top: 16px;
            margin-bottom: 8px;
          }

          .error-stack pre {
            background-color: #1a1a1a;
            padding: 12px;
            border-radius: 4px;
            overflow-x: auto;
            font-size: 0.85rem;
            line-height: 1.4;
            color: #f8f8f2;
            border: 1px solid #333;
          }

          .error-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 24px;
          }

          .error-btn {
            min-width: 120px;
          }

          .error-help {
            padding-top: 24px;
            border-top: 1px solid var(--border-color, #2d3748);
          }

          .error-help p {
            font-size: 0.9rem;
            color: var(--text-muted, #a0aec0);
            margin: 0;
          }

          @media (max-width: 768px) {
            .error-container {
              padding: 20px;
            }

            .error-container h2 {
              font-size: 1.5rem;
            }

            .error-actions {
              flex-direction: column;
              align-items: center;
            }

            .error-btn {
              width: 100%;
              max-width: 200px;
            }
          }
        `}</style>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

// PropTypes for type checking
TeamSpaceErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onError: PropTypes.func,
  onRetry: PropTypes.func,
  onGoBack: PropTypes.func,
  showDetails: PropTypes.bool,
  customErrorMessage: PropTypes.string,
  hideRetry: PropTypes.bool,
  hideReport: PropTypes.bool,
  hideGoBack: PropTypes.bool,
  userId: PropTypes.string,
  teamId: PropTypes.string,
  section: PropTypes.string,
  description: PropTypes.string,
  errorReportEndpoint: PropTypes.string
};

// Default props
TeamSpaceErrorBoundary.defaultProps = {
  showDetails: process.env.NODE_ENV === 'development',
  hideRetry: false,
  hideReport: false,
  hideGoBack: false,
  section: 'unknown'
};

export default TeamSpaceErrorBoundary;

// Higher-order component for easy wrapping
export const withTeamSpaceErrorBoundary = (WrappedComponent, errorBoundaryProps = {}) => {
  const WithErrorBoundary = (props) => (
    <TeamSpaceErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </TeamSpaceErrorBoundary>
  );

  WithErrorBoundary.displayName = `withTeamSpaceErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithErrorBoundary;
};