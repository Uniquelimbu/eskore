import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import Notifications from './components/ui/Notifications/Notifications';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  const [appReady, setAppReady] = useState(false);
  
  // Handle initial loader removal with improved transition
  useEffect(() => {
    // Ensure critical resources are loaded before removing loader
    const preloadAssets = async () => {
      // Simulate checking if critical resources are loaded
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mark app as ready to initiate transition
      setAppReady(true);
      
      // Get the loader element
      const initialLoader = document.getElementById('initial-loader');
      if (!initialLoader) return;
      
      // Start transition
      initialLoader.classList.add('hide');
      
      // Remove loader after transition completes
      setTimeout(() => {
        if (initialLoader.parentNode) {
          initialLoader.parentNode.removeChild(initialLoader);
        }
      }, 500);
    };
    
    preloadAssets();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              <div className={`App ${appReady ? 'app-ready' : ''}`}>
                <AppRoutes />
                <Notifications />
              </div>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
