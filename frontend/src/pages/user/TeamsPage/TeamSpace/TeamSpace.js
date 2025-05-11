import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Add toast import
import { useAuth } from '../../../../contexts/AuthContext';
import apiClient from '../../../../services/apiClient';
import PageLayout from '../../../../components/PageLayout/PageLayout';
import Overview from './pages/Overview';
import Squad from './pages/Squad';
import Formation from './pages/Formation';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import './TeamSpace.css';

const TeamSpace = () => {
  const { teamId } = useParams();
  const { user, verifyUserData } = useAuth(); // Add verifyUserData to destructuring
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTransferManagerModal, setShowTransferManagerModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [selectedNewManager, setSelectedNewManager] = useState(null);
  const [showLeaveDeleteConfirm, setShowLeaveDeleteConfirm] = useState(false);
  
  // Robust user authentication and refresh logic in a single effect
  useEffect(() => {
    const validateAndRefreshUser = async () => {
      if (!user || !user.id) {
        console.warn('TeamSpace: User data is incomplete or missing. Attempting to refresh auth state...');
        try {
          // Try to refresh the user data from the auth context
          const refreshedUser = await verifyUserData(true);
          if (!refreshedUser || !refreshedUser.id) {
            // If still not valid, try to refresh from API directly as a fallback
            const token = localStorage.getItem('token');
            if (!token) {
              toast.error('Your session has expired. Please log in again.');
              navigate('/login');
              return;
            }
            try {
              const response = await apiClient.get('/api/auth/me');
              if (response && response.id) {
                console.log('TeamSpace: Successfully refreshed user data from API');
                // Optionally update context here if needed
              } else {
                toast.error('Unable to verify your identity. Please log in again.');
                navigate('/login');
              }
            } catch (err) {
              console.error('TeamSpace: Failed to refresh user data from API', err);
              toast.error('Authentication error. Please log in again.');
              navigate('/login');
            }
          } else {
            console.log('TeamSpace: Successfully refreshed user data from context:', refreshedUser);
          }
        } catch (error) {
          console.error('TeamSpace: Error refreshing auth state:', error);
          toast.error('Session expired. Please login again.');
          navigate('/login');
        }
      }
    };

    validateAndRefreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, verifyUserData]);

  // Fetch team data - modify to depend on validated user
  useEffect(() => {
    const fetchTeamData = async () => {
      // Only proceed if user is authenticated with a valid ID
      if (!user || !user.id) {
        console.warn('TeamSpace: Skipping team data fetch due to missing user ID');
        return;
      }
      
      try {
        setLoading(true);
        console.log(`Fetching team data for ID: ${teamId}`);
        
        const response = await apiClient.get(`/api/teams/${teamId}`);
        
        // Debug team response structure
        console.log('Team data response:', response);
        
        if (!response || typeof response !== 'object') {
          console.error('Invalid team response format:', response);
          setError('Invalid team data received');
          setLoading(false);
          return;
        }
        
        // apiClient already returns the data part of the response
        setTeam(response);
        
        // Determine user's role in the team
        if (Array.isArray(response.Users)) {
          const userMembership = response.Users.find(u => u.id === user?.id);
          console.log('User membership found:', userMembership);
          setUserRole(userMembership?.UserTeam?.role || null);
        } else {
          console.warn('No Users array in team response');
        }
        
        // Get all team members
        console.log(`Fetching members for team ID: ${teamId}`);
        const membersResponse = await apiClient.get(`/api/teams/${teamId}/members`);
        console.log('Members response:', membersResponse);
        
        // Update members array from response
        if (membersResponse && membersResponse.members) {
          setMembers(membersResponse.members);
        } else {
          console.warn('No members array in response:', membersResponse);
          setMembers([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching team data:', err);
        // Provide more detailed error message based on the error
        let errorMessage = 'Failed to load team information. Please try again.';
        if (err.status === 404) {
          errorMessage = `Team with ID ${teamId} not found`;
        } else if (err.status === 401) {
          errorMessage = 'You are not authorized to view this team';
        } else if (err.message) {
          errorMessage = `Error: ${err.message}`;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    if (teamId && user && user.id) {
      fetchTeamData();
    }
  }, [teamId, user, user?.id]);
  
  const isManager = userRole === 'manager';
  const otherMembers = members.filter(m => m.id !== user?.id);
  
  const handleInviteMember = () => {
    navigate(`/teams/${teamId}/invite`);
  };
  
  const handleDeleteTeam = async () => {
    try {
      setIsDeleting(true);
      const response = await apiClient.delete(`/api/teams/${teamId}`);
      
      if (response.success) {
        toast.success('Team deleted successfully');
        navigate('/teams');
      }
    } catch (err) {
      console.error('Error deleting team:', err);
      let errorMessage = 'Failed to delete team. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  const toggleDeleteConfirm = () => {
    // Show warning if there are other members
    if (members.length > 1 && isManager) {
      toast.warning('You must remove all other members before deleting the team');
      return;
    }
    
    setShowDeleteConfirm(prev => !prev);
  };

  // Helper: remove the current user from the team then navigate out
  const leaveTeam = async () => {
    try {
      const response = await apiClient.delete(`/api/teams/${teamId}/members/${user.id}`);
      if (response.success) {
        toast.success('You have left the team');
        navigate('/teams');
      }
    } catch (err) {
      console.error('Error leaving team:', err);
      toast.error(err.response?.data?.message || 'Failed to leave team');
      throw err; // rethrow so callers know it failed
    }
  };

  const handleLeaveTeam = async () => {
    // Case 1: Manager with other members -> must transfer role first
    if (isManager && members.length > 1) {
      setShowTransferManagerModal(true);
      return;
    }

    // Case 2: Sole remaining member (manager or not) -> confirm that team will be deleted
    if (members.length === 1) {
      setShowLeaveDeleteConfirm(true);
      return;
    }

    // Case 3: Regular member (not last one) can leave directly
    await leaveTeam();
  };
  
  const confirmLeaveAndDelete = async () => {
    // Called when user confirms they understand team will be deleted
    try {
      // Check if user ID is valid before proceeding
      if (!user || !user.id) {
        console.error('User ID is missing. User object:', user);
        
        // Try to refresh user data one more time
        const refreshedUser = await verifyUserData(true);
        
        // If still no valid user ID, show error
        if (!refreshedUser || !refreshedUser.id) {
          toast.error('Authentication error: Unable to identify user. Please try logging in again.');
          setShowLeaveDeleteConfirm(false);
          return;
        }
        
        console.log(`Recovered user ID from refresh: ${refreshedUser.id}`);
        const response = await apiClient.delete(`/api/teams/${teamId}/members/${refreshedUser.id}`);
        
        if (response.success) {
          toast.success('You have left the team and the team was deleted');
          localStorage.removeItem('lastTeamId');
          navigate('/teams');
          return;
        }
      } else {
        console.log(`Attempting to leave team ${teamId} as user ${user.id}`);
      
        const response = await apiClient.delete(`/api/teams/${teamId}/members/${user.id}`);
      
        if (response.success) {
          toast.success('You have left the team and the team was deleted');
        
          // Remove from localStorage if this was the last active team
          const lastTeamId = localStorage.getItem('lastTeamId');
          if (lastTeamId === teamId) {
            localStorage.removeItem('lastTeamId');
          }
        
          navigate('/teams');
        } else {
          // This handles the case where the API returns success: false
          throw new Error(response.message || 'Unknown error when leaving team');
        }
      }
    } catch (err) {
      console.error('Error leaving and deleting team:', err);
      
      // More detailed error handling
      let errorMessage = 'Failed to leave team';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setShowLeaveDeleteConfirm(false);
    }
  };

  const handleTransferManager = async () => {
    if (!selectedNewManager) {
      toast.error('Please select a team member to transfer manager role to');
      return;
    }
    
    try {
      setIsTransferring(true);
      const response = await apiClient.post(`/api/teams/${teamId}/transfer-manager`, {
        newManagerId: selectedNewManager
      });
      
      if (response.success) {
        toast.success('Manager role transferred successfully');
        setShowTransferManagerModal(false);
        // Immediately leave the team now that role has been transferred
        await leaveTeam();
        return; // exit handler; navigation already performed
      }
    } catch (err) {
      console.error('Error transferring manager role:', err);
      toast.error(err.response?.data?.message || 'Failed to transfer manager role');
    } finally {
      setIsTransferring(false);
    }
  };

  // Navigate to specific section
  const navigateTo = (path) => {
    navigate(`/teams/${teamId}/space/${path}`);
  };

  if (loading) {
    return (
      <PageLayout className="team-space-content" maxWidth="1200px" withPadding={true}>
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading team information...</p>
        </div>
      </PageLayout>
    );
  }
  
  if (error || !team) {
    return (
      <PageLayout className="team-space-content" maxWidth="1200px" withPadding={true}>
        <div className="error-message">
          {error || 'Team not found'}
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout className="team-space-content" maxWidth="1200px" withPadding={true}>
      <div className="team-space-header">
        {/* Add Leave Team button at the top right */}
        <button 
          className="leave-team-button"
          onClick={handleLeaveTeam}
          title="Leave this team"
        >
          <i className="fas fa-sign-out-alt"></i> Leave Team
        </button>
        
        <div className="team-identity-section">
          {team.logoUrl ? (
            <img src={team.logoUrl} alt={`${team.name} logo`} className="team-logo" />
          ) : (
            <div className="team-logo-placeholder">
              {team.abbreviation || team.name.substring(0, 3)}
            </div>
          )}
          <div className="team-details">
            <h1>
              {team.name} 
              {team.abbreviation && <span className="team-abbreviation">[{team.abbreviation}]</span>}
            </h1>
            {team.nickname && <p className="team-nickname">{team.nickname}</p>}
            <p className="team-founded">Est. {team.foundedYear || new Date().getFullYear()}</p>
            <div className="team-meta">
              <span className="team-city">{team.city}</span>
              {/* Team privacy indicator removed for MVP */}
            </div>
          </div>
        </div>

        <div className="team-quick-stats">
          <div className="stat-item">
            <span className="stat-value">Record: 0-0-0-0-0</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">Members: {members.length}/30</span>
          </div>
        </div>

        <div className="team-actions">
          {isManager ? (
            <>
              <button className="action-button primary" onClick={handleInviteMember}>
                <i className="fas fa-user-plus"></i> Invite Players
              </button>
              <button className="action-button secondary">
                <i className="fas fa-cog"></i> Team Settings
              </button>
              <button 
                className="action-button danger"
                onClick={toggleDeleteConfirm}
                disabled={isDeleting || members.length > 1}
                title={members.length > 1 ? "Remove all members first" : "Delete team (team will be deleted)"}
              >
                <i className="fas fa-trash-alt"></i> Delete Team
              </button>
              {/* Remove Leave Team button from here */}
            </>
          ) : (
            // Remove Leave Team button from here - it's now positioned at the top right
            <div style={{ height: '1px' }}></div> // Placeholder div to maintain layout spacing
          )}

        </div>
      </div>
      
      <div className="team-navigation-buttons">
        <button 
          className="navigation-button" 
          onClick={() => navigateTo('overview')}
        >
          <i className="fas fa-home"></i>
          Overview
        </button>
        <button 
          className="navigation-button" 
          onClick={() => navigateTo('squad')}
        >
          <i className="fas fa-users"></i>
          Squad
        </button>
        <button 
          className="navigation-button" 
          onClick={() => navigateTo('formation')}
        >
          <i className="fas fa-futbol"></i>
          Formation
        </button>
        <button 
          className="navigation-button" 
          onClick={() => navigateTo('calendar')}
        >
          <i className="fas fa-calendar-alt"></i>
          Calendar
        </button>
        {isManager && (
          <button 
            className="navigation-button" 
            onClick={() => navigateTo('settings')}
          >
            <i className="fas fa-cog"></i>
            Settings
          </button>
        )}
      </div>
      
      <div className="team-space-tab-content">
        <Routes>
          <Route path="overview" element={<Overview team={team} members={members} isManager={isManager} />} />
          <Route path="squad" element={<Squad team={team} members={members} isManager={isManager} />} />
          <Route path="formation" element={<Formation team={team} members={members} isManager={isManager} />} />
          <Route path="calendar" element={<Calendar team={team} members={members} isManager={isManager} />} />
          {isManager && <Route path="settings" element={<Settings team={team} members={members} isManager={isManager} />} />}
          <Route path="/" element={<Navigate to={`/teams/${teamId}/space/overview`} replace />} />
        </Routes>
      </div>

      {/* Confirmation dialog for deletion */}
      {showDeleteConfirm && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-dialog">
            <h3>Delete Team?</h3>
            <p>Are you sure you want to delete <strong>{team.name}</strong>? This action cannot be undone.</p>
            <div className="confirmation-buttons">
              <button 
                className="cancel-button"
                onClick={toggleDeleteConfirm}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="delete-button"
                onClick={handleDeleteTeam}
                disabled={isDeleting}
              >
                {isDeleting ? <><i className="fas fa-spinner fa-spin"></i> Deleting...</> : 'Delete Team'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Transfer manager role modal */}
      {showTransferManagerModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h3>Transfer Manager Role</h3>
            <p>As the team manager, you must transfer your role before leaving the team.</p>
            <p>Select a new manager:</p>
            
            <div className="member-select-container">
              {otherMembers.length > 0 ? (
                <select 
                  className="member-select"
                  value={selectedNewManager || ''}
                  onChange={(e) => setSelectedNewManager(e.target.value)}
                >
                  <option value="">Select a team member</option>
                  {otherMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="error-message">No other members available to transfer role to.</p>
              )}
            </div>
            
            <div className="modal-buttons">
              <button 
                className="cancel-button"
                onClick={() => setShowTransferManagerModal(false)}
                disabled={isTransferring}
              >
                Cancel
              </button>
              <button 
                className="primary-button"
                onClick={handleTransferManager}
                disabled={isTransferring || !selectedNewManager}
              >
                {isTransferring ? <><i className="fas fa-spinner fa-spin"></i> Transferring...</> : 'Transfer & Leave'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation dialog when the last member attempts to leave (team will be deleted) */}
      {showLeaveDeleteConfirm && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-dialog">
            <h3>Leave Team & Delete?</h3>
            <p>You are the only member of <strong>{team.name}</strong>. Leaving the team will <strong>delete the team and all its data</strong>. Are you sure you want to proceed?</p>
            <div className="confirmation-buttons">
              <button 
                className="cancel-button"
                onClick={() => setShowLeaveDeleteConfirm(false)}
              >
                No, Stay
              </button>
              <button 
                className="delete-button"
                onClick={confirmLeaveAndDelete}
              >
                Yes, Delete Team
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default TeamSpace;
