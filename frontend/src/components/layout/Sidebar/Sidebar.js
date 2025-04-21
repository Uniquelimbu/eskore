import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../features/auth/context/AuthContext';
import './Sidebar.css';
import { eskore_logo } from '../../../assets';

// SVG Icons for navigation items (excluding athlete icons which are now in athleteNavigation.js)
const icons = {
  home: (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  ),
  matches: (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polygon points="10 8 16 12 10 16 10 8"></polygon>
    </svg>
  ),
  teams: (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  stats: (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10"></path>
      <path d="M12 20V4"></path>
      <path d="M6 20v-6"></path>
    </svg>
  ),
  leagues: (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  shop: (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
  ),
  dashboard: (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9"></rect>
      <rect x="14" y="3" width="7" height="5"></rect>
      <rect x="14" y="12" width="7" height="9"></rect>
      <rect x="3" y="16" width="7" height="5"></rect>
    </svg>
  ),
  athleteStats: (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  training: (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
      <line x1="6" y1="1" x2="6" y2="4"></line>
      <line x1="10" y1="1" x2="10" y2="4"></line>
      <line x1="14" y1="1" x2="14" y2="4"></line>
    </svg>
  ),
  nutrition: (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8c0-3.3-2.7-6-6-6S6 4.7 6 8c0 7 6 13 6 13s6-6 6-13z"></path>
      <circle cx="12" cy="8" r="2"></circle>
    </svg>
  )
};

function Sidebar({ className = '', userRole = 'user' }) {
  const { user, logout } = useAuth();
  
  // Custom navigation items based on user role - simplified approach
  const getNavigationItems = () => {
    // Treat admins as athletes for navigation purposes
    if (userRole === 'admin' || userRole === 'athlete_admin' || userRole === 'athlete') {
      return [
        { path: '/athlete/home', name: 'Dashboard', icon: icons.dashboard },
        { path: '/athlete/profile', name: 'Profile', icon: icons.profile },
        { path: '/athlete/stats', name: 'Stats', icon: icons.stats },
        { path: '/athlete/matches', name: 'Matches', icon: icons.matches },
        { path: '/athlete/teams', name: 'Teams', icon: icons.teams },
        { path: '/athlete/settings', name: 'Settings', icon: icons.settings },
      ];
    }
    
    // Manager navigation
    if (userRole === 'manager') {
      return [
        { path: '/manager/home', name: 'Dashboard', icon: icons.dashboard },
        { path: '/manager/teams', name: 'Teams', icon: icons.teams },
        { path: '/manager/matches', name: 'Matches', icon: icons.matches },
        { path: '/manager/profile', name: 'My Profile', icon: icons.profile },
        { path: '/manager/settings', name: 'Settings', icon: icons.settings },
      ];
    }
    
    // Team navigation
    if (userRole === 'team') {
      return [
        { path: '/team/home', name: 'Dashboard', icon: icons.dashboard },
        { path: '/team/matches', name: 'Matches', icon: icons.matches },
        { path: '/team/players', name: 'Players', icon: icons.teams },
        { path: '/team/profile', name: 'Team Profile', icon: icons.profile },
        { path: '/team/settings', name: 'Settings', icon: icons.settings },
      ];
    }
    
    // Default to public navigation for non-logged in users
    return [
      { path: '/', name: 'Home', icon: icons.home },
      { path: '/matches', name: 'Matches', icon: icons.matches },
      { path: '/teams', name: 'Teams', icon: icons.teams },
      { path: '/leagues', name: 'Leagues', icon: icons.leagues }
    ];
  };
  
  // Get navigation items based on role
  const navigationItems = getNavigationItems();
  
  // No need for separate authenticated items since they're included in role-specific navigation
  const allNavigationItems = navigationItems;
  
  return (
    <aside className={`sidebar ${className}`}>
      {/* Logo */}
      <div className="sidebar-header">
        <NavLink to="/" className="sidebar-logo">
          <img src={eskore_logo} alt="eSkore Logo" />
          <span>eSkore</span>
        </NavLink>
      </div>
      
      {/* Navigation Items */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {allNavigationItems.map((item, index) => (
            <li key={index} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User section at bottom */}
      {user && (
        <div className="sidebar-footer">
          <div className="user-section">
            <div className="user-avatar">
              {user.firstName ? user.firstName.charAt(0) : 'A'}
            </div>
            <div className="user-info">
              <p className="user-name">{user.firstName || 'Athlete'}</p>
              <button className="logout-button" onClick={logout}>
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
