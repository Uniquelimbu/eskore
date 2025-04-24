import React, { useEffect, useState } from 'react';
import StatsSummary from './components/StatsSummary';
import RecentActivity from './components/RecentActivity';
import Sidebar from '../components/Sidebar/Sidebar'; // Updated import path
import { useAuth } from '../../../contexts/AuthContext';
import dashboardService from '../../../services/dashboardService';
import './DashboardPage.css';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [timeframe, setTimeframe] = useState('all-time');
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();

  // Fetch stats data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        setError(null);
        const data = await dashboardService.getStatsSummary(timeframe);
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics. Please try again later.');
        // Provide fallback data for better UX
        setStats({
          totalMatches: 0,
          winRate: 0,
          kda: 0,
          averageScore: 0
        });
      } finally {
        setLoadingStats(false);
      }
    };
    
    fetchStats();
  }, [timeframe]);
  
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
  
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar /> {/* Path updated */}
      <div className="dashboard-main-content">
        <header className="dashboard-header">
          <h1>Welcome back, {user?.firstName || user?.username || 'Athlete'}!</h1>
          <p className="last-login">Last login: {new Date().toLocaleDateString()}</p>
        </header>

        {error && <div className="error-banner">{error}</div>}

        <div className="dashboard-content-grid">
          <StatsSummary
            stats={stats}
            loading={loadingStats}
            onTimeframeChange={handleTimeframeChange}
            currentTimeframe={timeframe}
          />

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
