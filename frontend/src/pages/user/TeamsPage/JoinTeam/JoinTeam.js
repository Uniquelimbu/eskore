import React from 'react';
import { Navigate } from 'react-router-dom';

// This component is a redirect wrapper to the search page with team filter
const JoinTeam = () => {
  return <Navigate to="/search?type=team" replace />;
};

export default JoinTeam;
