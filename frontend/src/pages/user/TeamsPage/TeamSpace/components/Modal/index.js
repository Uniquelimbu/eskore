/**
 * Modal Module - Simple Re-exports
 * Lightweight module that only re-exports Modal components
 */

// Re-export main component as default
export { default } from './ConfirmationModal';

// Re-export all named exports
export {
  DangerConfirmationModal,
  WarningConfirmationModal,
  SuccessConfirmationModal,
  useConfirmationModal
} from './ConfirmationModal';

// Named export for main component
export { default as ConfirmationModal } from './ConfirmationModal';