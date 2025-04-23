import React from 'react';
import PropTypes from 'prop-types';
import ErrorFallback from '../ui/ErrorFallback/ErrorFallback';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to analytics or error tracking service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // If analytics service exists, report the error
    if (process.env.NODE_ENV === 'production' && this.props.reportError) {
      this.props.reportError(error, errorInfo);
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
          isInline={this.props.isInline}
        />
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onReset: PropTypes.func,
  reportError: PropTypes.func,
  isInline: PropTypes.bool
};

export default ErrorBoundary;
