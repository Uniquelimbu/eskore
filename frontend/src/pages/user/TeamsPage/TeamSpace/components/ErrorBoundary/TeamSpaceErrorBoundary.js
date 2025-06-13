import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ErrorReporter from './ErrorReporter';
import ErrorUI from './ErrorUI';
import { generateEventId, createErrorDetails } from './utils/errorUtils';
import { ERROR_TYPES } from './constants';

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
   * @param {Object} errorInfo - Object with componentStack key
   */
  componentDidCatch(error, errorInfo) {
    const eventId = generateEventId();
    const errorDetails = createErrorDetails(error, errorInfo, {
      userId: this.props.userId,
      teamId: this.props.teamId,
      section: this.props.section
    });

    // Update state with error info
    this.setState({
      error,
      errorInfo,
      eventId
    });

    // Report error
    if (this.errorReporter) {
      this.errorReporter.report(errorDetails, eventId);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorDetails);
    }
  }

  /**
   * Initialize error reporter
   */
  componentDidMount() {
    this.errorReporter = new ErrorReporter({
      endpoint: this.props.errorReportEndpoint,
      enableSentry: true,
      enableConsoleLog: process.env.NODE_ENV === 'development'
    });
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
    
    if (this.errorReporter) {
      this.errorReporter.generateUserReport(error, errorInfo, eventId);
    }
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

  render() {
    if (this.state.hasError) {
      return (
        <ErrorUI
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          eventId={this.state.eventId}
          onRetry={this.handleRetry}
          onReportError={this.handleReportError}
          onGoBack={this.handleGoBack}
          showDetails={this.props.showDetails}
          customErrorMessage={this.props.customErrorMessage}
          hideRetry={this.props.hideRetry}
          hideReport={this.props.hideReport}
          hideGoBack={this.props.hideGoBack}
        />
      );
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