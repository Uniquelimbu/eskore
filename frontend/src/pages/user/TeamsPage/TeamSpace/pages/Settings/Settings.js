import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './Settings.css';

const Settings = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState({
    name: 'Phoenix FC',
    abbreviation: 'PHX',
    logo: null,
    primaryColor: '#4a6cf7',
    secondaryColor: '#1a202c'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  const handleLogoClick = () => {
    fileInputRef.current.click();
  };
  
  const handleLogoChange = (e) => {
    // Handle logo file upload
    const file = e.target.files[0];
    if (file) {
      // Process file
      console.log('New logo selected:', file.name);
    }
  };
  
  const handleTeamInfoChange = (e) => {
    const { name, value } = e.target;
    setTeam(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleColorChange = (e) => {
    const { name, value } = e.target;
    setTeam(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Save team settings
      console.log('Saving team settings:', team);
      // API call would go here
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save team settings. Please try again.');
      console.error('Error saving team settings:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteTeam = () => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      // Delete team logic
      console.log('Deleting team:', teamId);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-content">
        <h2>Team Settings</h2>
        
        {success && (
          <div className="success-message">
            Team settings saved successfully!
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="settings-section">
            <h3>Team Information</h3>
            <div className="form-group">
              <label htmlFor="name">Team Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={team.name}
                onChange={handleTeamInfoChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="abbreviation">Team Abbreviation</label>
              <input
                type="text"
                id="abbreviation"
                name="abbreviation"
                value={team.abbreviation}
                onChange={handleTeamInfoChange}
                maxLength={3}
                required
              />
              <small>3 letters maximum</small>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Team Logo</h3>
            <div className="logo-section">
              <div className="current-logo">
                {team.logo ? (
                  <img src={team.logo} alt="Team logo" className="team-logo-img" />
                ) : (
                  <div className="logo-placeholder">
                    {team.abbreviation || 'TEAM'}
                  </div>
                )}
              </div>
              <div className="logo-actions">
                <button
                  type="button"
                  className="upload-logo-button"
                  onClick={handleLogoClick}
                >
                  <i className="fas fa-upload"></i>
                  Upload Logo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                {team.logo && (
                  <button
                    type="button"
                    className="remove-logo-button"
                    onClick={() => setTeam(prev => ({ ...prev, logo: null }))}
                  >
                    <i className="fas fa-trash-alt"></i>
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Team Colors</h3>
            <div className="color-inputs">
              <div className="form-group">
                <label htmlFor="primaryColor">Primary Color</label>
                <input
                  type="color"
                  id="primaryColor"
                  name="primaryColor"
                  value={team.primaryColor}
                  onChange={handleColorChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="secondaryColor">Secondary Color</label>
                <input
                  type="color"
                  id="secondaryColor"
                  name="secondaryColor"
                  value={team.secondaryColor}
                  onChange={handleColorChange}
                />
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="submit"
              className="save-settings-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
        
        <div className="settings-section danger-zone-section">
          <h3>Danger Zone</h3>
          <p>These actions are irreversible. Please proceed with caution.</p>
          <button
            type="button"
            className="delete-team-button"
            onClick={handleDeleteTeam}
          >
            Delete Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
