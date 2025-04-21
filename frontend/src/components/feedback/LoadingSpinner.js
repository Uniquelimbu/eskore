import React from 'react';

/**
 * A reusable loading spinner component for displaying loading states
 * @param {Object} props - Component props
 * @param {string} [props.size='medium'] - Size of the spinner ('small', 'medium', 'large')
 * @param {string} [props.text='Loading...'] - Text to display below the spinner
 * @param {boolean} [props.fullScreen=false] - Whether to display the spinner in full screen mode
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Loading...', 
  fullScreen = false 
}) => {
  const sizeClass = {
    small: 'loading-spinner--small',
    medium: 'loading-spinner--medium',
    large: 'loading-spinner--large',
  }[size] || 'loading-spinner--medium';

  const containerClass = fullScreen ? 'loading-container loading-container--fullscreen' : 'loading-container';

  return (
    <div className={containerClass}>
      <div className={`loading-spinner ${sizeClass}`}></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;