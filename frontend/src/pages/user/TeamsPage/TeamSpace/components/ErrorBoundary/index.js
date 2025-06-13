/**
 * ErrorBoundary Module Exports
 * CRITICAL: Must export TeamSpaceErrorBoundary as default
 */

// Import components first
import TeamSpaceErrorBoundaryComponent from './TeamSpaceErrorBoundary';
import {
  withTeamSpaceErrorBoundary,
  withRetryableErrorBoundary,
  withCustomErrorMessage
} from './withErrorBoundary';

// ✅ NEW: Import the hook
import { useErrorBoundary } from './useErrorBoundary';

// ✅ CRITICAL: Export TeamSpaceErrorBoundary as DEFAULT
export default TeamSpaceErrorBoundaryComponent;

// Named exports
export { default as TeamSpaceErrorBoundary } from './TeamSpaceErrorBoundary';
export {
  withTeamSpaceErrorBoundary,
  withRetryableErrorBoundary,
  withCustomErrorMessage
} from './withErrorBoundary';

// ✅ NEW: Export the hook
export { useErrorBoundary } from './useErrorBoundary';

// Additional alias
export const withErrorBoundary = withTeamSpaceErrorBoundary;