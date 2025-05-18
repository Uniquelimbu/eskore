import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RecentActivity from './components/RecentActivity';
import { useAuth } from '../../../contexts/AuthContext';
import dashboardService from '../../../services/dashboardService';
import PageLayout from '../../../components/PageLayout/PageLayout';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, isAuthenticated, loading, verifyUserData } = useAuth();
  const [userLoading, setUserLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, _setError] = useState(null);
  
  // Ensure we have complete user data when the dashboard loads
  useEffect(() => {
    const ensureUserData = async () => {
      if (isAuthenticated && (!user || !user.firstName || !user.lastName)) {
        console.log('Dashboard: User data incomplete, verifying user data');
        try {
          await verifyUserData(true); // Force refresh of user data
        } catch (error) {
          console.error('Dashboard: Error refreshing user data:', error);
        }
      }
      setUserLoading(false);
    };
    
    if (!loading) {
      ensureUserData();
    }
  }, [isAuthenticated, user, loading, verifyUserData]);
  
  // Fetch activity data
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);
        const data = await dashboardService.getRecentActivity();
        
        // Check if data is an array before setting state
        if (Array.isArray(data)) {
          setActivities(data);
        } else {
          console.warn('Activity data is not an array:', data);
          setActivities([]);
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
        setActivities([]);
        // Optionally show a toast notification here
      } finally {
        setLoadingActivities(false);
      }
    };
    
    fetchActivities();
  }, []);

  // Get user's name with proper fallback
  const getUserName = () => {
    if (userLoading || loading) return 'loading...';
    if (!user) return 'Guest';
    return user.firstName ? `${user.firstName}` : 'Athlete';
  };
  
  return (
    <PageLayout className="dashboard-main-content">
      {error && <div className="error-banner">{error}</div>}

      <div className="dashboard-content-grid">
        <div className="dashboard-welcome-section">
          <h1>Welcome, {getUserName()}!</h1>
          <p>Track your performance, view upcoming matches, and manage your soccer career all in one place.</p>
          
          <div className="dashboard-quicklinks">
            <Link to="/profile" className="quicklink-button">
              <span className="quicklink-icon">👤</span>
              <span className="quicklink-label">Update Profile</span>
            </Link>
            <Link to="/leaderboards" className="quicklink-button">
              <span className="quicklink-icon">🏆</span>
              <span className="quicklink-label">Standings</span>
            </Link>
            {/* Additional quicklinks if needed */}
          </div>
        </div>

        <RecentActivity
          activities={activities}
          loading={loadingActivities}
        />
      </div>

      {/* Show a loading indicator if we're still loading user data */}
      {(userLoading || loading) && (
        <div className="loading-indicator">Loading your dashboard data...</div>
      )}
    </PageLayout>
  );
};

export default DashboardPage;
