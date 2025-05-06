import React from 'react';
import './TabComponents.css';

const Overview = ({ team, members, isManager }) => {
  // Calculate completion percentage for setup steps
  const setupSteps = [
    { id: 'profile', label: 'Team Profile', completed: !!team.logoUrl },
    { id: 'players', label: 'Add Players', completed: members.length > 1 },
    { id: 'formation', label: 'Create Formation', completed: false },
    { id: 'calendar', label: 'Schedule Events', completed: false }
  ];
  
  const completedSteps = setupSteps.filter(step => step.completed).length;
  const setupProgress = Math.round((completedSteps / setupSteps.length) * 100);
  
  return (
    <div className="overview-container">
      <div className="welcome-section">
        <h2>Welcome to Your Team Space</h2>
        <p>This is your team's command center where you can manage your roster, plan tactics, and organize your schedule.</p>
      </div>
      
      <div className="overview-grid">
        <div className="setup-progress-card">
          <div className="card-header">
            <h3>Team Setup</h3>
            <span className="progress-percentage">{setupProgress}% Complete</span>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${setupProgress}%` }}
            ></div>
          </div>
          
          <ul className="setup-steps">
            {setupSteps.map(step => (
              <li key={step.id} className={step.completed ? 'completed' : ''}>
                <span className="step-icon">
                  {step.completed ? '✓' : '○'}
                </span>
                <span className="step-label">{step.label}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="activity-feed-card">
          <div className="card-header">
            <h3>Team Activity</h3>
          </div>
          
          {members.length <= 1 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h4>No Recent Activity</h4>
              <p>Invite players to your team to start seeing activity here.</p>
            </div>
          ) : (
            <ul className="activity-list">
              <li className="activity-item">
                <div className="activity-icon system">📣</div>
                <div className="activity-content">
                  <p className="activity-text">Team <strong>{team.name}</strong> was created</p>
                  <span className="activity-time">Today</span>
                </div>
              </li>
              {/* More activities would be mapped here */}
            </ul>
          )}
        </div>
        
        <div className="upcoming-events-card">
          <div className="card-header">
            <h3>Upcoming Events</h3>
          </div>
          
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h4>No Upcoming Events</h4>
            <p>Use the Calendar tab to schedule matches and training sessions.</p>
            {isManager && (
              <button className="action-button primary">Schedule Your First Event</button>
            )}
          </div>
        </div>
        
        <div className="announcements-card">
          <div className="card-header">
            <h3>Announcements</h3>
            {isManager && (
              <button className="card-action-button">
                <i className="fas fa-plus"></i> New
              </button>
            )}
          </div>
          
          <div className="empty-state">
            <div className="empty-state-icon">📢</div>
            <h4>No Announcements Yet</h4>
            {isManager ? (
              <p>Post important team announcements that everyone should see.</p>
            ) : (
              <p>There are no announcements from your team management yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
