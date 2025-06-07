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
      setLoading(true);
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
      await apiClient.acceptTeamJoinRequest(requestId);
      toast.success('Join request accepted successfully');
      
      // Remove the accepted request from the list
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept join request');
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
      
      // Remove the rejected request from the list
      setRequests(prev => prev.filter(req => req.id !== selectedRequest));
      
      // Reset modal state
      setShowDeclineModal(false);
      setSelectedRequest(null);
      setDeclineReason('');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject join request');
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
          <button className="team-requests-back-button" onClick={handleBack}>
            ← Back to Squad
          </button>
          <h2>Join Requests</h2>
        </div>
        <div>Loading join requests...</div>
      </div>
    );
  }

  return (
    <div className="team-requests-page">
      <div className="team-requests-header">
        <button className="team-requests-back-button" onClick={handleBack}>
          ← Back to Squad
        </button>
        <h2>Join Requests</h2>
      </div>

      {requests.length === 0 ? (
        <div className="team-requests-empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No Pending Requests</h3>
          <p>There are no pending join requests at this time.</p>
        </div>
      ) : (
        <div className="team-requests-list">
          {requests.map(request => (
            <div key={request.id} className="team-request-card">
              <div className="team-request-content">
                <div className="team-request-avatar">
                  {request.sender?.profileImageUrl ? (
                    <img src={request.sender.profileImageUrl} alt={request.sender.firstName} />
                  ) : (
                    <div className="team-request-avatar-placeholder">
                      {request.sender?.firstName?.charAt(0)}{request.sender?.lastName?.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className="team-request-info">
                  <div className="team-request-header">
                    <h4 className="team-request-name">
                      {request.sender?.firstName} {request.sender?.lastName}
                    </h4>
                    <span className="team-request-time">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="team-request-email">{request.sender?.email}</p>
                  
                  {request.message && (
                    <div className="team-request-message">
                      <strong>Message:</strong>
                      <p>"{request.message}"</p>
                    </div>
                  )}
                  
                  {request.metadata?.playerData && (
                    <div className="team-request-player-info">
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
                      {(request.metadata.playerData.height || request.metadata.playerData.weight) && (
                        <div className="player-info-stats">
                          {request.metadata.playerData.height && (
                            <span>Height: {request.metadata.playerData.height}cm</span>
                          )}
                          {request.metadata.playerData.weight && (
                            <span>Weight: {request.metadata.playerData.weight}kg</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="team-request-actions">
                <button 
                  className="btn btn-primary btn-accept"
                  onClick={() => handleAcceptRequest(request.id)}
                  disabled={processing[request.id]}
                >
                  {processing[request.id] ? (
                    <>
                      <span className="loading-spinner"></span>
                      Accepting...
                    </>
                  ) : (
                    'Accept'
                  )}
                </button>
                <button 
                  className="btn btn-secondary btn-decline"
                  onClick={() => handleRejectRequest(request.id)}
                  disabled={processing[request.id]}
                >
                  {processing[request.id] ? (
                    <>
                      <span className="loading-spinner"></span>
                      Declining...
                    </>
                  ) : (
                    'Decline'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decline Reason Modal */}
      {showDeclineModal && (
        <div className="modal-overlay">
          <div className="modal-content decline-modal">
            <div className="modal-header">
              <h3>Decline Join Request</h3>
              <button className="modal-close" onClick={cancelDecline}>&times;</button>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to decline this join request?</p>
              <div className="form-group">
                <label htmlFor="declineReason">Reason (optional):</label>
                <textarea
                  id="declineReason"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Provide a reason for declining this request..."
                  rows={3}
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={cancelDecline}>
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={confirmDecline}
                disabled={processing[selectedRequest]}
              >
                {processing[selectedRequest] ? 'Declining...' : 'Decline Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamRequests;
