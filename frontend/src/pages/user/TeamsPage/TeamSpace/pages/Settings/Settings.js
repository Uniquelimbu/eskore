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
  const [isManager, setIsManager] = useState(outletCtx?.isManager || false);

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

  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;
    try {
      await apiClient.post(`/api/teams/${teamId}/leave`);
      navigate('/teams');
    } catch (err) {
      console.error('Leave team failed:', err);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to leave team.' });
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await apiClient.delete(`/api/teams/${teamId}`);
      navigate('/teams');
    } catch (err) {
      console.error('Delete team failed:', err);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete team.' });
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
          <button className="back-button" onClick={handleBack}>&larr; Back to Team Space</button>
        </div>
        <p className="save-error-message">Team not found.</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button className="back-button" onClick={handleBack}>&larr; Back to Team Space</button>
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
          <button className="cancel-button" onClick={handleLeaveTeam}>
            Leave Team
          </button>
          {isManager && (
            <button className="danger-button" onClick={() => setShowDeleteConfirm(true)}>
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
              <button className="cancel-button" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="danger-button" onClick={handleDeleteTeam}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
