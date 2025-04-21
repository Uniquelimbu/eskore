import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import { useConnection } from '../context/ConnectionContext';
import { Helmet } from 'react-helmet';
import './UserHomePage.css';

const UserHomePage = () => {
  const { user } = useAuth();
  const { isOnline, apiAvailable } = useConnection();
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [offlineMode, setOfflineMode] = useState(false);

  // Fetch user-specific data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      // In a real app, you would fetch actual data from your API here
      try {
        // Check if we should use offline mode
        if (!isOnline || !apiAvailable) {
          setOfflineMode(true);
          // Use cached data or fallback
          const cachedActivity = localStorage.getItem('cachedActivity');
          const cachedRecommendations = localStorage.getItem('cachedRecommendations');
          
          setRecentActivity(cachedActivity ? JSON.parse(cachedActivity) : []);
          setRecommendations(cachedRecommendations ? JSON.parse(cachedRecommendations) : []);
          setLoading(false);
          return;
        }

        // Simulate API call with timeout
        setTimeout(() => {
          // Sample personalized data
          const activityData = [
            {
              id: 1,
              type: 'match',
              title: 'New match statistics available',
              description: 'Your team\'s latest match data has been processed',
              time: '2 hours ago'
            },
            {
              id: 2,
              type: 'season',
              title: 'Season standings updated',
              description: 'Check your team\'s position in the league',
              time: 'Yesterday'
            },
            // Personalized based on user role
            ...(user?.role === 'coach' ? [{
              id: 3,
              type: 'team',
              title: 'New player joined your team',
              description: 'Alex Johnson has joined your team roster',
              time: '2 days ago'
            }] : [])
          ];

          const recommendationsData = [
            {
              id: 1,
              title: 'Complete your profile',
              progress: 65,
              link: '/profile'
            },
            {
              id: 2,
              title: 'Join a local tournament',
              description: 'Summer League 2023 is now accepting registrations',
              link: '/leagues'
            }
          ];
          
          // Cache the data for offline use
          localStorage.setItem('cachedActivity', JSON.stringify(activityData));
          localStorage.setItem('cachedRecommendations', JSON.stringify(recommendationsData));
          
          setRecentActivity(activityData);
          setRecommendations(recommendationsData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setOfflineMode(true);
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user, isOnline, apiAvailable]);

  // Add some offline mode UI elements
  const OfflineBanner = () => (
    <div className="offline-banner">
      <span className="offline-icon">⚠️</span>
      <span>You are currently in offline mode. Some data may not be updated.</span>
    </div>
  );

  // If no user is logged in, redirect to public home page
  if (!user) {
    return <Navigate to="/" />;
  }

  // Redirect to appropriate dashboard based on role
  if (user.role === 'athlete' || user.role === 'athlete_admin' || user.role === 'admin') {
    // Admins now go to athlete dashboard
    return <Navigate to="/athlete/home" />;
  }
  
  // Redirect managers to their dashboard
  if (user.role === 'manager') {
    return <Navigate to="/manager/home" />;
  }
  
  // Redirect teams to their dashboard
  if (user.role === 'team') {
    return <Navigate to="/team/home" />;
  }
  
  // Remove this redundant admin check since it's now included above
  // if (user.role === 'admin') {
  //   return <Navigate to="/admin" />;
  // }

  // If no specific role dashboard available yet, show generic message
  return (
    <div className="user-home-page regular-user-home">
      <Helmet>
        <title>Dashboard | eSkore</title>
        <meta name="description" content="Your personalized eSkore dashboard" />
      </Helmet>
      
      {offlineMode && <OfflineBanner />}
      
      <div className="dashboard-container regular-dashboard">
        <header className="dashboard-header regular-dashboard-header">
          <h1>Feature Coming Soon</h1>
          <p>The dashboard for your user type is under development.</p>
        </header>
        
        {loading ? (
          <div className="loading-state regular-loading">
            <div className="loading-spinner"></div>
            <p>Loading your personalized dashboard...</p>
          </div>
        ) : (
          <div className="dashboard-content regular-dashboard-content">
            <div className="dashboard-card recent-activity">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                {recentActivity.length > 0 ? (
                  recentActivity.map(activity => (
                    <div className="activity-item" key={activity.id}>
                      <span className="activity-icon">
                        {activity.type === 'match' ? '📊' : activity.type === 'season' ? '🏆' : '👥'}
                      </span>
                      <div className="activity-details">
                        <h3>{activity.title}</h3>
                        <p>{activity.description}</p>
                      </div>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No recent activity yet. Start by exploring matches or teams.</p>
                )}
              </div>
            </div>
            
            <div className="dashboard-card quick-actions">
              <h2>Quick Actions</h2>
              <div className="actions-grid">
                <Link to={user.role === 'coach' ? "/coach/matches" : "/matches"} className="action-button">
                  <span className="action-icon">📝</span>
                  <span className="action-label">{user.role === 'coach' ? 'Record Match' : 'View Matches'}</span>
                </Link>
                <Link to="/teams" className="action-button">
                  <span className="action-icon">👥</span>
                  <span className="action-label">Manage Team</span>
                </Link>
                <Link to="/leagues" className="action-button">
                  <span className="action-icon">🏆</span>
                  <span className="action-label">View Leagues</span>
                </Link>
                <Link to="/profile" className="action-button">
                  <span className="action-icon">👤</span>
                  <span className="action-label">Edit Profile</span>
                </Link>
              </div>
            </div>

            {recommendations.length > 0 && (
              <div className="dashboard-card recommendations">
                <h2>Recommended for You</h2>
                <div className="recommendation-list">
                  {recommendations.map(item => (
                    <div className="recommendation-item" key={item.id}>
                      <h3>{item.title}</h3>
                      {item.progress !== undefined && (
                        <div className="progress-container">
                          <div className="progress-bar">
                            <div className="progress" style={{width: `${item.progress}%`}}></div>
                          </div>
                          <span className="progress-text">{item.progress}% complete</span>
                        </div>
                      )}
                      {item.description && <p>{item.description}</p>}
                      <Link to={item.link} className="recommendation-action">
                        Get Started →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHomePage;
