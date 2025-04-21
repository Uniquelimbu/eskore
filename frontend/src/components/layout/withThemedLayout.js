import React, { useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Higher-Order Component to wrap page components with themed layouts
 * 
 * @param {React.Component} Component - The component to wrap
 * @param {string} themeId - The theme ID to apply ('light', 'athlete', etc.)
 */
const withThemedLayout = (Component, themeId = 'light') => {
  return function ThemedComponent(props) {
    const { switchTheme } = useTheme();
    
    useEffect(() => {
      // Apply theme when component mounts
      switchTheme(themeId);
      
      // Clean up by checking if we should restore the default theme
      return () => {
        if (themeId !== 'light') {
          // Only switch back if we're not going to another page with the same theme
          const currentPath = window.location.pathname;
          const isStillInSameTheme = 
            (themeId === 'athlete' && currentPath.includes('/athlete/'));
            
          if (!isStillInSameTheme) {
            switchTheme('light');
          }
        }
      };
    }, [switchTheme]);
    
    return <Component {...props} />;
  };
};

export default withThemedLayout;
