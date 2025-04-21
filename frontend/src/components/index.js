/**
 * Export all components from a central location
 */

// Import layout components
import Header from './layout/Header/Header';
import Footer from './layout/Footer/Footer';
import Sidebar from './layout/Sidebar/Sidebar';
import SidebarToggle from './layout/SidebarToggle/SidebarToggle';

// Import utility components
import ErrorBoundary from './ErrorBoundary/ErrorBoundary';
import ProtectedRoute from './utility/ProtectedRoute';

// Import feedback components
import LoadingFallback from './feedback/LoadingFallback';
import LoadingSpinner from './feedback/LoadingSpinner';
import ConnectionAlert from './NetworkStatus/ConnectionAlert';

// Import additional components
import LazyImage from './LazyImage/LazyImage';

// Import button components
import { SignInButton } from './buttons';

// Export all components for easy imports elsewhere in the app
export {
  // Layout Components
  Header,
  Footer,
  Sidebar,
  SidebarToggle,
  
  // Utility Components
  ErrorBoundary,
  ProtectedRoute,
  
  // Feedback Components
  LoadingFallback,
  LoadingSpinner,
  ConnectionAlert,
  
  // Media Components
  LazyImage,
  
  // Button Components
  SignInButton,
  
  // Note: The following components should be added as they're implemented
  // in their respective directories
  /*
  // UI Components (from /components/ui)
  Button,
  Card,
  Badge,
  Avatar,
  
  // Form Components (from /components/form)
  Input,
  Select,
  Checkbox,
  Radio,
  FormGroup,
  
  // Data Components (from /components/data)
  Table,
  List,
  DataGrid,
  Chart,
  */
};

// If you need NavigationGuard as a named export, do this:
export { NavigationGuard } from './utility/NavigationGuard';
