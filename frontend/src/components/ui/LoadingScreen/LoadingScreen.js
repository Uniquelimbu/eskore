import React from 'react';
import './LoadingScreen.css';

/**
 * Full-page loading screen component
 * Used during authentication and initial data loading
 */
const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-screen">
      <div className="loading-screen-content">
        <div className="loading-spinner"></div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
