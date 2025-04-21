import React from 'react';
import './LoadingFallback.css';

const LoadingFallback = () => {
  return (
    <div className="loading-fallback" aria-live="polite">
      <div className="loading-spinner"></div>
      <p>Loading content...</p>
    </div>
  );
};

export default LoadingFallback;
