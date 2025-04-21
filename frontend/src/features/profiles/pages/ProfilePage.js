import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';

function ProfilePage() {
  const { user } = useAuth();
  
  // Redirect athletes to their specialized profile page
  if (user?.role === 'athlete' || user?.role === 'athlete_admin') {
    return <Navigate to="/athlete/profile" replace />;
  }
  
  // Redirect managers to their profile page
  if (user?.role === 'manager') {
    return <Navigate to="/manager/profile" replace />;
  }
  
  // Redirect teams to their profile page
  if (user?.role === 'team') {
    return <Navigate to="/team/profile" replace />;
  }
  
  // Fallback for admin or unknown roles
  return <Navigate to="/" replace />;
}

export default ProfilePage;
