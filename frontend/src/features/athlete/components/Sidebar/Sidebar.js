import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../../features/auth/context/AuthContext';
import { getAthleteNavigationItems } from '../../navigation/navigation';
import { eskore_logo } from '../../../../assets';
import './Sidebar.css';

/**
 * Athlete-specific sidebar navigation component
 * This is a specialized version of the sidebar specifically for athletes
 */
function Sidebar({ className = '' }) {
  const { user, logout } = useAuth();
  const navigationItems = getAthleteNavigationItems();
  
  // Get initial for user avatar
  const getInitial = () => {
    if (user?.firstName) return user.firstName.charAt(0);
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'A';
  };
  
  return (
    <aside className={`athlete-sidebar ${className}`}>
      {/* Logo */}
      <div className="sidebar-header">
        <NavLink to="/athlete/home" className="sidebar-logo">
          <img src={eskore_logo} alt="eSkore Logo" />
          <span>eSkore</span>
        </NavLink>
      </div>
      
      {/* Navigation Items */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navigationItems.map((item, index) => (
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
              {getInitial()}
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
