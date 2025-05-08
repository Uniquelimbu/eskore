import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import PageLayout from '../../../components/layout/PageLayout';

const TeamDashboard = () => {
  const { teamId } = useParams();
  
  // Temporary solution - redirect to team space
  return <Navigate to={`/teams/${teamId}/space/overview`} replace />;
  
  /* Uncomment and implement when you're ready to build this page
  return (
    <div className="team-dashboard-layout">
      <Sidebar />
      <PageLayout className="team-dashboard-content" maxWidth="1200px" withPadding={true}>
        <h1>Team Dashboard</h1>
        <p>Team ID: {teamId}</p>
        <p>This page is under development</p>
      </PageLayout>
    </div>
  );
  */
};

export default TeamDashboard;
