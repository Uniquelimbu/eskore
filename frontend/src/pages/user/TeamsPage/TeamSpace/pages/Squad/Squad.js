import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { JoinTeamDialog } from '../../../JoinTeam/components';
import SquadHeader from './components/SquadHeader';
import MemberList from './components/MemberList';
import AddMemberForm from './components/AddMemberForm';
import useSquadMembers from './hooks/useSquadMembers';
import { apiClient } from '../../../../../../services';
import { toast } from 'react-toastify';
import './styles/Squad.css';

const Squad = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  
  const {
    isLoading,
    initialLoad,
    error,
    team,
    managers,
    athletes,
    coaches,
    isManager,
    isMember,
    handleJoinTeamSubmit,
    handleRemoveMember,
    handleAddMemberSubmit,
    refresh  // Make sure to destructure the refresh function
  } = useSquadMembers(teamId);

  useEffect(() => {
    // Add a function to fetch pending join requests
    const fetchJoinRequests = async () => {
      if (isManager && team) {
        setLoadingRequests(true);
        try {
          // Fetch unread notifications of type join_request for this team
          const response = await apiClient.get('/notifications', {
            params: {
              status: 'unread',
              type: 'join_request',
              teamId: team.id
            }
          });
          
          if (response && response.notifications) {
            setJoinRequests(response.notifications);
          }
        } catch (error) {
          console.error('Error fetching join requests:', error);
        } finally {
          setLoadingRequests(false);
        }
      }
    };

    fetchJoinRequests();
  }, [isManager, team]);

  // Handle accepting a join request
  const handleAcceptRequest = async (notification) => {
    try {
      const response = await apiClient.post(`/notifications/${notification.id}/accept`);
      
      if (response && response.success) {
        toast.success('Join request accepted successfully');
        
        // Remove from join requests list
        setJoinRequests(prev => prev.filter(req => req.id !== notification.id));
        
        // Refresh the squad data - use refresh instead of refreshData
        refresh();
      }
    } catch (error) {
      console.error('Error accepting join request:', error);
      toast.error('Failed to accept join request');
    }
  };

  // Handle rejecting a join request
  const handleRejectRequest = async (notification) => {
    try {
      // Prompt for rejection reason
      const reason = window.prompt('Please provide a reason for declining this request (optional):');
      
      const response = await apiClient.post(`/notifications/${notification.id}/reject`, {
        reason: reason || 'No reason provided'
      });
      
      if (response && response.success) {
        toast.info('Join request declined');
        
        // Remove from join requests list
        setJoinRequests(prev => prev.filter(req => req.id !== notification.id));
      }
    } catch (error) {
      console.error('Error rejecting join request:', error);
      toast.error('Failed to reject join request');
    }
  };

  const handleBack = () => {
    navigate(`/teams/${teamId}/space`);
  };

  const handleAddMember = () => {
    setShowAddMemberForm(true);
  };
  
  const handleJoinTeamClick = () => {
    setShowJoinModal(true);
  };

  if (initialLoad && isLoading) {
    return <div className="squad-loading">Loading squad information...</div>;
  }
  
  if (error) {
    return <div className="squad-error">{error}</div>;
  }

  // Check if we have any members at all
  const teamHasMembers = (managers?.length > 0 || athletes?.length > 0 || coaches?.length > 0);

  return (
    <div className="squad-page">
      <SquadHeader 
        onBack={handleBack}
        onAddMember={handleAddMember}
        onJoinTeam={handleJoinTeamClick}
        isManager={isManager}
        isMember={isMember}
        team={team}
      />
      
      {isLoading && !initialLoad && (
        <div className="squad-loading-overlay">
          <div className="squad-loading-content">Updating squad information...</div>
        </div>
      )}
      
      {showAddMemberForm && (
        <AddMemberForm
          onSubmit={handleAddMemberSubmit}
          onCancel={() => setShowAddMemberForm(false)}
          isManager={isManager}
        />
      )}
      
      {showJoinModal && team && (
        <JoinTeamDialog
          team={team}
          onJoin={handleJoinTeamSubmit}
          onCancel={() => setShowJoinModal(false)}
        />
      )}
      
      {/* Add Join Requests Section for Managers */}
      {isManager && joinRequests.length > 0 && (
        <div className="join-requests-section">
          <h3>Pending Join Requests</h3>
          <div className="join-requests-list">
            {joinRequests.map(request => (
              <div key={request.id} className="join-request-card">
                <div className="join-request-user">
                  {request.sender ? (
                    <>
                      <div className="request-user-avatar">
                        {request.sender.profileImageUrl ? (
                          <img src={request.sender.profileImageUrl} alt={request.sender.firstName} />
                        ) : (
                          <div className="avatar-placeholder">
                            {request.sender.firstName?.charAt(0)}{request.sender.lastName?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="request-user-info">
                        <h4>{request.sender.firstName} {request.sender.lastName}</h4>
                        <p>{request.sender.email}</p>
                        {request.metadata?.userMessage && (
                          <p className="request-message">"{request.metadata.userMessage}"</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="request-user-info">
                      <p>Unknown User</p>
                    </div>
                  )}
                </div>
                <div className="join-request-actions">
                  <button 
                    className="accept-request-btn" 
                    onClick={() => handleAcceptRequest(request)}
                  >
                    Accept
                  </button>
                  <button 
                    className="reject-request-btn" 
                    onClick={() => handleRejectRequest(request)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="squad-container">
        {teamHasMembers ? (
          <>
            {Array.isArray(managers) && managers.length > 0 && (
              <MemberList 
                title="Managers"
                members={managers}
                isManager={isManager}
                onRemoveMember={handleRemoveMember}
                category="manager"
              />
            )}
            
            {Array.isArray(athletes) && athletes.length > 0 && (
              <MemberList 
                title="Athletes"
                members={athletes}
                isManager={isManager}
                onRemoveMember={handleRemoveMember}
                category="athlete"
              />
            )}
            
            {Array.isArray(coaches) && coaches.length > 0 && (
              <MemberList 
                title="Coaches"
                members={coaches}
                isManager={isManager}
                onRemoveMember={handleRemoveMember}
                category="coach"
              />
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>This team has no members yet. {isManager ? 'Add members to get started!' : 'Join the team to get started!'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Squad;
