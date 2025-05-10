import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import TopNavbar from '../../pages/user/components/TopNavbar/TopNavbar';
import Sidebar from '../../pages/user/components/Sidebar/Sidebar';
import './AuthenticatedLayout.css'; // Import the CSS file

/**
 * AuthenticatedLayout wraps all authenticated pages and includes the TopNavbar and Sidebar
 * This ensures consistent layout across all authenticated routes
 */
const AuthenticatedLayout = () => {
  // Add class to body for sidebar adjustments
  useEffect(() => {
    document.body.classList.add('with-sidebar');
    
    return () => {
      document.body.classList.remove('with-sidebar');
    };
  }, []);

  return (
    <div className="authenticated-layout">
      {/* TopNavbar is always included for authenticated users */}
      <TopNavbar />
      
      {/* Sidebar is always included for authenticated users */}
      <Sidebar />
      
      {/* Outlet renders the nested route content */}
      <div className="authenticated-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
