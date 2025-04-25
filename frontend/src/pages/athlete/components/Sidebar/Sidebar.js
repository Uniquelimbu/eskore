import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const moreBtnRef = useRef(null);
  const optionsMenuRef = useRef(null);

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/dashboard') {
      window.location.reload();
    } else {
      navigate('/dashboard');
    }
  };

  const toggleOptions = () => {
    setIsOptionsOpen(!isOptionsOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleHelp = () => {
    navigate('/help'); // Or your help route
    setIsOptionsOpen(false);
  };

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(event.target) &&
        moreBtnRef.current &&
        !moreBtnRef.current.contains(event.target)
      ) {
        setIsOptionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <NavLink
          to="/dashboard"
          className="sidebar-logo-link sidebar-logo-refresh"
          onClick={handleLogoClick}
          tabIndex={0}
          draggable={false}
        >
          {/* Update the src attribute to use PUBLIC_URL */}
          <img
            src={`${process.env.PUBLIC_URL}/images/logos/eskore-logo.png`}
            alt="eSkore Logo"
            className="sidebar-logo"
            draggable={false}
          />
          <span className="sidebar-logo-text">eSkore</span>
        </NavLink>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {/* Replace Link with NavLink */}
          <li>
            <NavLink to="/dashboard" end> {/* 'end' prop ensures exact match for root path */}
              <span role="img" aria-label="Home" className="sidebar-nav-icon">🏠</span>
              <span className="sidebar-nav-label">Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile">
              <span role="img" aria-label="Profile" className="sidebar-nav-icon">👤</span>
              <span className="sidebar-nav-label">Profile</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/practice">
              <span role="img" aria-label="Practice" className="sidebar-nav-icon">🏋️‍♂️</span>
              <span className="sidebar-nav-label">Practice</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/leaderboards">
              <span role="img" aria-label="Leaderboards" className="sidebar-nav-icon">🏆</span>
              <span className="sidebar-nav-label">Leaderboards</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/search">
              <span role="img" aria-label="Search" className="sidebar-nav-icon">🔍</span>
              <span className="sidebar-nav-label">Search</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/shop">
              <span role="img" aria-label="Shop" className="sidebar-nav-icon">🛒</span>
              <span className="sidebar-nav-label">Shop</span>
            </NavLink>
          </li>
          {/* More button remains a button, not a NavLink */}
          <li className="sidebar-more-btn">
            <button
              className="sidebar-more-button"
              onClick={toggleOptions}
              aria-label="More"
              aria-expanded={isOptionsOpen}
              ref={moreBtnRef}
            >
              <span
                className="sidebar-nav-icon"
                aria-label="More"
              >•••</span>
              <span className="sidebar-nav-label">More</span>
            </button>
            {isOptionsOpen && (
              <div className="options-menu" ref={optionsMenuRef}>
                <button onClick={handleHelp} className="options-menu-item">
                  <span role="img" aria-label="Help">❓</span> Help
                </button>
                <button onClick={handleLogout} className="options-menu-item options-menu-item--logout">
                  <span role="img" aria-label="Logout">🚪</span> Log Out
                </button>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
