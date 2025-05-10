import React from 'react';
import Sidebar from '../pages/user/components/Sidebar/Sidebar';

/**
 * Wrapper component for all authenticated pages to ensure consistent layout
 */
const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="authenticated-layout-wrapper">
      <Sidebar />
      <main className="authenticated-content">
        {children}
      </main>
    </div>
  );
};

export default AuthenticatedLayout;
