import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import '../SettingsPage.css';

/**
 * A reusable settings component that can be used by different user types
 * @param {string} userType - The type of user ('athlete', 'manager', etc.)
 */
function SettingsComponent({ userType = 'user' }) {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      matches: true,
      teamUpdates: true,
      marketingEmails: false
    },
    privacy: {
      profileVisibility: 'public',
      showStats: true,
      allowTagging: true,
      allowMessages: 'followers'
    },
    appearance: {
      theme: 'light',
      language: 'english',
      timeFormat: '24hour'
    },
    account: {
      twoFactorAuth: false,
      connectedAccounts: {
        google: true,
        facebook: false,
        twitter: false
      }
    }
  });
  
  // Add user-type specific settings
  useEffect(() => {
    if (userType === 'athlete') {
      setSettings(prev => ({
        ...prev,
        athlete: {
          statsVisibility: 'public',
          allowScoutContacts: true,
          shareTeamAffiliation: true
        }
      }));
    }
  }, [userType]);
  
  const [activeSection, setActiveSection] = useState('notifications');
  const [saveStatus, setSaveStatus] = useState('');
  
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setSaveStatus('');
  };
  
  const handleToggleChange = (section, setting) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [setting]: !settings[section][setting]
      }
    });
  };
  
  const handleSelectChange = (section, setting, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [setting]: value
      }
    });
  };
  
  const handleNestedToggleChange = (section, subsection, setting) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [subsection]: {
          ...settings[section][subsection],
          [setting]: !settings[section][subsection][setting]
        }
      }
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Saving ${userType} settings:`, settings);
    
    // Simulate saving to API
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
    }, 1500);
  };
  
  return (
    <div className="settings-page animate-fade-in">
      <Helmet>
        <title>Settings - eSkore</title>
        <meta name="description" content="Manage your account settings and preferences." />
      </Helmet>
      
      <div className="settings-container">
        <header className="page-header">
          <h1 className="page-title animate-slide-up">Settings</h1>
          <p className="page-description animate-fade-in delay-100">
            Manage your account settings, notifications, and preferences
          </p>
        </header>
        
        <div className="settings-layout">
          {/* Sidebar with sections */}
          <aside className="settings-sidebar card">
            <ul className="settings-nav">
              <li>
                <button 
                  className={activeSection === 'notifications' ? 'active' : ''}
                  onClick={() => handleSectionChange('notifications')}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  Notifications
                </button>
              </li>
              <li>
                <button 
                  className={activeSection === 'privacy' ? 'active' : ''}
                  onClick={() => handleSectionChange('privacy')}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Privacy
                </button>
              </li>
              <li>
                <button 
                  className={activeSection === 'appearance' ? 'active' : ''}
                  onClick={() => handleSectionChange('appearance')}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  Appearance
                </button>
              </li>
              <li>
                <button 
                  className={activeSection === 'account' ? 'active' : ''}
                  onClick={() => handleSectionChange('account')}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Account
                </button>
              </li>
            </ul>
          </aside>
          
          {/* Main settings content */}
          <main className="settings-content card">
            <form onSubmit={handleSubmit}>
              {/* Notification Settings */}
              {activeSection === 'notifications' && (
                <div className="settings-section">
                  <h2 className="section-title">Notification Settings</h2>
                  
                  <div className="settings-group">
                    <h3>Notification Methods</h3>
                    <div className="setting-row">
                      <div className="setting-info">
                        <label>Email Notifications</label>
                        <span className="setting-description">Receive notifications via email</span>
                      </div>
                      <div className="setting-control">
                        <label className="toggle">
                          <input 
                            type="checkbox" 
                            checked={settings.notifications.email}
                            onChange={() => handleToggleChange('notifications', 'email')}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                    
                    {/* ...more notification settings... */}
                  </div>
                </div>
              )}
              
              {/* Privacy Settings */}
              {activeSection === 'privacy' && (
                <div className="settings-section">
                  <h2 className="section-title">Privacy Settings</h2>
                  
                  {/* ...existing code for privacy settings... */}
                </div>
              )}
              
              {/* Appearance Settings */}
              {activeSection === 'appearance' && (
                <div className="settings-section">
                  <h2 className="section-title">Appearance Settings</h2>
                  
                  {/* ...existing code for appearance settings... */}
                </div>
              )}
              
              {/* Account Settings */}
              {activeSection === 'account' && (
                <div className="settings-section">
                  <h2 className="section-title">Account Settings</h2>
                  
                  {/* ...existing code for account settings... */}
                </div>
              )}
              
              {/* Save Button */}
              <div className="settings-footer">
                {saveStatus === 'saved' && (
                  <div className="save-success">
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Settings saved successfully
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className={`btn btn-primary ${saveStatus === 'saving' ? 'loading' : ''}`}
                  disabled={saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}

export default SettingsComponent;
