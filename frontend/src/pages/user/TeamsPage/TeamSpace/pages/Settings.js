import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../../contexts/AuthContext';
import apiClient from '../../../../../services/apiClient';
import '../tabs/TabComponents.css';
import '../TeamSpace.css'; // Ensure this CSS file (containing .danger-zone and .leave-team-button styles) is imported

const Settings = ({ team, isManager }) => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teamData, setTeamData] = useState(team || null);
  const [loading, setLoading] = useState(!team);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: team?.name || '',
    abbreviation: team?.abbreviation || '',
    city: team?.city || '',
    foundedYear: team?.foundedYear || '',
    nickname: team?.nickname || '',
    description: team?.description || ''
  });
  
  useEffect(() => {
    // If team prop changes, update form data
    if (team && team !== teamData) {
      setTeamData(team);
      setFormData({
        name: team.name || '',
        abbreviation: team.abbreviation || '',
        city: team.city || '',
        foundedYear: team.foundedYear || '',
        nickname: team.nickname || '',
        description: team.description || ''
      });
    }
  }, [team, teamData]);
  
  // Check if user is a manager
  useEffect(() => {
    if (!isManager) {
      navigate(`/teams/${teamId}/space/overview`);
    }
  }, [isManager, navigate, teamId]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      
      // Ensure using apiClient for consistency if it's set up for PATCH
      // If not, the existing fetch is fine but ensure auth headers if needed
      const response = await apiClient.patch(`/api/teams/${teamId}`, formData);
      
      // Assuming apiClient returns data directly or a specific structure
      // Adjust based on actual apiClient response
      if (response && (response.success || response.team)) { // Check for common success patterns
        const updatedTeamData = response.team || response.data || response; // Adjust based on actual response
        setTeamData(prev => ({...prev, ...updatedTeamData, ...formData})); // Merge formData to reflect immediate UI changes
        setFormData(prev => ({...prev, ...updatedTeamData})); // Update formData with any backend-transformed data
        setSaveSuccess(true);
        toast.success('Team settings updated successfully!');
        
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        throw new Error(response?.message || 'Failed to update team. Unexpected response.');
      }
    } catch (error) {
      console.error('Error updating team:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while saving changes';
      setSaveError(errorMessage);
      toast.error(`Failed to save changes: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };
  
  const handleLeaveTeam = () => {
    // Use teamData.members if available, otherwise fallback to team.members (passed as prop)
    const currentMembers = teamData?.members || team?.members || [];
    if (isManager && currentMembers.length > 1) {
      toast.warning("As the manager, you must transfer management before leaving, or remove all other members.");
      return;
    }
    
    setShowConfirmLeave(true);
  };
  
  const confirmLeaveTeam = async () => {
    if (!user?.id) {
      toast.error("Authentication error. Please try logging in again.");
      return;
    }
    
    try {
      setIsLeaving(true);
      const response = await apiClient.delete(`/api/teams/${teamId}/members/${user.id}`);
      
      if (response.success) {
        toast.success('You have left the team. Since you were the only member, the team has been deleted.');
        // Clear any team-related data from localStorage
        localStorage.removeItem('lastTeamId');
        // Navigate to teams list
        navigate('/teams');
      } else {
        toast.error(response.message || 'Failed to leave team');
      }
    } catch (err) {
      console.error('Error leaving team:', err);
      toast.error(err.response?.data?.message || 'Failed to leave team');
    } finally {
      setIsLeaving(false);
      setShowConfirmLeave(false);
    }
  };
  
  if (loading) return <div className="loading-message">Loading team settings...</div>;
  if (!teamData) return <div className="error-message">Team not found</div>;
  
  return (
    <div className="team-page settings-page">
      <div className="settings-header">
        <h2>Team Settings</h2>
      </div>
      
      <div className="settings-section">
        <h3>Basic Information</h3>
        {saveSuccess && (
          <div className="save-success-message">
            <i className="fas fa-check-circle"></i> Team settings updated successfully!
          </div>
        )}
        
        {saveError && (
          <div className="save-error-message">
            <i className="fas fa-exclamation-circle"></i> Error: {saveError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="team-settings-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Team Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="abbreviation">Abbreviation:</label>
              <input
                type="text"
                id="abbreviation"
                name="abbreviation"
                value={formData.abbreviation}
                onChange={handleInputChange}
                maxLength="5"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nickname">Nickname:</label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="city">City:</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="foundedYear">Founded Year:</label>
            <input
              type="number"
              id="foundedYear"
              name="foundedYear"
              value={formData.foundedYear}
              onChange={handleInputChange}
              min="1800"
              max={new Date().getFullYear()}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Team Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
            ></textarea>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="save-button"
              disabled={saving}
            >
              {saving ? (
                <><i className="fas fa-spinner fa-spin"></i> Saving...</>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Separate the danger zone and leave button completely */}
      <div className="settings-section danger-zone-section">
        <h3 className="danger-zone-heading">
          <i className="fas fa-exclamation-triangle"></i> Danger Zone
        </h3>
        <p className="danger-zone-text">
          Leaving a team when you are the sole member will permanently delete the team. All team data, 
          members, matches, and other associated data will be lost.
        </p>
      </div>
      
      {/* Completely separate leave button container */}
      <div className="leave-team-button-wrapper">
        <button 
          type="button"
          className="leave-team-button"
          onClick={handleLeaveTeam}
          disabled={isLeaving}
        >
          <i className="fas fa-sign-out-alt"></i> Leave Team
        </button>
      </div>
      
      {showConfirmLeave && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Leave & Delete Team?</h3>
            <p>
              You are the only member of <strong>{teamData.name}</strong>. 
              Leaving the team will <strong>delete the team and all its data</strong>. 
              This action cannot be undone.
            </p>
            <div className="confirmation-buttons">
              <button 
                className="cancel-button"
                onClick={() => setShowConfirmLeave(false)}
                disabled={isLeaving}
              >
                Cancel
              </button>
              <button 
                className="danger-button"
                onClick={confirmLeaveTeam}
                disabled={isLeaving}
              >
                {isLeaving ? (
                  <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                ) : (
                  'Leave & Delete Team'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
