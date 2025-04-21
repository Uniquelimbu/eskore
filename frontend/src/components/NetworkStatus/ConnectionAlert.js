import React, { useState, useEffect } from 'react';
import { useConnection } from '../../context/ConnectionContext';
import './ConnectionAlert.css';

function ConnectionAlert() {
  const { isOnline, apiAvailable, checkApiConnection } = useConnection();
  const [visible, setVisible] = useState(false);
  
  // Show alert when offline or API is not available
  useEffect(() => {
    if (!isOnline || !apiAvailable) {
      setVisible(true);
    } else {
      // Hide after a short delay to ensure the user sees the "back online" message
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, apiAvailable]);
  
  // Don't render anything if everything is working fine and the alert is not visible
  if (!visible) return null;
  
  return (
    <div className={`connection-alert ${isOnline ? (apiAvailable ? 'online' : 'api-offline') : 'offline'}`}>
      {!isOnline ? (
        <>
          <span className="alert-icon">⚠️</span>
          <span className="alert-message">You are offline. Some features may not work.</span>
        </>
      ) : !apiAvailable ? (
        <>
          <span className="alert-icon">⚠️</span>
          <span className="alert-message">Can't connect to server. Please try again later.</span>
          <button className="retry-button" onClick={() => checkApiConnection(true)}>
            Retry
          </button>
        </>
      ) : (
        <>
          <span className="alert-icon">✓</span>
          <span className="alert-message">Connection restored!</span>
        </>
      )}
    </div>
  );
}

export default ConnectionAlert;
