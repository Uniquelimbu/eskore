import React, { useEffect, useState } from 'react';
import RecentActivity from './components/RecentActivity';
import Sidebar from '../components/Sidebar/Sidebar';
import { useAuth } from '../../../contexts/AuthContext';
import dashboardService from '../../../services/dashboardService';
import './DashboardPage.css';

const DashboardPage = () => {
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [error, setError] = useState(null);
  
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
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main-content">
        {error && <div className="error-banner">{error}</div>}

        <div className="dashboard-content-grid">
          <div className="dashboard-welcome-section">
            <h1>Welcome, {user?.firstName || user?.username || 'Athlete'}!</h1>
            <p>Track your performance, view upcoming matches, and manage your soccer career all in one place.</p>
            
            <div className="dashboard-quicklinks">
              <a href="/profile" className="quicklink-button">
                <span className="quicklink-icon">👤</span>
                <span className="quicklink-label">Update Profile</span>
              </a>
              <a href="/practice" className="quicklink-button">
                <span className="quicklink-icon">⚽</span>
                <span className="quicklink-label">Log Practice</span>
              </a>
              <a href="/leaderboards" className="quicklink-button">
                <span className="quicklink-icon">🏆</span>
                <span className="quicklink-label">View Leaderboards</span>
              </a>
            </div>
          </div>

          <RecentActivity
            activities={activities}
            loading={loadingActivities}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
