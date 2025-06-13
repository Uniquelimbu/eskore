/**
 * Layout Module Exports
 * CRITICAL: Must export TeamSpaceLayout as default
 */

// Import components first
import TeamSpaceLayoutComponent, {
  DashboardLayout,
  CenteredLayout,
  SplitLayout,
  useTeamSpaceLayout
} from './TeamSpaceLayout';

// ✅ CRITICAL: Export TeamSpaceLayout as DEFAULT
export default TeamSpaceLayoutComponent;

// Named exports
export { default as TeamSpaceLayout } from './TeamSpaceLayout';
export {
  DashboardLayout,
  CenteredLayout,
  SplitLayout,
  useTeamSpaceLayout
} from './TeamSpaceLayout';