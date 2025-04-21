import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { UserPageLayout } from '../../../features/shared/components/UserPageLayout/UserPageLayout';
import './ProfilePage.css';

function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    personal: {
      firstName: '',
      lastName: '',
      email: '',
      organization: '',
      role: ''
    },
    teams: []
  });
  
  // Fetch manager data
  useEffect(() => {
    // Simulated data fetch
    setTimeout(() => {
      if (user) {
        setProfileData(prev => ({
          ...prev,
          personal: {
            ...prev.personal,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || ''
          }
        }));
      }
      setLoading(false);
    }, 800);
  }, [user]);
  
  return (
    <UserPageLayout
      title="My Profile"
      description="Manage your manager profile"
      userType="manager"
    >
      <div className="profile-page">
        <h1 className="page-title">Manager Profile</h1>
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading profile...</p>
          </div>
        ) : (
          <div className="profile-content">
            {/* Manager-specific profile UI */}
            <div className="profile-header">
              <div className="profile-info">
                <h2>{profileData.personal.firstName} {profileData.personal.lastName}</h2>
                <p>{profileData.personal.organization || 'No organization set'}</p>
              </div>
            </div>
            
            {/* Manager-specific sections */}
            <div className="profile-sections">
              <section className="profile-section">
                <h3>Teams Under Management</h3>
                {profileData.teams.length === 0 ? (
                  <p>No teams under management yet.</p>
                ) : (
                  <ul className="teams-list">
                    {/* Team list would go here */}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </UserPageLayout>
  );
}

export default ProfilePage;
