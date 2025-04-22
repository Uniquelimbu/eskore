import React from 'react';
import './Loading.css';

const Loading = ({ size = 'medium', message = 'Loading...', fullPage = false }) => {
  const sizeClass = {
    small: 'loading-spinner-sm',
    medium: 'loading-spinner-md',
    large: 'loading-spinner-lg'
  }[size] || 'loading-spinner-md';
  
  const loadingElement = (
    <div className={`loading-container ${fullPage ? 'full-page' : ''}`} role="status">
      <div className={`loading-spinner ${sizeClass}`}></div>
      {message && <p className="loading-message">{message}</p>}
      <span className="sr-only">Loading</span>
    </div>
  );
  
  return loadingElement;
};

export default Loading;
