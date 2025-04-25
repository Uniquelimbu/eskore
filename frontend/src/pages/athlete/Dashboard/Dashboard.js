import React from 'react';
import { useAuth } from '../../../contexts/AuthContext'; // Assuming AuthContext provides user info
import './Dashboard.css';
// Import other necessary components like StatsOverview, RecentActivity, etc.

const Dashboard = () => {
  const { user } = useAuth(); // Get user info if needed for other parts

  // Remove or comment out the greeting and last login logic/display
  // const userName = user ? user.firstName || user.email : 'Guest';
  // const lastLogin = user ? user.lastLogin || 'N/A' : 'N/A'; // Example property

  return (
    <div className="dashboard-container">
      {/* Removed welcome message and last login */}
      {/*
      <div className="dashboard-header">
        <h1>Welcome back, {userName}!</h1>
        <p>Last login: {lastLogin}</p>
      </div>
      */}

      {/* Keep the rest of the dashboard content */}
      <div className="dashboard-content">
        {/* Example: <StatsOverview /> */}
        {/* Example: <RecentActivity /> */}
        {/* Example: <UpcomingEvents /> */}
        <p>Dashboard content goes here...</p>
      </div>
    </div>
  );
};

export default Dashboard;
