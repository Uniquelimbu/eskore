import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../../../../components/PageLayout/PageLayout';
import profileService from '../../../../../services/profileService';
import './EditProfilePage.css';

const EditProfilePage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    position: '',
    height: '',
    country: '',
    dob: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fullProfileData, setFullProfileData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await profileService.getUserProfile();
        setFullProfileData(userData);
        
        // Set form data with user profile data
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          bio: userData.bio || '',
          position: userData.position || '',
          height: userData.height || '',
          country: userData.country || '',
          dob: userData.dob || ''
        });
      } catch (err) {
        setError('Failed to load profile data. Please try again later.');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
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
      setError(null);
      
      // Call the API to update the profile
      await profileService.updateUserProfile(formData);
      
      // Navigate back to profile page on success
      navigate('/profile');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <PageLayout className="edit-profile-page" maxWidth="800px" withPadding={true}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="edit-profile-page" maxWidth="800px" withPadding={true}>
      <div className="edit-profile-container">
        <div className="edit-profile-header">
          <h1>Edit Your Profile</h1>
          <p>Update your personal information and preferences</p>
        </div>
        
        {error && <div className="error-banner">{error}</div>}
        
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name*</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name*</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="position">Position</label>
                <select
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                >
                  <option value="">Select Position</option>
                  {Object.entries(positionMapping).map(([code, label]) => (
                    <option key={code} value={code}>{label} ({code})</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="height">Height (cm)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  min="120"
                  max="220"
                  placeholder="Height in centimeters"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Your country"
                />
              </div>
            </div>
            
            <div className="form-group read-only">
              <label htmlFor="currentTeam">Current Team</label>
              <div className="read-only-field">
                {fullProfileData && fullProfileData.teams && fullProfileData.teams.length > 0 
                  ? fullProfileData.teams[0].name 
                  : "You are not in any team right now"}
                <small className="field-hint">Team membership is managed through teams portal and cannot be changed here.</small>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself as a soccer player..."
                rows="5"
              ></textarea>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

// Define position mapping
const positionMapping = {
  GK: 'Goalkeeper',
  DF: 'Defender',
  MF: 'Midfielder',
  FW: 'Forward',
  CB: 'Center Back',
  LB: 'Left Back',
  RB: 'Right Back',
  CDM: 'Defensive Midfielder',
  CM: 'Central Midfielder',
  CAM: 'Attacking Midfielder',
  LM: 'Left Midfielder',
  RM: 'Right Midfielder',
  LW: 'Left Winger',
  RW: 'Right Winger',
  ST: 'Striker',
  CF: 'Center Forward'
};

export default EditProfilePage;
