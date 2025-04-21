import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import './UserPageLayout.css';

/**
 * A consistent layout wrapper for all user type pages (athlete, manager, etc.)
 * - Adds appropriate body classes for styling
 * - Consistent styling across all user pages
 */
export const UserPageLayout = ({ children, title, description, userType = 'athlete' }) => {
  // Add user-type class to body when component mounts
  // Remove it when component unmounts
  useEffect(() => {
    document.body.classList.add(`${userType}-page`);
    
    return () => {
      document.body.classList.remove(`${userType}-page`);
    };
  }, [userType]);

  return (
    <div className={`${userType}-page-layout`}>
      <Helmet>
        <title>{title || `${userType.charAt(0).toUpperCase() + userType.slice(1)} Dashboard`} | eSkore</title>
        <meta 
          name="description" 
          content={description || `Manage your ${userType} profile on eSkore.`}
        />
        {/* Use Helmet to add isolated styles for this user type */}
        <style type="text/css">{`
          /* Ensure these styles ONLY apply when on this user type's pages */
          body.${userType}-page {
            background-color: #222729;
            color: white;
          }
          
          /* Reset styles for home page when on user pages */
          body.${userType}-page .home-page {
            background-color: #222729;
          }
        `}</style>
      </Helmet>
      
      <div className={`${userType}-page-content`}>
        {children}
      </div>
    </div>
  );
};

export default UserPageLayout;
