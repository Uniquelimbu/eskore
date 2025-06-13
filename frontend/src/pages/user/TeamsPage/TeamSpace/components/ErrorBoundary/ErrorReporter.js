import { trackError, reportToSentry, reportToEndpoint } from './utils/errorTracking';

/**
 * Error Reporter Class
 * Handles error reporting to multiple services and user feedback
 */
class ErrorReporter {
  constructor(options = {}) {
    this.options = {
      endpoint: null,
      enableSentry: true,
      enableConsoleLog: true,
      enableAnalytics: true,
      ...options
    };

    this.ensureAnimationsExist();
  }

  /**
   * Ensure CSS animations are available
   */
  ensureAnimationsExist() {
    if (!document.querySelector('#error-reporter-animations')) {
      const style = document.createElement('style');
      style.id = 'error-reporter-animations';
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Report error to all configured services
   * @param {Object} errorDetails - Detailed error information
   * @param {string} eventId - Unique event identifier
   */
  async report(errorDetails, eventId) {
    try {
      // Console logging (development)
      if (this.options.enableConsoleLog) {
        console.error('TeamSpace Error Boundary Details:', errorDetails);
      }

      // Analytics tracking
      if (this.options.enableAnalytics) {
        trackError(errorDetails, eventId);
      }

      // Sentry reporting
      if (this.options.enableSentry && window.Sentry) {
        reportToSentry(errorDetails, eventId);
      }

      // Custom endpoint reporting
      if (this.options.endpoint) {
        await reportToEndpoint(this.options.endpoint, errorDetails, eventId);
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  /**
   * Generate user-friendly error report
   * @param {Error} error - The original error
   * @param {Object} errorInfo - React error info
   * @param {string} eventId - Event identifier
   */
  generateUserReport(error, errorInfo, eventId) {
    const errorReport = {
      eventId,
      error: error?.toString(),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Try to copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
        .then(() => {
          this.showUserFeedback('Error report copied to clipboard. Please paste it when contacting support.');
        })
        .catch(() => {
          this.showErrorReportModal(errorReport);
        });
    } else {
      this.showErrorReportModal(errorReport);
    }
  }

  /**
   * Show user feedback message
   * @param {string} message - Message to display
   */
  showUserFeedback(message) {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.className = 'error-reporter-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4a6cf7;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      max-width: 350px;
      animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
  }

  /**
   * Show error report in a modal
   * @param {Object} errorReport - Error report object
   */
  showErrorReportModal(errorReport) {
    const reportText = JSON.stringify(errorReport, null, 2);
    
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 600px;
      max-height: 80vh;
      overflow: auto;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    `;

    const title = document.createElement('h3');
    title.textContent = 'Error Report';
    title.style.cssText = 'margin: 0 0 16px 0; color: #333;';

    const description = document.createElement('p');
    description.textContent = 'Please copy this error report and send it to support:';
    description.style.cssText = 'margin: 0 0 16px 0; color: #666;';

    const textarea = document.createElement('textarea');
    textarea.value = reportText;
    textarea.readOnly = true;
    textarea.style.cssText = `
      width: 100%;
      height: 300px;
      font-family: monospace;
      font-size: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 16px;
      resize: vertical;
      color: #333;
    `;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.cssText = `
      background: #4a6cf7;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;

    closeButton.onclick = () => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    };

    // Assemble modal
    modal.appendChild(title);
    modal.appendChild(description);
    modal.appendChild(textarea);
    modal.appendChild(closeButton);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Select text for easy copying
    textarea.select();
    textarea.focus();

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeButton.click();
      }
    });

    // Close on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeButton.click();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }
}

export default ErrorReporter;