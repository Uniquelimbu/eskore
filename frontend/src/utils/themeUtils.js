/**
 * Utility functions for theme management
 */

/**
 * Apply a theme by setting CSS variables
 * @param {Object} theme - Theme object with color variables
 */
export const applyTheme = (theme) => {
  // Apply each theme property as a CSS variable
  Object.entries(theme).forEach(([property, value]) => {
    document.documentElement.style.setProperty(`--${property}`, value);
  });
};

/**
 * Get system color scheme preference
 * @returns {string} 'dark' or 'light'
 */
export const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Save theme preference to localStorage
 * @param {string} theme - Theme name
 */
export const saveThemePreference = (theme) => {
  localStorage.setItem('theme-preference', theme);
};

/**
 * Get theme preference from local storage
 * @returns {string|null} Theme name or null if not set
 */
export const getThemePreference = () => {
  return localStorage.getItem('theme-preference');
};

/**
 * Apply athlete-specific theme settings
 */
export const applyAthleteTheme = () => {
  document.body.classList.add('athlete-layout');
};

/**
 * Remove athlete-specific theme settings
 */
export const removeAthleteTheme = () => {
  document.body.classList.remove('athlete-layout');
};

export default {
  applyTheme,
  getSystemTheme,
  saveThemePreference,
  getThemePreference,
  applyAthleteTheme,
  removeAthleteTheme
};
