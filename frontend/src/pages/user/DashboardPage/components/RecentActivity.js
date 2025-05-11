import React from 'react';

const RecentActivity = ({ activities, loading }) => {
  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Function to get activity icon based on type
  const getActivityIcon = (activity) => {
    switch (activity.type) {
      case 'match':
        return activity.result === 'win' ? '🏆' : (activity.result === 'draw' ? '🤝' : '❌');
      case 'tournament':
        return '🏆';
      case 'team':
        return '👥';
      case 'training':
        return '🎯';
      default:
        return '📋';
    }
  };

  // Function to render activity details based on type
  const renderActivityDetails = (activity) => {
    switch (activity.type) {
      case 'match':
        return (
          <>
            <div className="activity-title">
              {activity.userTeamName} vs {activity.opponentName} {activity.result === 'win' ? 'Won' : (activity.result === 'draw' ? 'Draw' : 'Lost')}
            </div>
            <div className="activity-description">
              Score: {activity.score}
            </div>
          </>
        );
      case 'team':
        return (
          <>
            <div className="activity-title">Team {activity.action}</div>
            <div className="activity-description">
              Joined {activity.teamName} as {activity.role}
            </div>
          </>
        );
      case 'tournament':
        return (
          <>
            <div className="activity-title">Tournament {activity.action}</div>
            <div className="activity-description">
              {activity.tournamentName} - Role: {activity.role}
            </div>
          </>
        );
      case 'training':
        return (
          <>
            <div className="activity-title">Training Session</div>
            <div className="activity-description">
              {activity.title} - Score: {activity.score}
            </div>
          </>
        );
      default:
        return <div className="activity-title">Activity: {activity.type}</div>;
    }
  };

  return (
    <div className="recent-activity">
      <div className="section-header">
        <h2>Recent Activity</h2>
        <button className="section-action">View All</button>
      </div>
      
      {loading ? (
        <div className="activity-loading">
          <div className="loading-spinner"></div>
          <p>Loading activity...</p>
        </div>
      ) : (
        <div className="activity-list">
          {activities.length === 0 ? (
            <div className="no-activity">No recent activity to display</div>
          ) : (
            activities.map(activity => (
              <div 
                key={activity.id} 
                className={`activity-item ${activity.type} ${activity.result || ''}`}
              >
                <div className="activity-icon">
                  {getActivityIcon(activity)}
                </div>
                <div className="activity-content">
                  {renderActivityDetails(activity)}
                  <div className="activity-date">{formatDate(activity.date)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
