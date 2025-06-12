import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../../../../../services';
import { toast } from 'react-toastify';
import './TeamRequests.css';

const TeamRequests = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    fetchJoinRequests();
  }, [teamId]);

  const fetchJoinRequests = async () => {
    try {
      const response = await apiClient.getTeamJoinRequests(teamId);
      setRequests(response?.requests || []);
    } catch (error) {
      console.error('Error fetching join requests:', error);
      toast.error('Failed to load join requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setProcessing(prev => ({ ...prev, [requestId]: true }));
    
    try {
      console.log('Accepting join request:', requestId);
      const response = await apiClient.acceptTeamJoinRequest(requestId);
      
      if (response && response.success) {
        toast.success('Join request accepted successfully');
        
        // Remove the accepted request from the list
        setRequests(prev => prev.filter(req => req.id !== requestId));
        
        // Emit comprehensive events to notify other components
        window.dispatchEvent(new CustomEvent('pendingRequestsChanged'));
        window.dispatchEvent(new CustomEvent('teamMembershipChanged'));
        window.dispatchEvent(new CustomEvent('teamPlayersChanged', { 
          detail: { teamId: teamId } 
        }));
        window.dispatchEvent(new CustomEvent('squadMembersChanged', {
          detail: { teamId: teamId }
        }));
        
        // Force refresh formation data with delay to ensure backend processing is complete
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('forceFormationRefresh', {
            detail: { teamId: teamId, reason: 'player_accepted' }
          }));
        }, 2000); // Increased delay to 2 seconds
        
        // Also trigger a formation data reload directly
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('reloadFormationData', {
            detail: { teamId: teamId }
          }));
        }, 3000);
        
      } else {
        toast.error('Failed to accept join request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      
      let errorMessage = 'Failed to accept join request';
      if (error.response?.status === 404) {
        errorMessage = 'Join request not found';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to accept this request';
      } else if (error.response?.status === 409) {
        errorMessage = 'User is already a member of this team';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      toast.error(errorMessage);
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRejectRequest = async (requestId) => {
    setSelectedRequest(requestId);
    setShowDeclineModal(true);
  };

  const confirmDecline = async () => {
    if (!selectedRequest) return;
    
    setProcessing(prev => ({ ...prev, [selectedRequest]: true }));
    
    try {
      await apiClient.rejectTeamJoinRequest(selectedRequest, declineReason || 'No reason provided');
      toast.info('Join request declined');
      
      // Remove the declined request from the list
      setRequests(prev => prev.filter(req => req.id !== selectedRequest));
      setShowDeclineModal(false);
      setSelectedRequest(null);
      setDeclineReason('');
      
      // Emit event to notify other components
      window.dispatchEvent(new CustomEvent('pendingRequestsChanged'));
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Failed to decline join request');
    } finally {
      setProcessing(prev => ({ ...prev, [selectedRequest]: false }));
    }
  };

  const cancelDecline = () => {
    setShowDeclineModal(false);
    setSelectedRequest(null);
    setDeclineReason('');
  };

  const handleBack = () => {
    navigate(`/teams/${teamId}/space/squad`);
  };

  if (loading) {
    return (
      <div className="team-requests-page">
        <div className="team-requests-header">
          <button className="team-requests-back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h2>Team Join Requests</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#a0aec0' }}>
          Loading requests...
        </div>
      </div>
    );
  }

  return (
    <div className="team-requests-page">
      <div className="team-requests-header">
        <button className="team-requests-back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2>Team Join Requests</h2>
      </div>

      {requests.length === 0 ? (
        <div className="team-requests-empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No pending requests</h3>
          <p>You don't have any pending join requests at the moment.</p>
        </div>
      ) : (
        <div className="team-requests-list">
          {requests.map((request) => (
            <div key={request.id} className="team-request-card">
              <div className="team-request-content">
                <div className="team-request-avatar">
                  {request.senderAvatarUrl ? (
                    <img src={request.senderAvatarUrl} alt={request.senderName} />
                  ) : (
                    <div className="team-request-avatar-placeholder">
                      {request.senderName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="team-request-info">
                  <div className="team-request-header">
                    <h3 className="team-request-name">{request.senderName}</h3>
                    <span className="team-request-time">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="team-request-email">{request.senderEmail}</p>
                  {request.message && (
                    <div className="team-request-message">
                      <strong>Message:</strong>
                      <p>{request.message}</p>
                    </div>
                  )}
                </div>
              </div>

              {request.metadata?.playerData && (
                <div className="team-request-player-info">
                  <div className="player-info-header">
                    ⚽ Player Information
                  </div>
                  
                  <div className="player-info-grid">
                    <div className="player-info-item">
                      <span className="player-info-label">Position</span>
                      <span className="player-info-value">{request.metadata.playerData.position}</span>
                    </div>
                    
                    {request.metadata.playerData.preferredFoot && (
                      <div className="player-info-item">
                        <span className="player-info-label">Preferred Foot</span>
                        <span className="player-info-value">{request.metadata.playerData.preferredFoot}</span>
                      </div>
                    )}
                    
                    {request.metadata.playerData.jerseyNumber && (
                      <div className="player-info-item">
                        <span className="player-info-label">Jersey Number</span>
                        <span className="player-info-value">#{request.metadata.playerData.jerseyNumber}</span>
                      </div>
                    )}
                  </div>
                  
                  {(request.metadata.playerData.height || request.metadata.playerData.weight) && (
                    <div className="player-info-stats">
                      {request.metadata.playerData.height && (
                        <div className="stat-item">
                          <span>📏 {request.metadata.playerData.height}cm</span>
                        </div>
                      )}
                      {request.metadata.playerData.weight && (
                        <div className="stat-item">
                          <span>⚖️ {request.metadata.playerData.weight}kg</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="player-info-badges">
                    <span className="badge badge-position">
                      {request.metadata.playerData.position}
                    </span>
                    {request.metadata.playerData.preferredFoot && (
                      <span className="badge badge-foot">
                        {request.metadata.playerData.preferredFoot} footed
                      </span>
                    )}
                    {request.metadata.playerData.jerseyNumber && (
                      <span className="badge badge-number">
                        #{request.metadata.playerData.jerseyNumber}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="team-request-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleAcceptRequest(request.id)}
                  disabled={processing[request.id]}
                >
                  {processing[request.id] && <div className="loading-spinner" />}
                  Accept
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleRejectRequest(request.id)}
                  disabled={processing[request.id]}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeclineModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Decline Join Request</h3>
              <button className="modal-close" onClick={() => setShowDeclineModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to decline this join request?</p>
              <div className="form-group">
                <label htmlFor="declineReason">Reason (optional):</label>
                <textarea
                  id="declineReason"
                  className="form-control"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Provide a reason for declining this request..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeclineModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDecline}
                disabled={processing[selectedRequest]}
              >
                {processing[selectedRequest] && <div className="loading-spinner" />}
                Decline Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamRequests;
