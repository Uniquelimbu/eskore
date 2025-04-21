// Theme exports
import { ThemeProvider } from './contexts/ThemeContext';
import withThemedLayout from './utils/withThemedLayout';
import * as themeUtils from './utils/themeUtils';

// Import CSS files to ensure they're included in the bundle
import './styles/variables.css';
import './styles/theme.css';

// Hooks
export { useTheme } from './hooks/useTheme'; // Changed from 'default as useTheme'

// Export all theme-related functionality
export {
  ThemeProvider,
  withThemedLayout,
  themeUtils
};

// Default export for convenience
export default ThemeProvider;