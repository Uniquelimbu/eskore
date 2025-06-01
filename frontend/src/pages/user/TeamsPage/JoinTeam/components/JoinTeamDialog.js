import React, { useState } from 'react';
import { toast } from 'react-toastify';
import PlayerRegistrationForm from '../../../../../components/forms/PlayerRegistrationForm';
import { apiClient } from '../../../../../services';
import './JoinTeamDialog.css';

const JoinTeamDialog = ({ team, onJoin, onCancel }) => {
  const [joinMode, setJoinMode] = useState(null); // null, 'player', 'staff'
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleJoinModeSelect = (mode) => {
    setJoinMode(mode);
  };
  
  const handlePlayerRegistrationSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      console.log('Sending join request with data:', {
        teamId: team.id,
        message: `I would like to join ${team.name} as a player with position: ${data.position}.`,
        playerData: {
          position: data.position,
          height: data.height ? parseFloat(data.height) : undefined,
          weight: data.weight ? parseFloat(data.weight) : undefined,
          preferredFoot: data.preferredFoot,
          jerseyNumber: data.jerseyNumber
        }
      });
      
      // Send join request
      const response = await apiClient.post('/notifications/team-join-request', {
        teamId: team.id,
        message: `I would like to join ${team.name} as a player with position: ${data.position}.`,
        playerData: {
          position: data.position,
          height: data.height ? parseFloat(data.height) : undefined,
          weight: data.weight ? parseFloat(data.weight) : undefined,
          preferredFoot: data.preferredFoot,
          jerseyNumber: data.jerseyNumber
        }
      });
      
      if (response && response.success) {
        toast.success('Join request sent successfully! Team managers will review your request.');
        onJoin({ success: true, pendingApproval: true });
      } else {
        toast.error(response?.message || 'Failed to send join request. Please try again.');
      }
    } catch (error) {
      console.error('Error sending join request:', error);
      
      // Provide a more helpful message based on the error
      let errorMessage = 'Failed to send join request.';
      
      if (error.response) {
        if (error.response.status === 409) {
          // Conflict errors
          if (error.response.data?.code === 'ALREADY_MEMBER') {
            errorMessage = 'You are already a member of this team.';
          } else if (error.response.data?.code === 'REQUEST_EXISTS') {
            errorMessage = 'You already have a pending request to join this team.';
            // This is actually a success case for the user experience
            toast.info(errorMessage);
            onJoin({ success: true, pendingApproval: true });
            setIsSubmitting(false);
            return;
          }
        } else if (error.response.status === 404) {
          errorMessage = 'Team not found or has no managers to approve your request.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.message) {
        // Network errors or other issues
        if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. The server might be busy, please try again.';
        } else if (error.message.includes('Network Error')) {
          errorMessage = 'Network connection error. Please check your internet connection.';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initial join options selector
  if (joinMode === null) {
    return (
      <div className="join-team-dialog-overlay">
        <div className="join-team-dialog">
          <button className="close-button" onClick={onCancel}>&times;</button>
          <h2>Join {team.name}</h2>
          <p>How would you like to join this team?</p>
          
          <div className="join-options">
            <div className="join-option" onClick={() => handleJoinModeSelect('player')}>
              <div className="option-icon player-icon">👤</div>
              <h3>Join as Player</h3>
              <p>You'll be added to the team as an athlete</p>
            </div>
            
            <div className="join-option disabled">
              <div className="option-icon staff-icon">👥</div>
              <h3>Join as Team Staff</h3>
              <p>Coming soon - this feature is not available yet</p>
              <div className="coming-soon-badge">Coming Soon</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Player registration form
  if (joinMode === 'player') {
    return (
      <div className="join-team-dialog-overlay">
        <div className="join-team-dialog wide dark-dialog">
          <div className="player-registration-container">
            <PlayerRegistrationForm
              onSubmit={handlePlayerRegistrationSubmit}
              onCancel={() => setJoinMode(null)}
              showCloseButton={true}
              onCloseClick={onCancel}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      </div>
    );
  }

  // Staff join form - not implementing now
  return (
    <div className="join-team-dialog-overlay">
      <div className="join-team-dialog">
        <button className="close-button" onClick={onCancel}>&times;</button>
        <h2>Staff Registration</h2>
        <p>This feature is not implemented yet.</p>
        <div className="form-actions">
          <button onClick={() => setJoinMode(null)}>Back</button>
        </div>
      </div>
    </div>
  );
};

export default JoinTeamDialog;
