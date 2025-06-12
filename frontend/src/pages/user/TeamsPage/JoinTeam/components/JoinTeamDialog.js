import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PlayerRegistrationForm from '../../../../../components/forms/PlayerRegistrationForm';
import { apiClient } from '../../../../../services';
import './JoinTeamDialog.css';

const JoinTeamDialog = ({ team, onJoin, onCancel }) => {
  const [joinMode, setJoinMode] = useState(null); // null, 'player', 'staff'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playerExists, setPlayerExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  
  // Check if user already has a player profile and pending requests
  useEffect(() => {
    const checkPlayerProfile = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/players/me');
        if (response && response.player) {
          setPlayerExists(true);
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('Error checking player profile:', error);
        }
        setPlayerExists(false);
      }
      
      // Check for pending join requests and team membership
      try {
        const userResponse = await apiClient.get('/auth/me');
        const currentUserId = userResponse?.id;
        
        if (!currentUserId) {
          console.warn('Could not determine current user ID');
          return;
        }
        
        // Check if user is already a member of this team
        try {
          const teamResponse = await apiClient.get(`/teams/${team.id}/members`);
          const isAlreadyMember = teamResponse?.members?.some(
            member => member.id === currentUserId
          );
          
          if (isAlreadyMember) {
            console.log('User is already a member of this team');
            setHasPendingRequest(true); // Prevent further requests
            return;
          }
        } catch (memberError) {
          console.warn('Could not check team membership:', memberError);
        }
        
        // Check for pending requests
        const notificationsResponse = await apiClient.get('/notifications', {
          params: { status: 'all', limit: 100 }
        });
        
        if (notificationsResponse && notificationsResponse.notifications) {
          const pendingRequest = notificationsResponse.notifications.find(
            notification => 
              notification.type === 'join_request' &&
              notification.teamId === team.id &&
              notification.senderUserId === currentUserId &&
              (notification.status === 'unread' || notification.status === 'read')
          );
          
          if (pendingRequest) {
            console.log('Found pending request:', pendingRequest);
            setHasPendingRequest(true);
            return;
          }
        }
        
        console.log('No pending requests found for team', team.id);
        setHasPendingRequest(false);
        
      } catch (error) {
        console.error('Error checking pending requests:', error);
        console.warn('Could not verify pending requests - user might be able to send duplicate requests');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkPlayerProfile();
    
    // Listen for membership changes
    const handleMembershipChanged = () => {
      checkPlayerProfile();
    };
    
    window.addEventListener('teamMembershipChanged', handleMembershipChanged);
    
    return () => {
      window.removeEventListener('teamMembershipChanged', handleMembershipChanged);
    };
  }, [team.id]);

  const handleJoinModeSelect = (mode) => {
    if (mode === 'player' && playerExists) {
      // Skip registration form if player already exists
      handlePlayerJoinRequest();
    } else {
      setJoinMode(mode);
    }
  };
  
  // Add a function to handle join request with existing player data
  const handlePlayerJoinRequest = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/notifications/team-join-request', {
        teamId: team.id,
        message: `I would like to join ${team.name} as a player.`
      });
      
      if (response && response.success) {
        // Set pending request state immediately
        setHasPendingRequest(true);
        toast.success('Join request sent successfully! Team managers will review your request.');
        onJoin({ success: true, pendingApproval: true });
      } else {
        toast.error(response?.message || 'Failed to send join request. Please try again.');
      }
    } catch (error) {
      handleJoinRequestError(error);
    } finally {
      setIsSubmitting(false);
    }
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
        // Set pending request state immediately
        setHasPendingRequest(true);
        toast.success('Join request sent successfully! Team managers will review your request.');
        onJoin({ success: true, pendingApproval: true });
      } else {
        toast.error(response?.message || 'Failed to send join request. Please try again.');
      }
    } catch (error) {
      handleJoinRequestError(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Shared error handling logic for both join request methods
  const handleJoinRequestError = (error) => {
    console.error('Error sending join request:', error);
      
    // Provide a more helpful message based on the error
    let errorMessage = 'Failed to send join request.';
    
    if (error.response || error.status) {
      const status = error.response?.status || error.status;
      const errorData = error.response?.data || error.data || {};
      const errorCode = errorData.errorCode || errorData.code;
      
      if (status === 409) {
        // Check error codes from backend
        if (errorCode === 'ALREADY_MEMBER') {
          errorMessage = 'You are already a member of this team.';
        } else if (errorCode === 'REQUEST_EXISTS' || errorCode === 'REQUEST_ALREADY_EXISTS') {
          errorMessage = 'You already have a pending request to join this team.';
          // Set the pending request state to update UI immediately
          setHasPendingRequest(true);
          toast.info(errorMessage);
          return;
        } else if (errorCode === 'REQUEST_PENDING') {
          errorMessage = 'Your join request is still being reviewed by the team managers.';
          setHasPendingRequest(true);
          toast.info(errorMessage);
          return;
        } else {
          // Generic 409 error
          errorMessage = errorData.message || 'A conflict occurred. You may already have a pending request.';
          setHasPendingRequest(true);
          toast.info(errorMessage);
          return;
        }
      } else if (status === 404) {
        errorMessage = 'Team not found or has no managers to approve your request.';
      } else if (status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (errorData.message) {
        errorMessage = errorData.message;
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
  };

  // Show loading spinner while checking player profile
  if (joinMode === null && isLoading) {
    return (
      <div className="join-team-dialog-overlay">
        <div className="join-team-dialog">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  // Show pending request message if user has already sent a request
  if (hasPendingRequest && joinMode === null) {
    return (
      <div className="join-team-dialog-overlay">
        <div className="join-team-dialog">
          <button className="close-button" onClick={onCancel}>&times;</button>
          <h2>Request Already Sent</h2>
          <div className="pending-request-notice">
            <div className="pending-icon">⏳</div>
            <p>You have already sent a join request to <strong>{team.name}</strong>.</p>
            <p>Your request is being reviewed by the team managers.</p>
            <small>You can check the status in your notifications.</small>
          </div>
          <div className="form-actions">
            <button onClick={onCancel} className="btn-secondary">Close</button>
          </div>
        </div>
      </div>
    );
  }

  // Initial join options selector
  if (joinMode === null) {
    return (
      <div className="join-team-dialog-overlay">
        <div className="join-team-dialog">
          <button className="close-button-join-team" onClick={onCancel}>&times;</button>
          <h2>Join {team.name}</h2>
          <p>How would you like to join this team?</p>
          
          <div className="join-options">
            <div className="join-option" onClick={() => handleJoinModeSelect('player')}>
              <div className="option-icon-jointeam player-icon">👤</div>
              <h3>Join as Player</h3>
              <p>{playerExists ? 'Continue with your existing player profile' : 'Create a player profile and join the team'}</p>
            </div>
            
            <div className="join-option disabled">
              <div className="option-icon-jointeam staff-icon">👥</div>
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
