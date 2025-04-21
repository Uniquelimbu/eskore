// Theme exports
import { ThemeProvider } from './contexts/ThemeContext';
import useTheme from './hooks/useTheme';
import withThemedLayout from './utils/withThemedLayout';
import * as themeUtils from './utils/themeUtils';

// Import CSS files to ensure they're included in the bundle
import './styles/variables.css';
import './styles/theme.css';

// Export all theme-related functionality
export {
  ThemeProvider,
  useTheme,
  withThemedLayout,
  themeUtils
};

// Default export for convenience
export default ThemeProvider;