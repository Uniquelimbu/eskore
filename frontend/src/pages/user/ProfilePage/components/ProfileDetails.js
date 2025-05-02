import React from 'react';
import { getPositionName } from '../../../../utils/enumUtils';
import { formatDate } from '../../../../utils/dateUtils';
import './ProfileDetails.css';

const ProfileDetails = ({ profileData }) => {
  if (!profileData) {
    return <div className="profile-details-loading">Loading details...</div>;
  }

  // Helper function to get parts of the date
  const getDateParts = (dateString) => {
    if (!dateString) return { month: '', day: '', year: '' };
    try {
      const date = new Date(dateString);
      // Ensure date is valid before proceeding
      if (isNaN(date.getTime())) {
        throw new Error("Invalid Date");
      }
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      const day = date.getDate();
      const year = date.getFullYear();
      return { month, day, year };
    } catch (error) {
      console.error("Error parsing date for parts:", error);
      return { month: 'Invalid', day: 'Date', year: '' };
    }
  };

  const { month: birthMonth, day: birthDay, year: birthYear } = getDateParts(profileData.dob);

  return (
    <div className="profile-details card-style">
      <h2>Details</h2>
      <div className="profile-details-grid">
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
            <span className="detail-label">Birthday</span>
            <span className="detail-value date-parts">
              <span className="date-part month">{birthMonth}</span>
              <span className="date-part day">{birthDay}</span>
              <span className="date-part year">{birthYear}</span>
            </span>
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
