import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Add toast import
import { useAuth } from '../../../../contexts/AuthContext';
import apiClient from '../../../../utils/apiClient';
import Sidebar from '../../components/Sidebar/Sidebar';
import PageLayout from '../../../../components/PageLayout/PageLayout';
import Overview from './tabs/Overview';
import Squad from './tabs/Squad';
import Formation from './tabs/Formation';
import Calendar from './tabs/Calendar';
import Chat from './tabs/Chat';
import './TeamSpace.css';

const TeamSpace = () => {
  const { teamId } = useParams();
  const { user } = useAuth();
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
  
  // Fetch team data
  useEffect(() => {
    const fetchTeamData = async () => {
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
    
    if (teamId) {
      fetchTeamData();
    }
  }, [teamId, user?.id]);
  
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

  const handleLeaveTeam = async () => {
    if (isManager && members.length > 1) {
      // Manager with other members - must transfer ownership first
      setShowTransferManagerModal(true);
    } else {
      // Regular member or sole manager can leave directly
      try {
        const response = await apiClient.delete(`/api/teams/${teamId}/members/${user.id}`);
        if (response.success) {
          toast.success('You have left the team');
          navigate('/teams');
        }
      } catch (err) {
        console.error('Error leaving team:', err);
        toast.error(err.response?.data?.message || 'Failed to leave team');
      }
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
        
        // Refresh team data to update roles
        const updatedTeamData = await apiClient.get(`/api/teams/${teamId}`);
        setTeam(updatedTeamData);
        
        // Find user's new role in the updated data
        if (Array.isArray(updatedTeamData.Users)) {
          const userMembership = updatedTeamData.Users.find(u => u.id === user?.id);
          if (userMembership && userMembership.UserTeam) {
            setUserRole(userMembership.UserTeam.role);
          }
        }
      }
    } catch (err) {
      console.error('Error transferring manager role:', err);
      toast.error(err.response?.data?.message || 'Failed to transfer manager role');
    } finally {
      setIsTransferring(false);
    }
  };

  if (loading) {
    return (
      <div className="team-space-layout">
        <Sidebar />
        <PageLayout className="team-space-content" maxWidth="1200px" withPadding={true}>
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>Loading team information...</p>
          </div>
        </PageLayout>
      </div>
    );
  }
  
  if (error || !team) {
    return (
      <div className="team-space-layout">
        <Sidebar />
        <PageLayout className="team-space-content" maxWidth="1200px" withPadding={true}>
          <div className="error-message">
            {error || 'Team not found'}
          </div>
        </PageLayout>
      </div>
    );
  }
  
  return (
    <div className="team-space-layout">
      <Sidebar />
      <PageLayout className="team-space-content" maxWidth="1200px" withPadding={true}>
        <div className="team-space-header">
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
                <span className="team-privacy">Private Team</span>
              </div>
            </div>
          </div>

          <div className="team-quick-stats">
            <div className="stat-item">
              <span className="stat-value">0-0-0</span>
              <span className="stat-label">Record (W-L-D)</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">None</span>
              <span className="stat-label">Next Match</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{members.length}</span>
              <span className="stat-label">Members</span>
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
                  title={members.length > 1 ? "Remove all members first" : "Delete team"}
                >
                  <i className="fas fa-trash-alt"></i> Delete Team
                </button>
                <button 
                  className="action-button warning"
                  onClick={handleLeaveTeam}
                >
                  <i className="fas fa-sign-out-alt"></i> Leave Team
                </button>
              </>
            ) : (
              <button 
                className="action-button warning"
                onClick={handleLeaveTeam}
              >
                <i className="fas fa-sign-out-alt"></i> Leave Team
              </button>
            )}
            <div className="notification-bell">
              <i className="fas fa-bell"></i>
              <span className="notification-badge">0</span>
            </div>
          </div>
        </div>
        
        <div className="team-tabs">
          <NavLink 
            to={`/teams/${teamId}/space/overview`} 
            className={({isActive}) => isActive ? 'tab-link active' : 'tab-link'}
          >
            Overview
          </NavLink>
          <NavLink 
            to={`/teams/${teamId}/space/squad`} 
            className={({isActive}) => isActive ? 'tab-link active' : 'tab-link'}
          >
            Squad
          </NavLink>
          <NavLink 
            to={`/teams/${teamId}/space/formation`} 
            className={({isActive}) => isActive ? 'tab-link active' : 'tab-link'}
          >
            Formation
          </NavLink>
          <NavLink 
            to={`/teams/${teamId}/space/calendar`} 
            className={({isActive}) => isActive ? 'tab-link active' : 'tab-link'}
          >
            Calendar
          </NavLink>
          <NavLink 
            to={`/teams/${teamId}/space/chat`} 
            className={({isActive}) => isActive ? 'tab-link active' : 'tab-link'}
          >
            Chat
          </NavLink>
        </div>
        
        <div className="team-space-tab-content">
          <Routes>
            <Route path="overview" element={<Overview team={team} members={members} isManager={isManager} />} />
            <Route path="squad" element={<Squad team={team} members={members} isManager={isManager} />} />
            <Route path="formation" element={<Formation team={team} members={members} isManager={isManager} />} />
            <Route path="calendar" element={<Calendar team={team} members={members} isManager={isManager} />} />
            <Route path="chat" element={<Chat team={team} members={members} isManager={isManager} />} />
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
      </PageLayout>
    </div>
  );
};

export default TeamSpace;
