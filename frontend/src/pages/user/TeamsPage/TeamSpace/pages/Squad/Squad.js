import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTeam } from '../../../../../../contexts/TeamContext';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { JoinTeamDialog } from '../../../JoinTeam/components';
import SquadHeader from './components/SquadHeader';
import MemberList from './components/MemberList';
import { apiClient } from '../../../../../../services';
import { toast } from 'react-toastify';
import { collapseSidebar, expandSidebar } from '../../../../../../utils/sidebarUtils';
import './styles/Squad.css';

const Squad = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use TeamContext instead of custom hooks
  const {
    currentTeam,
    teamMembers,
    isManager,
    loading: teamLoading,
    error: teamError,
    refreshCurrentTeam,
    isUserMemberOfCurrentTeam,
    switchToTeam,
    getTeamById
  } = useTeam();

  // Local state for Squad-specific functionality
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Categorized members (computed from teamMembers)
  const [managers, setManagers] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [coaches, setCoaches] = useState([]);

  // Check if user is a member of current team
  const isMember = isUserMemberOfCurrentTeam(user?.id);

  // Ensure we're on the correct team
  useEffect(() => {
    const ensureCorrectTeam = async () => {
      if (!teamId || !currentTeam) return;
      
      // If current team doesn't match URL team, switch to it
      if (currentTeam.id.toString() !== teamId) {
        try {
          setLocalLoading(true);
          const team = await getTeamById(teamId);
          await switchToTeam(team);
        } catch (err) {
          console.error('Squad: Error switching to team:', err);
          setLocalError('Failed to load team data');
        } finally {
          setLocalLoading(false);
        }
      }
    };

    ensureCorrectTeam();
  }, [teamId, currentTeam, getTeamById, switchToTeam]);

  // Process team members into categories
  useEffect(() => {
    if (!teamMembers || teamMembers.length === 0) {
      setManagers([]);
      setAthletes([]);
      setCoaches([]);
      return;
    }

    console.log('Squad: Processing team members:', teamMembers);

    const processedManagers = [];
    const processedAthletes = [];
    const processedCoaches = [];

    teamMembers.forEach(member => {
      // Handle different member data structures
      const memberData = {
        id: member.id || member.userId,
        userId: member.userId || member.id,
        firstName: member.firstName || member.user?.firstName || '',
        lastName: member.lastName || member.user?.lastName || '',
        email: member.email || member.user?.email || '',
        role: member.role || member.teamRole || 'athlete',
        joinedAt: member.joinedAt || member.createdAt,
        avatar: member.avatar || member.user?.avatar,
        // Include full member and user objects for compatibility
        ...member,
        user: member.user || member
      };

      switch (memberData.role) {
        case 'manager':
        case 'assistant_manager':
          processedManagers.push(memberData);
          break;
        case 'coach':
        case 'assistant_coach':
          processedCoaches.push(memberData);
          break;
        case 'athlete':
        case 'player':
        default:
          processedAthletes.push(memberData);
          break;
      }
    });

    setManagers(processedManagers);
    setAthletes(processedAthletes);
    setCoaches(processedCoaches);

    console.log('Squad: Categorized members:', {
      managers: processedManagers.length,
      athletes: processedAthletes.length,
      coaches: processedCoaches.length
    });
  }, [teamMembers]);

  // Handle initial loading state
  useEffect(() => {
    if (currentTeam && teamMembers !== null) {
      setInitialLoad(false);
    }
  }, [currentTeam, teamMembers]);

  // Fetch join requests for managers
  useEffect(() => {
    const fetchJoinRequests = async () => {
      if (!isManager || !currentTeam) return;

      setLoadingRequests(true);
      try {
        const response = await apiClient.getTeamJoinRequests(currentTeam.id);
        setJoinRequests(response?.requests || []);
      } catch (error) {
        console.error('Squad: Error fetching join requests:', error);
        setJoinRequests([]);
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchJoinRequests();
  }, [isManager, currentTeam]);

  // Sidebar management
  useEffect(() => {
    console.log('Squad: Attempting to collapse sidebar');
    
    const timer = setTimeout(() => {
      collapseSidebar();
    }, 50);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Handle accepting join requests
  const handleAcceptRequest = async (notification) => {
    try {
      console.log('Squad: Accepting join request:', notification.id);
      const response = await apiClient.acceptTeamJoinRequest(notification.id);
      
      if (response && response.success) {
        toast.success('Join request accepted successfully');
        
        // Remove from join requests list
        setJoinRequests(prev => prev.filter(req => req.id !== notification.id));
        
        // Refresh team members to include new member
        await refreshCurrentTeam();
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('teamMembershipChanged', {
          detail: { teamId: currentTeam.id, action: 'member_added' }
        }));
      }
    } catch (error) {
      console.error('Squad: Error accepting join request:', error);
      toast.error('Failed to accept join request');
    }
  };

  // Handle declining join requests
  const handleDeclineRequest = async (notification) => {
    try {
      console.log('Squad: Declining join request:', notification.id);
      const response = await apiClient.declineTeamJoinRequest(notification.id);
      
      if (response && response.success) {
        toast.success('Join request declined');
        setJoinRequests(prev => prev.filter(req => req.id !== notification.id));
      }
    } catch (error) {
      console.error('Squad: Error declining join request:', error);
      toast.error('Failed to decline join request');
    }
  };

  // Handle removing members
  const handleRemoveMember = useCallback(async (memberId) => {
    if (!currentTeam || !isManager) {
      toast.error('You do not have permission to remove members');
      return;
    }

    try {
      setLocalLoading(true);
      console.log(`Squad: Removing member ${memberId} from team ${currentTeam.id}`);
      
      const response = await apiClient.removeTeamMember(currentTeam.id, memberId);
      
      if (response && response.success) {
        toast.success('Member removed successfully');
        
        // Refresh team data to reflect the removal
        await refreshCurrentTeam();
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('teamMembershipChanged', {
          detail: { teamId: currentTeam.id, action: 'member_removed' }
        }));
      }
    } catch (error) {
      console.error('Squad: Error removing member:', error);
      const errorMessage = error.response?.data?.message || 'Failed to remove member';
      toast.error(errorMessage);
    } finally {
      setLocalLoading(false);
    }
  }, [currentTeam, isManager, refreshCurrentTeam]);

  // Handle adding members (if needed)
  const handleAddMemberSubmit = useCallback(async (memberData) => {
    if (!currentTeam || !isManager) {
      toast.error('You do not have permission to add members');
      return;
    }

    try {
      setLocalLoading(true);
      console.log('Squad: Adding member to team:', memberData);
      
      const response = await apiClient.addTeamMember(currentTeam.id, memberData);
      
      if (response && response.success) {
        toast.success('Member added successfully');
        
        // Refresh team data
        await refreshCurrentTeam();
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('teamMembershipChanged', {
          detail: { teamId: currentTeam.id, action: 'member_added' }
        }));
      }
    } catch (error) {
      console.error('Squad: Error adding member:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add member';
      toast.error(errorMessage);
    } finally {
      setLocalLoading(false);
    }
  }, [currentTeam, isManager, refreshCurrentTeam]);

  // Handle joining team
  const handleJoinTeamSubmit = useCallback(async (joinData) => {
    if (!currentTeam) {
      toast.error('No team selected');
      return;
    }

    try {
      setLocalLoading(true);
      console.log('Squad: Submitting join request for team:', currentTeam.id);
      
      const response = await apiClient.joinTeam(currentTeam.id, joinData);
      
      if (response.success && !response.isPending) {
        toast.success('Successfully joined the team!');
        
        // Refresh team data to include the user as a member
        await refreshCurrentTeam();
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('teamMembershipChanged', {
          detail: { teamId: currentTeam.id, action: 'user_joined' }
        }));
      } else if (response.isPending) {
        toast.success('Join request sent! Waiting for team manager approval.');
      }
      
      setShowJoinModal(false);
    } catch (error) {
      console.error('Squad: Error joining team:', error);
      const errorMessage = error.response?.data?.message || 'Failed to join team';
      toast.error(errorMessage);
    } finally {
      setLocalLoading(false);
    }
  }, [currentTeam, refreshCurrentTeam]);

  // Navigation handlers
  const handleBack = () => {
    console.log('Squad: Expanding sidebar and navigating back');
    expandSidebar();
    navigate(`/teams/${teamId}/space`);
  };
  
  const handleJoinTeamClick = () => {
    setShowJoinModal(true);
  };

  // Refresh handler for child components
  const refresh = useCallback(async () => {
    try {
      setLocalLoading(true);
      await refreshCurrentTeam();
      
      // Also refresh join requests if manager
      if (isManager && currentTeam) {
        const response = await apiClient.getTeamJoinRequests(currentTeam.id);
        setJoinRequests(response?.requests || []);
      }
    } catch (error) {
      console.error('Squad: Error refreshing data:', error);
      setLocalError('Failed to refresh squad data');
    } finally {
      setLocalLoading(false);
    }
  }, [refreshCurrentTeam, isManager, currentTeam]);

  // Loading states
  const isLoading = teamLoading || localLoading;
  const error = teamError || localError;

  // Loading state for initial load
  if (initialLoad && isLoading) {
    return <div className="squad-loading">Loading squad information...</div>;
  }
  
  // Error state
  if (error) {
    return (
      <div className="squad-error">
        <h3>Error Loading Squad</h3>
        <p>{error}</p>
        <button onClick={refresh} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  // No team selected state
  if (!currentTeam) {
    return (
      <div className="squad-error">
        <h3>No Team Selected</h3>
        <p>Please select a team to view squad information.</p>
        <button onClick={() => navigate('/teams')} className="back-button">
          Back to Teams
        </button>
      </div>
    );
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
        team={currentTeam}
        joinRequestsCount={joinRequests.length}
      />
      
      {isLoading && !initialLoad && (
        <div className="squad-loading-overlay">
          <div className="squad-loading-content">Updating squad information...</div>
        </div>
      )}
      
      {showJoinModal && currentTeam && (
        <JoinTeamDialog
          team={currentTeam}
          onJoin={handleJoinTeamSubmit}
          onCancel={() => setShowJoinModal(false)}
        />
      )}
      
      <div className="squad-container">
        {teamHasMembers ? (
          <>
            <MemberList 
              members={[...managers, ...athletes, ...coaches]}
              team={currentTeam}
              isManager={isManager}
              onMemberUpdate={refresh}
              onRemoveMember={handleRemoveMember}
              onAcceptRequest={handleAcceptRequest}
              onDeclineRequest={handleDeclineRequest}
              joinRequests={joinRequests}
              loadingRequests={loadingRequests}
            />
          </>
        ) : (
          <div className="empty-state">
            <p>
              This team has no members yet. {
                isManager 
                  ? 'Manage join requests to add members!' 
                  : 'Join the team to get started!'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Squad;