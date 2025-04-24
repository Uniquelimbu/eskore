import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext'; // Correct path: four levels up
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth(); // Get logout function
  const navigate = useNavigate(); // Get navigate function
  const logoPath = `${process.env.PUBLIC_URL}/images/logos/eskore-logo.png`;
  const [isOptionsOpen, setIsOptionsOpen] = useState(false); // State for options menu

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login'); // Redirect to login after logout
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally show an error message to the user
    }
  };

  const toggleOptions = () => {
    setIsOptionsOpen(!isOptionsOpen);
  };

  // Placeholder for Help action
  const handleHelp = () => {
    console.log("Help button clicked");
    // Navigate to help page or open modal
    setIsOptionsOpen(false); // Close menu after action
  };


  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo-link">
          <img src={logoPath} alt="eSkore Logo" className="sidebar-logo" />
          <span className="sidebar-logo-text">eSkore</span>
        </Link>
      </div>
      <nav className="sidebar-nav">
        {/* Navigation Links Placeholder - Add links here later */}
        <ul>
          <li><Link to="/dashboard">Home</Link></li> {/* Renamed Dashboard to Home */}
          <li><Link to="/leaderboards">Leaderboards</Link></li> {/* Added Leaderboards */}
          {/* Add more links like Profile, Settings, etc. */}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="user-profile-area"> {/* Wrapper for profile and options */}
          <div className="user-profile">
            <div className="user-avatar">
              {/* Placeholder for avatar - replace with actual image later */}
              <span>{user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}</span>
            </div>
            <div className="user-info">
              <span className="user-name">{user?.firstName || user?.username || 'User'}</span>
              <span className="user-role">{user?.role || 'Athlete'}</span>
            </div>
          </div>
          <button className="options-toggle" onClick={toggleOptions} aria-label="Open user options" aria-expanded={isOptionsOpen}>
            ⋮ {/* Vertical ellipsis icon */}
          </button>
          {isOptionsOpen && (
            <div className="options-menu">
              <button onClick={handleHelp} className="options-menu-item">
                <span role="img" aria-label="Help">❓</span> Help
              </button>
              <button onClick={handleLogout} className="options-menu-item options-menu-item--logout">
                <span role="img" aria-label="Logout">🚪</span> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
