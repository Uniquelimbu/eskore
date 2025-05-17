import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import { positionMapping } from '../../../../utils/soccerUtils';

const ProfileHeader = ({ profileData, onProfileUpdate }) => {
  const navigate = useNavigate(); // Add this hook
  const fileInputRef = useRef(null);
  const defaultProfileImage = `${process.env.PUBLIC_URL}/images/default-profile.png`;

  const handlePhotoUploadClick = () => {
    fileInputRef.current.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Only accept image files
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      // Call onProfileUpdate with the FormData
      const success = await onProfileUpdate(formData);
      if (success) {
        // Success notification could be added here
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error);
    }
  };

  // Format the position for display
  const formatPosition = (position) => {
    return positionMapping[position] || position;
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  if (!profileData) return null;

  return (
    <div className="profile-header">
      <div className="profile-photo-container">
        <img
          src={profileData.profileImageUrl || defaultProfileImage}
          alt={`${profileData.firstName} ${profileData.lastName}`}
          className="profile-photo"
        />
        <div className="photo-upload-overlay" onClick={handlePhotoUploadClick}>
          <i className="fas fa-camera"></i>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>
      
      <div className="profile-info">
        <div className="profile-title">
          <h1 className="profile-name">{`${profileData.firstName} ${profileData.lastName}`}</h1>
          <button className="profile-edit-btn" onClick={handleEditProfile}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.862 4.487L18.549 2.799C18.9207 2.42778 19.4201 2.21783 19.9417 2.21783C20.4633 2.21783 20.9627 2.42778 21.3344 2.799C21.7061 3.17022 21.916 3.66959 21.916 4.19121C21.916 4.71284 21.7061 5.2122 21.3344 5.58343L10.582 16.3358C10.0248 16.8932 9.3595 17.3263 8.62937 17.6083L6 18.5L6.89116 15.8706C7.17326 15.1407 7.60636 14.4756 8.16357 13.9187L16.862 5.22043C16.8623 5.22014 16.8627 5.21986 16.863 5.21957C16.8633 5.21928 16.8637 5.21899 16.864 5.2187L16.862 4.487Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Edit Profile
          </button>
        </div>
        
        {profileData.position && (
          <div className="profile-position">
            {formatPosition(profileData.position)}
          </div>
        )}
        
        {profileData.bio && (
          <p className="profile-bio">{profileData.bio}</p>
        )}
        
        <div className="profile-meta">
          {profileData.team && (
            <span className="profile-meta-item">Team: {profileData.team}</span>
          )}
          {profileData.country && (
            <span className="profile-meta-item">Country: {profileData.country}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
