import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../../../contexts/AuthContext';
import apiClient from '../../../../../../services/apiClient';
import PageLayout from '../../../../../../components/PageLayout/PageLayout';
import '../../TeamSpace.css'; // Ensure this CSS file is imported

const Settings = ({ team, members: propMembers, isManager: propIsManager }) => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teamData, setTeamData] = useState(team || null);
  const [members, setMembers] = useState(propMembers || []);
  const [loading, setLoading] = useState(!team);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [isManager, setIsManager] = useState(propIsManager || false);
  
  // State for team deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    city: '',
    foundedYear: '',
    nickname: '',
    description: ''
  });

  // Load team data if not provided as props
  useEffect(() => {
    const fetchTeamData = async () => {
      if (team) {
        // If we have props, use them
        setTeamData(team);
        setMembers(propMembers || []);
        setFormData({
          name: team.name || '',
          abbreviation: team.abbreviation || '',
          city: team.city || '',
          foundedYear: team.foundedYear || '',
          nickname: team.nickname || '',
          description: team.description || ''
        });
        setLoading(false);
        return;
      }

      // Otherwise fetch from API
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/teams/${teamId}`);
        
        if (!response) {
          throw new Error('No response from server');
        }
        
        setTeamData(response);
        
        // Determine user's role in the team
        let userRoleFound = null;
        if (response.Users && Array.isArray(response.Users)) {
          const userMembership = response.Users.find(u => String(u.id) === String(user?.id));
          
          if (userMembership && userMembership.UserTeam) {
            userRoleFound = userMembership.UserTeam.role;
          }
        }
        
        setIsManager(userRoleFound === 'manager' || userRoleFound === 'owner');
        
        // Get members
        const membersResponse = await apiClient.get(`/api/teams/${teamId}/members`);
        
        if (membersResponse && membersResponse.members) {
          setMembers(membersResponse.members);
        }
        
        // Set form data
        setFormData({
          name: response.name || '',
          abbreviation: response.abbreviation || '',
          city: response.city || '',
          foundedYear: response.foundedYear || '',
          nickname: response.nickname || '',
          description: response.description || ''
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching team data:', error);
        setLoading(false);
        toast.error('Failed to load team data. Please try again.');
      }
    };

    fetchTeamData();
  }, [teamId, team, propMembers, user]);
  
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
  
  // Team deletion logic moved from TeamSpace
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
    const currentMembers = members || [];
    if (currentMembers.length > 1 && isManager) {
      toast.warning('You must remove all other members before deleting the team');
      return;
    }
    
    setShowDeleteConfirm(prev => !prev);
  };
  
  const handleBackClick = () => {
    // Direct navigation to team space instead of using browser history
    navigate(`/teams/${teamId}/space`);
  };
  
  if (loading) return <div className="loading-message">Loading team settings...</div>;
  if (!teamData) return <div className="error-message">Team not found</div>;
  
  return (
    <PageLayout className="team-settings-content" maxWidth="1200px" withPadding={true}>
      <div className="settings-header">
        <div className="settings-header-top">
          <button 
            className="back-button" 
            onClick={handleBackClick}
          >
            <i className="fas fa-arrow-left"></i> Back to Team Space
          </button>
          <h1>Team Settings</h1>
        </div>
        {teamData && (
          <div className="team-info-summary">
            <h2>{teamData.name}</h2>
            {teamData.nickname && <p className="nickname">{teamData.nickname}</p>}
            <p className="meta-details">
              {teamData.city && <span className="city">{teamData.city}</span>}
              {teamData.foundedYear && <span className="founded">Est. {teamData.foundedYear}</span>}
            </p>
          </div>
        )}
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
      
      {/* Separate the danger zone with both deletion options */}
      <div className="settings-section danger-zone-section">
        <h3 className="danger-zone-heading">
          <i className="fas fa-exclamation-triangle"></i> Danger Zone
        </h3>
        <p className="danger-zone-text">
          The following actions are destructive and cannot be undone. Please proceed with caution.
        </p>
        
        <div className="danger-zone-actions">
          <div className="danger-action">
            <div className="danger-action-info">
              <h4>Leave Team</h4>
              <p>You will be removed from this team and lose access to all team content.</p>
            </div>
            <button 
              type="button"
              className="leave-team-button"
              onClick={handleLeaveTeam}
              disabled={isLeaving}
            >
              <i className="fas fa-sign-out-alt"></i> Leave Team
            </button>
          </div>
          
          {isManager && (
            <div className="danger-action">
              <div className="danger-action-info">
                <h4>Delete Team</h4>
                <p>Permanently delete this team and all associated data. This action cannot be undone.</p>
              </div>
              <button 
                type="button"
                className="delete-team-button"
                onClick={toggleDeleteConfirm}
                disabled={isDeleting}
              >
                <i className="fas fa-trash-alt"></i> Delete Team
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Delete Team?</h3>
            <p>Are you sure you want to delete <strong>{teamData.name}</strong>? This action cannot be undone.</p>
            <div className="confirmation-buttons">
              <button 
                className="cancel-button"
                onClick={toggleDeleteConfirm}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="danger-button"
                onClick={handleDeleteTeam}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <><i className="fas fa-spinner fa-spin"></i> Deleting...</>
                ) : (
                  'Delete Team'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Leave confirmation dialog */}
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
    </PageLayout>
  );
};

export default Settings;
