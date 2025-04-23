import React from 'react';
import Button from '../../../components/ui/Button/Button'; // Global button
import RolePageButton from './components/RolePageButton'; // Page-specific button
import './RolePage.css';

const RolePage = () => {
  return (
    <div className="role-page">
      <h1>Role Selection</h1>
      
      {/* Global button with global styling - won't be affected by page-specific styles */}
      <Button variant="primary">Global Standard Button</Button>
      
      {/* Page-specific button with isolated styling */}
      <RolePageButton variant="primary">Role Page Custom Button</RolePageButton>
      
      {/* Page-specific button with secondary style */}
      <RolePageButton variant="secondary">Another Custom Button</RolePageButton>
    </div>
  );
};

export default RolePage;
