import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import UserMenu from './UserMenu';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          eSkore
        </Link>
        
        <div className="navbar-links">
          {/* ...existing code... */}
        </div>
        
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-login-btn">Log In</Link>
              <Link to="/register" className="navbar-signup-btn">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
