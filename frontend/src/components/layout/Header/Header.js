import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { eskore_logo } from '../../../assets';
import './Header.css';

function Header() {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isRolePage = location.pathname === '/role-selection';
  const isHomePage = location.pathname === '/';
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Don't render header on login/registration pages
  if (isLoginPage || isRolePage) return null;

  return (
    <header className={`main-header ${isScrolled ? 'scrolled' : ''} ${isHomePage ? 'home-header' : ''}`}>
      <div className="header-container">
        {/* Logo on the left */}
        <div className="header-left">
          <Link to={user ? (user.role === 'athlete' || user.role === 'athlete_admin' ? '/athlete/home' : '/') : '/'} className="header-logo-link">
            <img 
              src={eskore_logo} 
              alt="eSkore Logo" 
              className="header-logo-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/images/logo/eskore-logo.png';
              }}
            />
            <span className="header-logo-text">eSkore</span>
          </Link>
        </div>
        
        {/* Actions on the right */}
        <div className="header-right">
          {!user && (
            <div className={`header-actions ${isHomePage && !isScrolled ? 'hidden-until-scroll' : ''}`}>
              {/* Replaced the login button with just the Get Started button */}
              <Link to="/role-selection" className="header-cta-button">
                Get Started
              </Link>
            </div>
          )}
          
          {user && (
            <div className="header-actions user-actions">
              <div className="user-info">
                {user.firstName ? 
                  `Welcome, ${user.firstName}` : 
                  user.email ? `Welcome, ${user.email.split('@')[0]}` : 
                  'Welcome'
                }
              </div>
              <Link 
                to={user.role === 'athlete' || user.role === 'athlete_admin' ? 
                  "/athlete/profile" : "/profile"} 
                className="header-profile-link"
              >
                <div className="header-avatar">
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : 
                   user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
