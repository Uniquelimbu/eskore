import React, { createContext, useContext, useState, useEffect } from 'react';

// Default theme colors
const lightTheme = {
  primary: '#4a6cf7',
  secondary: '#5e2ced',
  background: '#f8f9fa',
  card: '#ffffff',
  text: '#2d3748',
  textLight: '#718096',
  border: '#e2e8f0',
  error: '#e53e3e',
  success: '#48bb78',
  warning: '#ecc94b',
  info: '#4299e1'
};

const darkTheme = {
  primary: '#4a6cf7',
  secondary: '#5e2ced', 
  background: '#1a202c',
  card: '#2d3748',
  text: '#f7fafc',
  textLight: '#a0aec0',
  border: '#4a5568',
  error: '#fc8181',
  success: '#68d391',
  warning: '#f6e05e',
  info: '#63b3ed'
};

// Create context
const ThemeContext = createContext({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
  // Check if user has a theme preference
  const prefersDark = window.matchMedia && 
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Check local storage for saved preference or use system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('eskore-theme');
    return savedTheme ? savedTheme === 'dark' : prefersDark;
  });

  // Update theme when isDarkMode changes
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('eskore-theme', isDarkMode ? 'dark' : 'light');
    // Apply theme to body element for global styling
    document.body.dataset.theme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only update if user hasn't set a preference
      if (!localStorage.getItem('eskore-theme')) {
        setIsDarkMode(e.matches);
      }
    };

    // Add listener with compatibility for older browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
