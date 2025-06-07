import React from 'react';
import './TeamLogoOverlay.css';

const TeamLogoOverlay = ({ 
  isOpen, 
  onClose, 
  teamLogo, 
  teamName, 
  teamAbbreviation,
  onInMatchRoles,
  onEditPlayerNumber,
  onLineups 
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="team-logo-overlay" onClick={handleOverlayClick}>
      <div className="team-logo-overlay-content">
        {/* Close button */}
        <button className="overlay-close-button" onClick={onClose}>
          ×
        </button>
        
        {/* Team logo section */}
        <div className="overlay-team-section">
          <div className="overlay-team-logo">
            {teamLogo ? (
              <img 
                src={teamLogo} 
                alt={`${teamName} logo`} 
                className="overlay-team-logo-img"
              />
            ) : (
              <div className="overlay-team-logo-placeholder">
                {teamAbbreviation || teamName?.substring(0, 3)?.toUpperCase() || 'TM'}
              </div>
            )}
          </div>
          <h3 className="overlay-team-name">{teamName || 'Team Name'}</h3>
        </div>

        {/* Options section */}
        <div className="overlay-options-section">
          <button 
            className="overlay-option-button"
            onClick={() => {
              onInMatchRoles?.();
              onClose();
            }}
          >
            <div className="option-icon">
              <i className="fas fa-users"></i>
            </div>
            <span>In-Match Roles</span>
            <div className="option-arrow">
              <i className="fas fa-chevron-right"></i>
            </div>
          </button>

          <button 
            className="overlay-option-button"
            onClick={() => {
              onEditPlayerNumber?.();
              onClose();
            }}
          >
            <div className="option-icon">
              <i className="fas fa-hashtag"></i>
            </div>
            <span>Edit Player Number</span>
            <div className="option-arrow">
              <i className="fas fa-chevron-right"></i>
            </div>
          </button>

          <button 
            className="overlay-option-button"
            onClick={() => {
              onLineups?.();
              onClose();
            }}
          >
            <div className="option-icon">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <span>Lineups</span>
            <div className="option-arrow">
              <i className="fas fa-chevron-right"></i>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamLogoOverlay;
