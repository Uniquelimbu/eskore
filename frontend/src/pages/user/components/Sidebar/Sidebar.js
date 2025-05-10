import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/dashboard') {
      window.location.reload();
    } else {
      navigate('/dashboard');
    }
  };

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
          <li>
            <NavLink to="/dashboard" end>
              <span role="img" aria-label="Home" className="sidebar-nav-icon">🏠</span>
              <span className="sidebar-nav-label">Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/teams">
              <span role="img" aria-label="Team" className="sidebar-nav-icon">👥</span>
              <span className="sidebar-nav-label">Team</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/search">
              <span role="img" aria-label="Search" className="sidebar-nav-icon">🔍</span>
              <span className="sidebar-nav-label">Search</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/news">
              <span role="img" aria-label="News" className="sidebar-nav-icon">📰</span>
              <span className="sidebar-nav-label">News</span>
            </NavLink>
          </li>
          {/* Profile link is now handled by the top navbar dropdown */}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
