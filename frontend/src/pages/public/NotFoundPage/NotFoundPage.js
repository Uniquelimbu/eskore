import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-code">404</div>
        <h1>Page Not Found</h1>
        <p>Sorry, the page you are looking for doesn't exist or has been moved.</p>
        
        <div className="not-found-actions">
          <Link to="/" className="home-button">
            Return to Home
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="dashboard-button">
              Go to Dashboard
            </Link>
          )}
        </div>
        
        <div className="not-found-help">
          <p>Looking for something specific?</p>
          <ul>
            <li><Link to="/">Home Page</Link></li>
            {isAuthenticated ? (
              <li><Link to="/dashboard">Dashboard</Link></li>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Sign Up</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
