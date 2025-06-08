import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TeamLogoOverlay.css';

const TeamLogoOverlay = ({ 
  isOpen, 
  onClose, 
  teamLogo, 
  teamName, 
  teamAbbreviation,
  onEditPlayerNumber,
  onLineups 
}) => {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const handleInMatchRoles = () => {
    navigate(`/teams/${teamId}/space/formation/in-match-roles`);
    onClose(); // Close the overlay
  };

  const handleEditPlayerNumber = () => {
    if (onEditPlayerNumber) {
      onEditPlayerNumber();
    }
  };

  const handleLineups = () => {
    if (onLineups) {
      onLineups();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="team-logo-overlay">
      <div className="team-logo-overlay-content">
        <button className="overlay-close-button" onClick={onClose}>
          ✕
        </button>
        
        <div className="overlay-team-section">
          <div className="overlay-team-logo">
            {teamLogo ? (
              <img src={teamLogo} alt={teamName} className="overlay-team-logo-img" />
            ) : (
              <div className="overlay-team-logo-placeholder">
                {teamAbbreviation || teamName?.substring(0, 3).toUpperCase() || 'TM'}
              </div>
            )}
          </div>
          <h2 className="overlay-team-name">{teamName || 'Team Name'}</h2>
        </div>

        <div className="overlay-options-section">
          <button className="overlay-option-button" onClick={handleInMatchRoles}>
            <div className="option-icon">⚽</div>
            <span>In-Match Roles</span>
            <div className="option-arrow">→</div>
          </button>

          <button className="overlay-option-button" onClick={handleEditPlayerNumber}>
            <div className="option-icon">🔢</div>
            <span>Edit Player Number</span>
            <div className="option-arrow">→</div>
          </button>

          <button className="overlay-option-button" onClick={handleLineups}>
            <div className="option-icon">📋</div>
            <span>Lineups</span>
            <div className="option-arrow">→</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamLogoOverlay;
