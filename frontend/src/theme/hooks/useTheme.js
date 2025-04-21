import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

/**
 * Custom hook to access theme context throughout the application
 * @returns {Object} Theme context value including currentTheme, switchTheme, and themes
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default useTheme;