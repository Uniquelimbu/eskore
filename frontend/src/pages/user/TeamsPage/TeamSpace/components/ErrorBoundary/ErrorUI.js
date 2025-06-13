import React from 'react';
import PropTypes from 'prop-types';

/**
 * Error UI Component
 * Renders the error boundary fallback UI
 */
const ErrorUI = ({
  error,
  errorInfo,
  eventId,
  onRetry,
  onReportError,
  onGoBack,
  showDetails = false,
  customErrorMessage = null,
  hideRetry = false,
  hideReport = false,
  hideGoBack = false
}) => {
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
                  onClick={onRetry} 
                  className="btn btn-primary error-btn"
                >
                  Try Again
                </button>
              )}
              
              {!hideGoBack && (
                <button 
                  onClick={onGoBack} 
                  className="btn btn-secondary error-btn"
                >
                  Go Back
                </button>
              )}
              
              {!hideReport && (
                <button 
                  onClick={onReportError} 
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

      {/* Error UI Styles */}
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
};

ErrorUI.propTypes = {
  error: PropTypes.object,
  errorInfo: PropTypes.object,
  eventId: PropTypes.string,
  onRetry: PropTypes.func.isRequired,
  onReportError: PropTypes.func.isRequired,
  onGoBack: PropTypes.func.isRequired,
  showDetails: PropTypes.bool,
  customErrorMessage: PropTypes.string,
  hideRetry: PropTypes.bool,
  hideReport: PropTypes.bool,
  hideGoBack: PropTypes.bool
};

export default ErrorUI;