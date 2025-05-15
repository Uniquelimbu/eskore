import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import Notifications from './components/ui/Notifications/Notifications';
import AppRoutes from './routes/AppRoutes';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
// Remove this import as we'll handle the TabDetailPage within TeamSpace
// import TabDetailPage from './pages/user/TeamsPage/TeamSpace/TabDetailPage';

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
                {/* Remove the duplicated Routes */}
                <Notifications />
              </div>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </Router>
      <ToastContainer position="top-right" autoClose={5000} />
    </ErrorBoundary>
  );
}

export default App;
