import React from 'react';
import './ProfileHeader.css';

const ProfileHeader = ({ user, avatar, badges }) => {
  return (
    <div className="profile-header">
      <div className="profile-avatar">
        {avatar || (
          <div className="avatar-placeholder">
            {user?.firstName ? user.firstName.charAt(0) : 'U'}
          </div>
        )}
      </div>
      <div className="profile-info">
        <h2>{user?.firstName} {user?.lastName}</h2>
        {badges && (
          <div className="profile-badges">
            {badges.map((badge, index) => (
              <span key={index} className="profile-badge">{badge}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
