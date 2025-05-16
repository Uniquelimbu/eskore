import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../../../../../contexts/AuthContext';
import apiClient from '../../../../../../services/apiClient';
import { isUserManager } from '../../../../../../utils/permissions';
import './Settings.css';

const Settings = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const outletCtx = useOutletContext(); // {team, isManager}

  const [team, setTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    city: '',
    foundedYear: '',
    logoUrl: ''
  });
  const [statusMsg, setStatusMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isManager, setIsManager] = useState(outletCtx?.isManager || false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch team details on mount
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get(`/api/teams/${teamId}`);
        setTeam(data);
        setFormData({
          name: data.name || '',
          nickname: data.nickname || '',
          city: data.city || '',
          foundedYear: data.foundedYear || '',
          logoUrl: data.logoUrl || ''
        });
        const resolvedIsManager = (outletCtx && outletCtx.isManager !== undefined)
          ? outletCtx.isManager
          : isUserManager(data, user);

        setIsManager(resolvedIsManager);
      } catch (err) {
        console.error('Error loading team:', err);
        setStatusMsg({ type: 'error', text: err.message || 'Failed to load team.' });
      } finally {
        setLoading(false);
      }
    };
    if (teamId) fetchTeam();
  }, [teamId, user, outletCtx]);

  // Additional effect to fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        if (teamId) {
          const response = await apiClient.get(`/api/teams/${teamId}/members`);
          if (response && response.members) {
            setTeamMembers(response.members);
          }
        }
      } catch (err) {
        console.error('Error fetching team members:', err);
      }
    };
    
    fetchTeamMembers();
  }, [teamId]);

  const handleBack = () => navigate(`/teams/${teamId}/space`);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.put(`/api/teams/${teamId}`, formData);
      setStatusMsg({ type: 'success', text: 'Team updated successfully.' });
    } catch (err) {
      console.error('Save failed:', err);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLeaveTeamClick = () => {
    setShowLeaveConfirm(true);
  };

  const handleLeaveTeam = async () => {
    try {
      // Fix: Use user.id instead of user.userId 
      // The correct URL should be /api/teams/${teamId}/members/${user.id}
      await apiClient.delete(`/api/teams/${teamId}/members/${user.id}`);
      navigate('/teams');
    } catch (err) {
      console.error('Leave team failed:', err);
      
      // Better error handling with specific messages for different cases
      let errorMessage = 'Failed to leave team.';
      
      if (err.response) {
        if (err.response.status === 403 && err.response.data?.code === 'FORBIDDEN_MANAGER_LEAVE') {
          errorMessage = 'You need to transfer manager role before leaving the team.';
        } else if (err.response.status === 404) {
          errorMessage = 'Team member relationship not found.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setStatusMsg({ type: 'error', text: errorMessage });
      setShowLeaveConfirm(false); // Close the dialog on error
    }
  };

  const handleDeleteTeam = async () => {
    try {
      setDeleteLoading(true);
      setStatusMsg({ type: 'info', text: 'Deleting team...' });
      
      await apiClient.delete(`/api/teams/${teamId}`);
      
      // Show success message before navigating
      setStatusMsg({ type: 'success', text: 'Team deleted successfully!' });
      setTimeout(() => navigate('/teams'), 1000);
    } catch (err) {
      console.error('Delete team failed:', err);
      setDeleteLoading(false);
      
      // More targeted error messages
      let errorMessage = 'Failed to delete team.';
      
      if (err.status === 408 || (err.message && err.message.includes('timeout'))) {
        errorMessage = 'The request timed out. Please try again or contact support.';
      } else if (err.status === 403) {
        errorMessage = 'You don\'t have permission to delete this team.';
      } else if (err.status === 404) {
        errorMessage = 'Team not found. It may have been already deleted.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setStatusMsg({ type: 'error', text: errorMessage });
      setShowDeleteConfirm(false); // Close dialog on error
    }
  };

  // ---------- RENDER ----------
  if (loading) {
    return <div className="loading-message">Loading settings…</div>;
  }

  if (!team) {
    return (
      <div className="settings-page">
        <div className="settings-header">
          <button className="back-button" onClick={handleBack}>&larr; Back</button>
        </div>
        <p className="save-error-message">Team not found.</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button className="back-button" onClick={handleBack}>&larr; Back</button>
        <h2>Team Settings</h2>
      </div>

      {statusMsg && (
        <div className={statusMsg.type === 'success' ? 'save-success-message' : 'save-error-message'}>
          {statusMsg.text}
        </div>
      )}

      {/* TEAM INFO SECTION */}
      <div className="settings-section">
        <h3>Team Information</h3>
        <form className="team-settings-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isManager}
              />
            </div>
            <div className="form-group">
              <label htmlFor="nickname">Nickname</label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                value={formData.nickname}
                onChange={handleInputChange}
                disabled={!isManager}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                disabled={!isManager}
              />
            </div>
            <div className="form-group">
              <label htmlFor="foundedYear">Founded</label>
              <input
                id="foundedYear"
                name="foundedYear"
                type="number"
                value={formData.foundedYear}
                onChange={handleInputChange}
                disabled={!isManager}
              />
            </div>
          </div>
          {/* Logo Upload (simplified) */}
          <div className="logo-section">
            <div className="current-logo">
              {formData.logoUrl ? (
                <img className="team-logo-img" src={formData.logoUrl} alt="team logo" />
              ) : (
                <div className="logo-placeholder">{formData.abbreviation || formData.name.charAt(0)}</div>
              )}
            </div>
            {isManager && (
              <div className="logo-actions">
                {/* TODO: Implement actual upload */}
                <button className="upload-logo-button" type="button" disabled>
                  Upload New Logo
                </button>
                <button className="remove-logo-button" type="button" disabled={!formData.logoUrl}>
                  Remove Logo
                </button>
              </div>
            )}
          </div>
          {isManager && (
            <div className="form-actions">
              <button
                className="save-button"
                type="button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* DANGER ZONE SECTION */}
      <div className="settings-section danger-zone-section">
        <h3 className="danger-zone-heading">Danger Zone</h3>
        <p className="danger-zone-text">
          Leaving a team will remove you from its roster. Deleting a team is permanent.
        </p>
        <div className="delete-team-button-wrapper">
          <button className="danger-button" onClick={handleLeaveTeamClick}>
            Leave Team
          </button>
          {isManager && (
            <button className="danger-button" onClick={() => setShowDeleteConfirm(true)} style={{ marginLeft: '16px' }}>
              Delete Team
            </button>
          )}
        </div>
      </div>

      {/* CONFIRM DELETE POPUP */}
      {showDeleteConfirm && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Delete Team</h3>
            <p>
              This will permanently delete the team and all related data. Are you sure you want to proceed?
            </p>
            <div className="confirmation-buttons">
              <button 
                className="cancel-button" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                className="danger-button" 
                onClick={handleDeleteTeam}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM LEAVE POPUP */}
      {showLeaveConfirm && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Leave Team</h3>
            
            {isManager && teamMembers.filter(m => m.role === 'manager' || m.role === 'assistant_manager').length <= 1 ? (
              teamMembers.length > 1 ? (
                // Case 1: Manager with team members but no other managers
                <p>
                  You are the only manager of this team. You need to appoint another team member as manager before you can leave.
                </p>
              ) : (
                // Case 2: Manager is the only member
                <p>
                  You are the only member of this team. If you leave, the team will be permanently deleted.
                </p>
              )
            ) : (
              // Regular member or manager with other managers
              <p>
                Are you sure you want to leave this team? You will lose access to all team resources.
              </p>
            )}
            
            <div className="confirmation-buttons">
              <button className="cancel-button" onClick={() => setShowLeaveConfirm(false)}>Cancel</button>
              
              {isManager && teamMembers.filter(m => m.role === 'manager' || m.role === 'assistant_manager').length <= 1 && teamMembers.length > 1 ? (
                // Disabled for managers without other managers
                <button className="danger-button" disabled>
                  Leave Team
                </button>
              ) : (
                <button className="danger-button" onClick={handleLeaveTeam}>
                  {isManager && teamMembers.length <= 1 ? "Leave & Delete Team" : "Leave Team"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
