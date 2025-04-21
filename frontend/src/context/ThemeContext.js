import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  applyTheme, 
  getSystemTheme, 
  saveThemePreference, 
  getThemePreference 
} from '../utils/themeUtils';

// Define theme objects
const themes = {
  light: {
    'color-primary': '#2E1F5E',
    'color-secondary': '#4a90e2',
    'color-accent': '#FF6B6B',
    'color-text-primary': '#333333',
    'color-background-main': '#f7f8fa'
    // Additional theme properties would be defined here
  },
  dark: {
    'color-primary': '#9c95c5',
    'color-secondary': '#5a9eee',
    'color-accent': '#ff8c8c',
    'color-text-primary': '#ffffff',
    'color-background-main': '#222729'
    // Additional theme properties would be defined here
  },
  athlete: {
    'color-primary': '#FF6B6B',
    'color-secondary': '#5a9eee',
    'color-text-primary': '#ffffff',
    'color-background-main': '#222729'
    // Additional theme properties would be defined here
  }
};

// Create context
const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Initialize to saved theme or system default
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = getThemePreference();
    return saved || getSystemTheme();
  });

  // Apply theme whenever it changes
  useEffect(() => {
    const themeObject = themes[currentTheme] || themes.light;
    
    // Apply theme to CSS variables
    applyTheme(themeObject);
    
    // Save preference
    saveThemePreference(currentTheme);
    
    // Update body class
    document.body.classList.remove('light-theme', 'dark-theme', 'athlete-theme');
    document.body.classList.add(`${currentTheme}-theme`);
  }, [currentTheme]);
  
  // Switch to a different theme
  const switchTheme = (theme) => {
    if (themes[theme]) {
      setCurrentTheme(theme);
    } else {
      console.warn(`Theme "${theme}" doesn't exist. Using default.`);
      setCurrentTheme('light');
    }
  };
  
  // Context value object
  const contextValue = {
    currentTheme,
    switchTheme,
    themes
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
