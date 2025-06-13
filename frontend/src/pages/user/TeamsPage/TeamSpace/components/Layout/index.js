/**
 * Layout Module - Simple Re-exports
 * Lightweight module that only re-exports Layout components
 */

// Re-export main component as default
export { default } from './TeamSpaceLayout';

// Re-export all named exports
export {
  DashboardLayout,
  CenteredLayout,
  SplitLayout,
  useTeamSpaceLayout
} from './TeamSpaceLayout';

// Named export for main component
export { default as TeamSpaceLayout } from './TeamSpaceLayout';