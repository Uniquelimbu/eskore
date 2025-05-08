import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import PageLayout from '../../../components/layout/PageLayout';

const TeamDetailsPage = () => {
  const { id } = useParams();
  
  // Temporary solution - redirect to team space
  return <Navigate to={`/teams/${id}/space/overview`} replace />;
  
  /* Uncomment and implement when you're ready to build this page
  return (
    <div className="team-details-layout">
      <Sidebar />
      <PageLayout className="team-details-content" maxWidth="1200px" withPadding={true}>
        <h1>Team Details</h1>
        <p>Team ID: {id}</p>
        <p>This page is under development</p>
      </PageLayout>
    </div>
  );
  */
};

export default TeamDetailsPage;
