/**
 * Dashboard Components - Centralized Export Module
 */

// ============================================================================
// CORE DASHBOARD COMPONENTS - TREE-SHAKING OPTIMIZED
// ============================================================================

/**
 * Dashboard Grid System
 */
export { 
  default as DashboardGrid,
  defaultNavigationCards,
  useDashboardGrid 
} from './DashboardGrid/DashboardGrid';

/**
 * Navigation Card Components
 */
export { 
  default as NavigationCard,
  PrimaryNavigationCard,
  SecondaryNavigationCard,
  LoadingNavigationCard,
  DisabledNavigationCard,
  useNavigationCard
} from './NavigationCard/NavigationCard';

/**
 * Team Header Components
 */
export { 
  default as TeamHeader,
  HorizontalTeamHeader,
  VerticalTeamHeader,
  CompactTeamHeader,
  useTeamHeader
} from './TeamHeader/TeamHeader';

// ============================================================================
// COMPONENT COLLECTIONS
// ============================================================================

/**
 * Core Dashboard Components Collection
 */
export const DashboardComponents = {
  get DashboardGrid() { return require('./DashboardGrid/DashboardGrid').default; },
  get NavigationCard() { return require('./NavigationCard/NavigationCard').default; },
  get TeamHeader() { return require('./TeamHeader/TeamHeader').default; }
};

/**
 * Navigation Components Collection
 */
export const NavigationComponents = {
  get DashboardGrid() { return require('./DashboardGrid/DashboardGrid').default; },
  get NavigationCard() { return require('./NavigationCard/NavigationCard').default; },
  get PrimaryNavigationCard() { return require('./NavigationCard/NavigationCard').PrimaryNavigationCard; },
  get SecondaryNavigationCard() { return require('./NavigationCard/NavigationCard').SecondaryNavigationCard; },
  get LoadingNavigationCard() { return require('./NavigationCard/NavigationCard').LoadingNavigationCard; },
  get DisabledNavigationCard() { return require('./NavigationCard/NavigationCard').DisabledNavigationCard; }
};

/**
 * Dashboard Hooks Collection
 */
export const DashboardHooks = {
  get useDashboardGrid() { return require('./DashboardGrid/DashboardGrid').useDashboardGrid; },
  get useNavigationCard() { return require('./NavigationCard/NavigationCard').useNavigationCard; },
  get useTeamHeader() { return require('./TeamHeader/TeamHeader').useTeamHeader; }
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const DashboardComponentsModule = {
  DashboardGrid: require('./DashboardGrid/DashboardGrid').default,
  NavigationCard: require('./NavigationCard/NavigationCard').default,
  TeamHeader: require('./TeamHeader/TeamHeader').default,
  
  // Collections
  DashboardComponents,
  NavigationComponents,
  DashboardHooks
};

export default DashboardComponentsModule;