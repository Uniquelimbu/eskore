import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RecentActivity from './components/RecentActivity';
import { useAuth } from '../../../contexts/AuthContext';
import dashboardService from '../../../services/dashboardService';
import PageLayout from '../../../components/PageLayout/PageLayout';
import './DashboardPage.css';

const DashboardPage = () => {
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, _setError] = useState(null);
  
  const { user } = useAuth();
  
  // Fetch activity data
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);
        const data = await dashboardService.getRecentActivity();
        setActivities(data || []);
      } catch (err) {
        console.error('Error fetching activities:', err);
        // Don't show error for activities as it's less critical
        setActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    };
    
    fetchActivities();
  }, []);

  return (
    <PageLayout className="dashboard-main-content">
      {error && <div className="error-banner">{error}</div>}

      <div className="dashboard-content-grid">
        <div className="dashboard-welcome-section">
          <h1>Welcome, {user?.firstName || user?.username || 'Athlete'}!</h1>
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
    </PageLayout>
  );
};

export default DashboardPage;
