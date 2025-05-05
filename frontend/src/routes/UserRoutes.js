import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/user/HomePage/HomePage';
import ProfilePage from '../pages/user/ProfilePage/ProfilePage';
import TeamPage from '../pages/user/TeamPage/TeamPage';

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/team" element={<TeamPage />} />
    </Routes>
  );
};

export default UserRoutes;