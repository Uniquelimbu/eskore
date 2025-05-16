import React, { useState } from 'react';
import { positionMapping } from '../../../../../utils/soccerUtils';
import { formatDateForInput } from '../../../../../utils/dateUtils';

const EditProfileModal = ({ profileData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: profileData?.firstName || '',
    lastName: profileData?.lastName || '',
    bio: profileData?.bio || '',
    position: profileData?.position || '',
    height: profileData?.height || '',
    team: profileData?.team || '',
    country: profileData?.country || '',
    dob: profileData?.dob ? formatDateForInput(profileData.dob) : ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required');
      setLoading(false);
      return;
    }

    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } catch (err) {
      setError('An error occurred while saving. Please try again.');
      console.error('Error saving profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h3 className="profile-modal-title">Edit Profile</h3>
          <button className="profile-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="profile-modal-body">
            {error && <div className="error-banner">{error}</div>}
            
            <div className="form-row">
              <div className="profile-form-group">
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
              
              <div className="profile-form-group">
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
              <div className="profile-form-group">
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
              
              <div className="profile-form-group">
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
            
            <div className="form-row">
              <div className="profile-form-group">
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
            </div>
            
            <div className="form-row">
              <div className="profile-form-group">
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
              
              <div className="profile-form-group">
                <label htmlFor="team">Current Team</label>
                <input
                  type="text"
                  id="team"
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  placeholder="Your current team"
                />
              </div>
            </div>
            
            <div className="profile-form-group">
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
          
          <div className="profile-modal-footer">
            <button type="button" className="modal-cancel-btn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="modal-save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
