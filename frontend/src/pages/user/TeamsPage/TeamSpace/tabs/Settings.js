import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TabComponents.css';

const Settings = ({ team, members, isManager, userId }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Get the user's member record more explicitly with safer fallbacks
  const userMember = members.find(m => m.id === userId);
  const userRole = userMember?.role || '';
  
  // Check if user is the manager (not just an assistant_manager)
  const isTeamManager = userRole === 'manager';
  
  // Check if the manager is the only member left (more robust check)
  const isOnlyMember = members.length === 1 && userMember && isTeamManager;
  
  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };
  
  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };
  
  const handleConfirmDelete = async () => {
    // Extra safety check before attempting delete
    if (!isTeamManager || !isOnlyMember) {
      setError('You must be the team manager and the only remaining member to delete the team.');
      return;
    }
    
    setIsDeleting(true);
    setError(null);
    
    try {
      await axios.delete(`/api/teams/${team.id}`);
      setIsDeleting(false);
      setShowConfirmation(false);
      
      // Redirect to teams page after successful deletion
      navigate('/teams');
    } catch (err) {
      setIsDeleting(false);
      setError(
        err.response?.data?.message || 
        'Failed to delete team. Please try again.'
      );
      console.error('Error deleting team:', err);
    }
  };
  
  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Team Settings</h2>
      </div>
      
      <div className="settings-section">
        <h3>General Settings</h3>
        <p className="settings-description">
          Configure general settings for your team. More settings options coming soon.
        </p>
      </div>
      
      {isTeamManager && (
        <div className="settings-section danger-zone">
          <h3>Danger Zone</h3>
          <div className="danger-zone-card">
            <div className="danger-zone-content">
              <h4>Delete Team</h4>
              <p>
                Permanently delete this team and all associated data. This action cannot be undone.
              </p>
              {!isOnlyMember && (
                <div className="delete-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>You can only delete the team when you are the only member remaining.</p>
                </div>
              )}
            </div>
            <button 
              className="delete-team-btn" 
              onClick={handleDeleteClick}
              disabled={!isOnlyMember || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Team'}
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="settings-error-message">
          {error}
        </div>
      )}
      
      {showConfirmation && (
        <div className="confirmation-modal">
          <div className="confirmation-modal-content">
            <h3>Delete Team Confirmation</h3>
            <p>
              Are you sure you want to delete <strong>{team.name}</strong>?
              This action <strong>cannot</strong> be undone and all team data will be permanently lost.
            </p>
            <div className="confirmation-actions">
              <button className="cancel-button" onClick={handleCancelDelete}>
                Cancel
              </button>
              <button 
                className="confirm-delete-button" 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Team Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
