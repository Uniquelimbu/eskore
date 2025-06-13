import React from 'react';
import TeamSpaceErrorBoundary from './TeamSpaceErrorBoundary';

/**
 * Higher-order component for wrapping components with error boundary
 * @param {React.Component} WrappedComponent - Component to wrap
 * @param {Object} errorBoundaryProps - Props to pass to error boundary
 * @returns {React.Component} Wrapped component with error boundary
 */
const withErrorBoundary = (WrappedComponent, errorBoundaryProps = {}) => {
  const WithErrorBoundary = (props) => (
    <TeamSpaceErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </TeamSpaceErrorBoundary>
  );

  WithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithErrorBoundary;
};

export default withErrorBoundary;

// Convenience exports for common use cases
export const withTeamSpaceErrorBoundary = withErrorBoundary;

export const withRetryableErrorBoundary = (WrappedComponent, onRetry) => 
  withErrorBoundary(WrappedComponent, { onRetry });

export const withCustomErrorMessage = (WrappedComponent, customErrorMessage) => 
  withErrorBoundary(WrappedComponent, { customErrorMessage });