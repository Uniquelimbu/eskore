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
    const reason = window.prompt('Please provide a reason for declining this request (optional):');
    
    setProcessing(prev => ({ ...prev, [requestId]: true }));
    
    try {
      await apiClient.rejectTeamJoinRequest(requestId, reason || 'No reason provided');
      toast.info('Join request declined');
      
      // Remove the rejected request from the list
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject join request');
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }));
    }
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
        <div className="team-requests-no-requests">
          <p>No pending join requests at this time.</p>
        </div>
      ) : (
        <div className="team-requests-list">
          {requests.map(request => (
            <div key={request.id} className="team-request-card">
              <div className="team-request-user-info">
                <div className="team-request-user-avatar">
                  {request.user?.profileImageUrl ? (
                    <img src={request.user.profileImageUrl} alt={request.user.firstName} />
                  ) : (
                    <div className="team-request-avatar-placeholder">
                      {request.user?.firstName?.charAt(0)}{request.user?.lastName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="team-request-user-details">
                  <h4>{request.user?.firstName} {request.user?.lastName}</h4>
                  <p>{request.user?.email}</p>
                  {request.message && (
                    <p className="team-request-message">"{request.message}"</p>
                  )}
                  {request.playerData && (
                    <div className="team-request-player-data">
                      <span className="team-request-position-badge">{request.playerData.position}</span>
                      {request.playerData.preferredFoot && (
                        <span className="team-request-foot-badge">{request.playerData.preferredFoot} footed</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="team-request-actions">
                <button 
                  className="team-request-accept-btn"
                  onClick={() => handleAcceptRequest(request.id)}
                  disabled={processing[request.id]}
                >
                  {processing[request.id] ? 'Accepting...' : 'Accept'}
                </button>
                <button 
                  className="team-request-reject-btn"
                  onClick={() => handleRejectRequest(request.id)}
                  disabled={processing[request.id]}
                >
                  {processing[request.id] ? 'Rejecting...' : 'Decline'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamRequests;
