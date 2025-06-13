/**
 * Modal Module Exports
 * CRITICAL: Must export ConfirmationModal as default
 */

// Import components first
import ConfirmationModalComponent, {
  DangerConfirmationModal,
  WarningConfirmationModal,
  SuccessConfirmationModal,
  useConfirmationModal
} from './ConfirmationModal';

// ✅ CRITICAL: Export ConfirmationModal as DEFAULT
export default ConfirmationModalComponent;

// Named exports
export { default as ConfirmationModal } from './ConfirmationModal';
export {
  DangerConfirmationModal,
  WarningConfirmationModal,
  SuccessConfirmationModal,
  useConfirmationModal
} from './ConfirmationModal';