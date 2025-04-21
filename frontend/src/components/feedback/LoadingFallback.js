import React from 'react';
import './LoadingFallback.css';

/**
 * Loading fallback component for Suspense boundaries
 * Shows a loading spinner with eSkore branding
 */
const LoadingFallback = () => {
  return (
    <div className="loading-fallback">
      <div className="loading-spinner"></div>
      <div className="loading-text">Loading...</div>
    </div>
  );
};

export default LoadingFallback;