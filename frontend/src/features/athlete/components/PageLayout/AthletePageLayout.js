import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTheme } from '../../../../theme';
import './AthletePageLayout.css';

/**
 * A consistent layout wrapper for all athlete pages
 * - Uses sidebar navigation only (no header/footer)
 * - Applies athlete theme
 * - Consistent styling across all athlete pages
 */
const AthletePageLayout = ({ children, title, description }) => {
  const { switchTheme } = useTheme();
  
  // Apply athlete theme when component mounts
  useEffect(() => {
    switchTheme('athlete');
    document.body.classList.add('athlete-page');
    
    return () => {
      // Restore theme when athlete pages are unmounted
      switchTheme('light');
      document.body.classList.remove('athlete-page');
    };
  }, [switchTheme]);

  return (
    <div className="athlete-page-layout">
      <Helmet>
        <title>{title || 'Athlete Dashboard'} | eSkore</title>
        <meta 
          name="description" 
          content={description || "Manage your athlete profile on eSkore."}
        />
      </Helmet>
      
      <div className="athlete-page-content">
        {children}
      </div>
    </div>
  );
};

export default AthletePageLayout;
