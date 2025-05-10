import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import './TopNavbar.css';

const TopNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);
  const chatRef = useRef(null);
  const chatButtonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle profile menu clicks outside
      if (
        isProfileMenuOpen &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
      
      // Handle chat panel clicks outside
      if (
        isChatOpen &&
        chatRef.current &&
        !chatRef.current.contains(event.target) &&
        chatButtonRef.current &&
        !chatButtonRef.current.contains(event.target)
      ) {
        setIsChatOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen, isChatOpen]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handle navigation to profile page
  const handleProfileClick = () => {
    navigate('/profile');
    setIsProfileMenuOpen(false);
  };

  // Handle navigation to help page
  const handleHelpClick = () => {
    navigate('/help');
    setIsProfileMenuOpen(false);
  };

  // Toggle profile dropdown menu
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    if (isChatOpen) setIsChatOpen(false);
  };

  // Toggle chat panel
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);
  };

  // Generate initials for avatar placeholder
  const getInitials = () => {
    if (!user) return "U";
    return `${(user.firstName || "").charAt(0)}${(user.lastName || "").charAt(0)}`.toUpperCase() || "U";
  };

  return (
    <div className="top-navbar">
      <div className="top-navbar-container">
        {/* Right section with action buttons */}
        <div className="top-navbar-right">
          {/* Chat button */}
          <button 
            className="top-navbar-button" 
            onClick={toggleChat}
            ref={chatButtonRef}
            aria-label="Chat"
            title="Chat"
          >
            <span className="top-navbar-icon">💬</span>
            <span className="notification-indicator"></span>
          </button>

          {/* Profile dropdown button */}
          <button 
            className="top-navbar-profile-button" 
            onClick={toggleProfileMenu}
            ref={profileButtonRef}
            aria-label="User menu"
            aria-expanded={isProfileMenuOpen}
          >
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt={`${user.firstName} ${user.lastName}`}
                className="top-navbar-profile-img" 
              />
            ) : (
              <div className="top-navbar-profile-placeholder">
                {getInitials()}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Profile dropdown menu */}
      {isProfileMenuOpen && (
        <div className="top-navbar-dropdown" ref={profileMenuRef}>
          <div className="dropdown-header">
            <div className="dropdown-user-info">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt={`${user.firstName} ${user.lastName}`}
                  className="dropdown-profile-img" 
                />
              ) : (
                <div className="dropdown-profile-placeholder">
                  {getInitials()}
                </div>
              )}
              <div className="dropdown-user-name">
                <span>{user?.firstName} {user?.lastName}</span>
                <span className="dropdown-user-email">{user?.email}</span>
              </div>
            </div>
          </div>
          <div className="dropdown-divider"></div>
          <button className="dropdown-item" onClick={handleProfileClick}>
            <span className="dropdown-item-icon">👤</span>
            Your Profile
          </button>
          <button className="dropdown-item" onClick={handleHelpClick}>
            <span className="dropdown-item-icon">❓</span>
            Help & Support
          </button>
          <div className="dropdown-divider"></div>
          <button className="dropdown-item dropdown-item-logout" onClick={handleLogout}>
            <span className="dropdown-item-icon">🚪</span>
            Log Out
          </button>
        </div>
      )}

      {/* Chat panel */}
      {isChatOpen && (
        <div className="top-navbar-chat-panel" ref={chatRef}>
          <div className="chat-panel-header">
            <h3>Messages</h3>
            <button className="chat-panel-close" onClick={() => setIsChatOpen(false)}>×</button>
          </div>
          <div className="chat-panel-search">
            <input 
              type="text" 
              placeholder="Search conversations" 
              className="chat-search-input" 
            />
          </div>
          <div className="chat-conversations">
            <div className="chat-empty-state">
              <div className="chat-empty-icon">💬</div>
              <h4>No Messages Yet</h4>
              <p>When you have conversations, they'll appear here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopNavbar;
