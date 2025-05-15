import React, { useState, useEffect } from 'react';
import './ErrorFallback.css';

/**
 * Component to display when a network error occurs
 * Includes automatic retry with visual countdown
 */
const NetworkErrorFallback = ({ error, onRetry }) => {
  const [countdown, setCountdown] = useState(30);
  const [autoRetrying, setAutoRetrying] = useState(false);
  
  // Start countdown for auto-retry
  useEffect(() => {
    if (!autoRetrying) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onRetry) onRetry();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [autoRetrying, onRetry]);
  
  // Start auto retry on mount
  useEffect(() => {
    setAutoRetrying(true);
  }, []);
  
  // Determine if error is a network error
  const isNetworkError = 
    error?.code === 'NETWORK_ERROR' || 
    error?.code === 'CIRCUIT_OPEN' ||
    error?.message?.includes('Network');
  
  return (
    <div className="error-fallback error-fallback--network">
      <div className="error-fallback__icon">📡</div>
      <h2 className="error-fallback__title">
        {isNetworkError ? 'Connection Error' : 'Something went wrong'}
      </h2>
      <p className="error-fallback__message">
        {isNetworkError 
          ? "We can't reach the server right now. Please check your internet connection and the server status."
          : (error?.message || "An unexpected error occurred")}
      </p>
      
      {autoRetrying && (
        <div className="error-fallback__auto-retry">
          <div className="error-fallback__progress">
            <div 
              className="error-fallback__progress-bar" 
              style={{ width: `${(countdown / 30) * 100}%` }}
            ></div>
          </div>
          <p>Reconnecting in {countdown}s</p>
        </div>
      )}
      
      <div className="error-fallback__actions">
        <button 
          onClick={() => {
            setAutoRetrying(false);
            if (onRetry) onRetry();
          }}
          className="error-fallback__button"
        >
          Try again now
        </button>
        
        {autoRetrying ? (
          <button 
            onClick={() => setAutoRetrying(false)}
            className="error-fallback__button error-fallback__button--secondary"
          >
            Cancel auto-retry
          </button>
        ) : (
          <button 
            onClick={() => {
              setAutoRetrying(true);
              setCountdown(30);
            }}
            className="error-fallback__button error-fallback__button--secondary"
          >
            Enable auto-retry
          </button>
        )}
      </div>
    </div>
  );
};

export default NetworkErrorFallback;
