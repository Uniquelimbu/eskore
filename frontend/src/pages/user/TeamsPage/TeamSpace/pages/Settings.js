import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../tabs/TabComponents.css';

const Settings = ({ team, isManager }) => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState(team || null);
  const [loading, setLoading] = useState(!team);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    city: '',
    foundedYear: '',
    nickname: '',
    description: ''
  });
  
  useEffect(() => {
    // If team prop is passed, use it
    if (team) {
      setTeamData(team);
      setFormData({
        name: team.name || '',
        abbreviation: team.abbreviation || '',
        city: team.city || '',
        foundedYear: team.foundedYear || '',
        nickname: team.nickname || '',
        description: team.description || ''
      });
      return;
    }
    
    // Otherwise fetch data for this specific team
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/teams/${teamId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch team data');
        }
        
        const data = await response.json();
        setTeamData(data);
        setFormData({
          name: data.name || '',
          abbreviation: data.abbreviation || '',
          city: data.city || '',
          foundedYear: data.foundedYear || '',
          nickname: data.nickname || '',
          description: data.description || ''
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching team data:', error);
        setLoading(false);
      }
    };
    
    fetchTeamData();
  }, [team, teamId]);
  
  // Check if user is a manager
  useEffect(() => {
    if (!isManager) {
      navigate(`/teams/${teamId}/overview`);
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
      
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update team');
      }
      
      const updatedTeam = await response.json();
      setTeamData(updatedTeam);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating team:', error);
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteTeam = async () => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }
    
    if (!window.confirm('All team data, members, and history will be permanently deleted. Confirm deletion?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete team');
      }
      
      // Redirect to teams page
      navigate('/teams');
    } catch (error) {
      console.error('Error deleting team:', error);
      setSaveError(error.message);
    }
  };
  
  if (loading) return <div>Loading team settings...</div>;
  if (!teamData) return <div>Team not found</div>;
  
  return (
    <div className="team-page settings-page">
      <div className="settings-header">
        <h2>Team Settings</h2>
      </div>
      
      {saveSuccess && (
        <div className="save-success">
          Team settings updated successfully!
        </div>
      )}
      
      {saveError && (
        <div className="save-error">
          Error: {saveError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="team-settings-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          
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
          
          <div className="form-row">
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
          </div>
          
          <div className="form-row">
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
        </div>
        
        <div className="form-section">
          <h3>Team Logo</h3>
          <div className="team-logo-preview">
            <img 
              src={teamData.logoUrl || '/images/default-team-logo.png'} 
              alt={`${teamData.name} logo`} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="logoUpload">Upload New Logo:</label>
            <input
              type="file"
              id="logoUpload"
              name="logoUpload"
              accept="image/*"
              // Logo upload would require a separate handler
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="save-button"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
      
      <div className="danger-zone">
        <h3>Danger Zone</h3>
        <p>
          Deleting a team is permanent. All team data, members, matches, and 
          other associated data will be lost.
        </p>
        <button 
          className="delete-team-button"
          onClick={handleDeleteTeam}
        >
          Delete Team
        </button>
      </div>
    </div>
  );
};

export default Settings;
