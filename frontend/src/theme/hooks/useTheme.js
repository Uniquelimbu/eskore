/**
 * Custom hook to access the theme context.
 * This simply re-exports the useTheme hook from the context file
 * for potentially cleaner imports in components.
 */
export { useTheme } from '../contexts/ThemeContext';

/* 
  Removed the previous implementation:
  import { useContext } from 'react';
  import { ThemeContext } from '../contexts/ThemeContext'; // This import was causing the error

  export const useTheme = () => {
    const context = useContext(ThemeContext); 
    if (!context) {
      throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
  }; 
*/