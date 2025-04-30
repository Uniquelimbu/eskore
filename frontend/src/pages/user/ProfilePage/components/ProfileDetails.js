import React from 'react';
import { formatDate } from '../../../../utils/dateUtils';
import { positionMapping } from '../../../../utils/soccerUtils';

const ProfileDetails = ({ profileData }) => {
  if (!profileData) return null;

  // Format the position for display
  const getPositionName = (positionCode) => {
    return positionMapping[positionCode] || positionCode;
  };

  return (
    <div className="profile-details">
      <div className="profile-section">
        <h3 className="profile-section-title">Personal Information</h3>
        
        <div className="profile-detail-grid">
          <div className="profile-detail-item">
            <span className="detail-label">Full Name</span>
            <span className="detail-value">{`${profileData.firstName} ${profileData.lastName}`}</span>
          </div>
          
          <div className="profile-detail-item">
            <span className="detail-label">Email</span>
            <span className="detail-value">{profileData.email}</span>
          </div>
          
          {profileData.dob && (
            <div className="profile-detail-item">
              <span className="detail-label">Date of Birth</span>
              <span className="detail-value">{formatDate(profileData.dob)}</span>
            </div>
          )}
          
          {profileData.height && (
            <div className="profile-detail-item">
              <span className="detail-label">Height</span>
              <span className="detail-value">{`${profileData.height} cm`}</span>
            </div>
          )}
          
          {profileData.position && (
            <div className="profile-detail-item">
              <span className="detail-label">Position</span>
              <span className="detail-value">{getPositionName(profileData.position)}</span>
            </div>
          )}
          
          {profileData.country && (
            <div className="profile-detail-item">
              <span className="detail-label">Country</span>
              <span className="detail-value">{profileData.country}</span>
            </div>
          )}
          
          {profileData.team && (
            <div className="profile-detail-item">
              <span className="detail-label">Current Team</span>
              <span className="detail-value">{profileData.team}</span>
            </div>
          )}
        </div>
      </div>
      
      {profileData.bio && (
        <div className="profile-section">
          <h3 className="profile-section-title">Bio</h3>
          <div className="profile-bio-content">
            {profileData.bio}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .profile-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 16px;
        }
        
        .profile-detail-item {
          display: flex;
          flex-direction: column;
        }
        
        .detail-label {
          color: #a0aec0;
          font-size: 0.85rem;
          margin-bottom: 4px;
        }
        
        .detail-value {
          color: #e2e8f0;
          font-size: 1.05rem;
          font-weight: 500;
        }
        
        .profile-bio-content {
          color: #e2e8f0;
          line-height: 1.6;
          background-color: #283046;
          padding: 16px;
          border-radius: 8px;
          white-space: pre-line;
        }
      `}</style>
    </div>
  );
};

export default ProfileDetails;
