import React from 'react';
import PropTypes from 'prop-types';
import './ErrorFallback.css';

/**
 * Component to display when an error occurs
 */
const ErrorFallback = ({ error, resetErrorBoundary, isInline = false }) => {
  return (
    <div className={`error-fallback ${isInline ? 'error-fallback--inline' : ''}`}>
      <div className="error-fallback__icon">⚠️</div>
      <h2 className="error-fallback__title">Something went wrong</h2>
      <p className="error-fallback__message">
        {error?.message || "An unexpected error occurred"}
      </p>
      {resetErrorBoundary && (
        <button 
          onClick={resetErrorBoundary}
          className="error-fallback__button"
        >
          Try again
        </button>
      )}
    </div>
  );
};

ErrorFallback.propTypes = {
  error: PropTypes.object,
  resetErrorBoundary: PropTypes.func,
  isInline: PropTypes.bool
};

export default ErrorFallback;
