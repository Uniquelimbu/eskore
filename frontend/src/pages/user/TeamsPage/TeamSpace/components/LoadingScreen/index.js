/**
 * LoadingScreen Module Exports
 * CRITICAL: Must export LoadingScreen as default
 */

// Import components first
import LoadingScreenComponent, {
  TeamSpaceLoading,
  TeamDataLoading,
  FormationLoading,
  SkeletonLoading
} from './LoadingScreen';

// ✅ CRITICAL: Export LoadingScreen as DEFAULT
export default LoadingScreenComponent;

// Named exports
export { default as LoadingScreen } from './LoadingScreen';
export {
  TeamSpaceLoading,
  TeamDataLoading,
  FormationLoading,
  SkeletonLoading
} from './LoadingScreen';