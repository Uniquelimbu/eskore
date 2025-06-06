import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { JoinTeamDialog } from '../../../JoinTeam/components';
import SquadHeader from './components/SquadHeader';
import MemberList from './components/MemberList';
import useSquadMembers from './hooks/useSquadMembers';
import { apiClient } from '../../../../../../services';
import { toast } from 'react-toastify';
import './styles/Squad.css';

const Squad = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
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
    refresh
  } = useSquadMembers(teamId);

  useEffect(() => {
    // Fetch pending join requests for managers
    const fetchJoinRequests = async () => {
      if (isManager && team) {
        setLoadingRequests(true);
        try {
          const response = await apiClient.getTeamJoinRequests(team.id);
          setJoinRequests(response?.requests || []);
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
      const response = await apiClient.acceptTeamJoinRequest(notification.id);
      
      if (response && response.success) {
        toast.success('Join request accepted successfully');
        
        // Remove from join requests list
        setJoinRequests(prev => prev.filter(req => req.id !== notification.id));
        
        // Refresh the squad data
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
      const reason = window.prompt('Please provide a reason for declining this request (optional):');
      
      const response = await apiClient.rejectTeamJoinRequest(notification.id, reason || 'No reason provided');
      
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
        onJoinTeam={handleJoinTeamClick}
        isManager={isManager}
        isMember={isMember}
        team={team}
        joinRequestsCount={joinRequests.length}
      />
      
      {isLoading && !initialLoad && (
        <div className="squad-loading-overlay">
          <div className="squad-loading-content">Updating squad information...</div>
        </div>
      )}
      
      {showJoinModal && team && (
        <JoinTeamDialog
          team={team}
          onJoin={handleJoinTeamSubmit}
          onCancel={() => setShowJoinModal(false)}
        />
      )}
      
      <div className="squad-container">
        {teamHasMembers ? (
          <>
            <MemberList 
              members={[...managers, ...athletes, ...coaches]}
              team={team}
              isManager={isManager}
              onMemberUpdate={refresh}
            />
          </>
        ) : (
          <div className="empty-state">
            <p>This team has no members yet. {isManager ? 'Manage join requests to add members!' : 'Join the team to get started!'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Squad;
