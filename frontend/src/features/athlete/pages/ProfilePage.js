import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { AthletePageLayout } from '../components/PageLayout';
import './ProfilePage.css';

function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    personal: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '',
      dob: '',
      gender: ''
    },
    sports: {
      mainSport: 'Football',
      position: 'Forward',
      experience: '5',
      level: 'Advanced',
      teams: ['FC United', 'National Team U21']
    },
    metrics: {
      height: '180',
      weight: '75',
      dominantFoot: 'Right',
      speed: '85',
      stamina: '90',
      strength: '78'
    }
  });
  
  const [activeTab, setActiveTab] = useState('personal');
  const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', or ''
  
  // Simulate loading profile data
  useEffect(() => {
    // In a real application, fetch profile data from API here
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setSaveStatus('saving');
    
    // Simulate API request
    setTimeout(() => {
      setSaveStatus('saved');
      
      // Reset status after showing success message
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
    }, 1500);
  };
  
  return (
    <AthletePageLayout
      title="My Profile"
      description="Manage your personal and sports information"
    >
      <div className="profile-page">
        <div className="profile-container">
          <header className="page-header">
            <h1 className="page-title">My Profile</h1>
            <p className="page-description">
              Manage your personal information and sports preferences
            </p>
          </header>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your profile...</p>
            </div>
          ) : (
            <div className="profile-content">
              <div className="profile-summary card">
                <div className="profile-avatar">
                  <div className="avatar-placeholder">
                    {profileData.personal.firstName ? profileData.personal.firstName.charAt(0) : 'A'}
                  </div>
                  <button className="change-avatar-btn">Change Photo</button>
                </div>
                <div className="profile-summary-details">
                  <h3>{profileData.personal.firstName} {profileData.personal.lastName}</h3>
                  <p className="profile-summary-email">{profileData.personal.email}</p>
                  <div className="profile-badges">
                    <span className="badge badge-primary">Athlete</span>
                    <span className="badge badge-secondary">{profileData.sports.mainSport}</span>
                    <span className="badge badge-info">{profileData.sports.position}</span>
                  </div>
                </div>
              </div>
              
              <div className="profile-tabs">
                <button 
                  className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
                  onClick={() => handleTabChange('personal')}
                >
                  Personal Info
                </button>
                <button 
                  className={`tab-button ${activeTab === 'sports' ? 'active' : ''}`}
                  onClick={() => handleTabChange('sports')}
                >
                  Sports
                </button>
                <button 
                  className={`tab-button ${activeTab === 'metrics' ? 'active' : ''}`}
                  onClick={() => handleTabChange('metrics')}
                >
                  Metrics
                </button>
              </div>
              
              <div className="tab-content card">
                <form onSubmit={handleSubmit}>
                  {activeTab === 'personal' && (
                    <div className="personal-info">
                      {/* Personal info form fields */}
                      <div className="form-row">
                        <div className="form-group">
                          <label>First Name</label>
                          <input 
                            type="text" 
                            value={profileData.personal.firstName}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              personal: {
                                ...profileData.personal,
                                firstName: e.target.value
                              }
                            })}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label>Last Name</label>
                          <input 
                            type="text" 
                            value={profileData.personal.lastName}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              personal: {
                                ...profileData.personal,
                                lastName: e.target.value
                              }
                            })}
                            className="form-control"
                          />
                        </div>
                      </div>
                      
                      {/* ...more personal info fields... */}
                    </div>
                  )}
                  
                  {activeTab === 'sports' && (
                    <div className="sports-info">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Main Sport</label>
                          <select 
                            value={profileData.sports.mainSport}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              sports: {
                                ...profileData.sports,
                                mainSport: e.target.value
                              }
                            })}
                            className="form-control"
                          >
                            <option value="Football">Football</option>
                            <option value="Basketball">Basketball</option>
                            <option value="Tennis">Tennis</option>
                            <option value="Cricket">Cricket</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Position</label>
                          <select 
                            value={profileData.sports.position}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              sports: {
                                ...profileData.sports,
                                position: e.target.value
                              }
                            })}
                            className="form-control"
                          >
                            <option value="Forward">Forward</option>
                            <option value="Midfielder">Midfielder</option>
                            <option value="Defender">Defender</option>
                            <option value="Goalkeeper">Goalkeeper</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* ...more sports fields... */}
                    </div>
                  )}
                  
                  {activeTab === 'metrics' && (
                    <div className="metrics-info">
                      {/* Metrics form fields */}
                      {/* ...metrics fields... */}
                    </div>
                  )}
                  
                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary">Cancel</button>
                    <button 
                      type="submit" 
                      className={`btn btn-primary ${saveStatus === 'saving' ? 'loading' : ''}`}
                      disabled={saveStatus === 'saving'}
                    >
                      {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                  
                  {saveStatus === 'saved' && (
                    <div className="save-success">
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Profile updated successfully
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </AthletePageLayout>
  );
}

export default ProfilePage;
