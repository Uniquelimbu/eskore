/**
 * Error Tracking Utilities
 * Handles integration with external error tracking services
 */

/**
 * Track error to analytics
 * @param {Object} errorDetails - Error details
 * @param {string} eventId - Event identifier
 */
export const trackError = (errorDetails, eventId) => {
  if (window.gtag) {
    window.gtag('event', 'exception', {
      description: errorDetails.error,
      fatal: false,
      custom_map: {
        event_id: eventId,
        component: 'TeamSpace',
        section: errorDetails.section || 'unknown'
      }
    });
  }
};

/**
 * Report error to Sentry
 * @param {Object} errorDetails - Error details
 * @param {string} eventId - Event identifier
 */
export const reportToSentry = (errorDetails, eventId) => {
  if (window.Sentry) {
    window.Sentry.captureException(new Error(errorDetails.error), {
      tags: {
        component: 'TeamSpace',
        section: errorDetails.section || 'unknown',
        event_id: eventId
      },
      extra: errorDetails,
      level: 'error'
    });
  }
};

/**
 * Report error to custom endpoint
 * @param {string} endpoint - API endpoint
 * @param {Object} errorDetails - Error details
 * @param {string} eventId - Event identifier
 */
export const reportToEndpoint = async (endpoint, errorDetails, eventId) => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...errorDetails,
        eventId,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to report error to endpoint:', error);
    throw error;
  }
};

/**
 * Initialize error tracking
 * @param {Object} config - Configuration options
 */
export const initializeErrorTracking = (config = {}) => {
  // Set up global error handlers
  window.addEventListener('error', (event) => {
    const errorDetails = {
      error: event.error?.toString() || event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      type: 'javascript_error'
    };

    if (config.trackGlobalErrors) {
      trackError(errorDetails, `global_${Date.now()}`);
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const errorDetails = {
      error: event.reason?.toString() || 'Unhandled Promise Rejection',
      stack: event.reason?.stack,
      type: 'unhandled_promise_rejection'
    };

    if (config.trackPromiseRejections) {
      trackError(errorDetails, `promise_${Date.now()}`);
    }
  });
};