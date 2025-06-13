import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Industry-standard Confirmation Modal for TeamSpace
 * Features: Multiple variants, keyboard navigation, focus management, animations, accessibility
 */
const ConfirmationModal = memo(({
  isOpen = false,
  onConfirm = null,
  onCancel = null,
  onClose = null,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default", // default, danger, warning, success, info
  size = "medium", // small, medium, large
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  autoFocus = true,
  preventBodyScroll = true,
  animated = true,
  confirmButtonLoading = false,
  disabled = false,
  icon = null,
  children = null,
  customActions = null,
  trackInteraction = true,
  modalId = null,
  className = ""
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const modalRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const overlayRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Variant configurations
  const variantConfigs = {
    default: {
      iconDefault: '❓',
      confirmButtonClass: 'btn-primary',
      modalClass: 'modal-default'
    },
    danger: {
      iconDefault: '⚠️',
      confirmButtonClass: 'btn-danger',
      modalClass: 'modal-danger'
    },
    warning: {
      iconDefault: '🚨',
      confirmButtonClass: 'btn-warning',
      modalClass: 'modal-warning'
    },
    success: {
      iconDefault: '✅',
      confirmButtonClass: 'btn-success',
      modalClass: 'modal-success'
    },
    info: {
      iconDefault: 'ℹ️',
      confirmButtonClass: 'btn-info',
      modalClass: 'modal-info'
    }
  };

  const config = variantConfigs[variant] || variantConfigs.default;

  // Handle modal opening/closing with animation
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      
      // Store previously focused element
      previousActiveElement.current = document.activeElement;
      
      // Prevent body scroll
      if (preventBodyScroll) {
        document.body.style.overflow = 'hidden';
      }
      
      // Trigger animation
      if (animated) {
        setTimeout(() => setIsAnimating(true), 10);
      } else {
        setIsAnimating(true);
      }
      
      // Focus management
      if (autoFocus) {
        setTimeout(() => {
          if (confirmButtonRef.current) {
            confirmButtonRef.current.focus();
          }
        }, 100);
      }
      
      // Track modal opening
      if (trackInteraction && window.gtag) {
        window.gtag('event', 'modal_opened', {
          modal_id: modalId || 'confirmation',
          modal_variant: variant
        });
      }
    } else {
      setIsAnimating(false);
      
      // Restore body scroll
      if (preventBodyScroll) {
        document.body.style.overflow = '';
      }
      
      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
      
      // Unmount after animation
      if (animated) {
        setTimeout(() => setIsMounted(false), 300);
      } else {
        setIsMounted(false);
      }
    }
    
    return () => {
      // Cleanup on unmount
      if (preventBodyScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, animated, autoFocus, preventBodyScroll, trackInteraction, modalId, variant]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        if (closeOnEscape && !disabled) {
          e.preventDefault();
          handleClose();
        }
        break;
        
      case 'Tab':
        // Trap focus within modal
        const focusableElements = modalRef.current?.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        );
        
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
        break;
        
      case 'Enter':
        // Enter key confirms if focus is not on cancel button
        if (document.activeElement !== cancelButtonRef.current && !disabled) {
          e.preventDefault();
          handleConfirm();
        }
        break;
    }
  }, [isOpen, closeOnEscape, disabled]);

  // Add keyboard listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  /**
   * Handle confirm action
   */
  const handleConfirm = useCallback(async () => {
    if (disabled || confirmButtonLoading) return;
    
    // Track interaction
    if (trackInteraction && window.gtag) {
      window.gtag('event', 'modal_confirmed', {
        modal_id: modalId || 'confirmation',
        modal_variant: variant
      });
    }
    
    if (onConfirm) {
      try {
        await onConfirm();
      } catch (error) {
        console.error('ConfirmationModal: Error in onConfirm:', error);
      }
    }
  }, [disabled, confirmButtonLoading, onConfirm, trackInteraction, modalId, variant]);

  /**
   * Handle cancel action
   */
  const handleCancel = useCallback(() => {
    if (disabled) return;
    
    // Track interaction
    if (trackInteraction && window.gtag) {
      window.gtag('event', 'modal_cancelled', {
        modal_id: modalId || 'confirmation',
        modal_variant: variant
      });
    }
    
    if (onCancel) {
      onCancel();
    } else {
      handleClose();
    }
  }, [disabled, onCancel, trackInteraction, modalId, variant]);

  /**
   * Handle close action
   */
  const handleClose = useCallback(() => {
    if (disabled) return;
    
    if (onClose) {
      onClose();
    }
  }, [disabled, onClose]);

  /**
   * Handle overlay click
   */
  const handleOverlayClick = useCallback((e) => {
    if (closeOnOverlayClick && e.target === overlayRef.current && !disabled) {
      handleClose();
    }
  }, [closeOnOverlayClick, disabled, handleClose]);

  /**
   * Render modal icon
   */
  const renderIcon = () => {
    const iconToRender = icon || config.iconDefault;
    
    if (!iconToRender) return null;
    
    return (
      <div className="modal-icon" role="img" aria-label={`${variant} icon`}>
        {typeof iconToRender === 'string' ? (
          <span className="modal-icon-emoji">{iconToRender}</span>
        ) : (
          iconToRender
        )}
      </div>
    );
  };

  /**
   * Render action buttons
   */
  const renderActions = () => {
    if (customActions) {
      return <div className="modal-actions">{customActions}</div>;
    }
    
    return (
      <div className="modal-actions">
        <button
          ref={cancelButtonRef}
          onClick={handleCancel}
          disabled={disabled}
          className="btn btn-secondary modal-cancel-btn"
          type="button"
        >
          {cancelText}
        </button>
        
        <button
          ref={confirmButtonRef}
          onClick={handleConfirm}
          disabled={disabled || confirmButtonLoading}
          className={`btn ${config.confirmButtonClass} modal-confirm-btn ${confirmButtonLoading ? 'loading' : ''}`}
          type="button"
        >
          {confirmButtonLoading ? (
            <>
              <span className="btn-loading-spinner"></span>
              <span className="btn-loading-text">Processing...</span>
            </>
          ) : (
            confirmText
          )}
        </button>
      </div>
    );
  };

  // Don't render if not mounted
  if (!isMounted) return null;

  // Container classes
  const containerClasses = [
    'confirmation-modal-overlay',
    isAnimating ? 'modal-animating' : '',
    animated ? 'modal-animated' : '',
    `modal-${size}`,
    config.modalClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={overlayRef}
      className={containerClasses}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      data-testid="confirmation-modal"
    >
      <div ref={modalRef} className="confirmation-modal">
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={handleClose}
            disabled={disabled}
            className="modal-close-button"
            aria-label="Close modal"
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* Modal Content */}
        <div className="modal-content">
          {/* Icon */}
          {renderIcon()}

          {/* Header */}
          <div className="modal-header">
            <h2 id="modal-title" className="modal-title">
              {title}
            </h2>
          </div>

          {/* Body */}
          <div className="modal-body">
            <p id="modal-description" className="modal-message">
              {message}
            </p>
            {children}
          </div>

          {/* Actions */}
          {renderActions()}
        </div>
      </div>

      {/* Modal Styles */}
      <style jsx>{`
        .confirmation-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .modal-animated.modal-animating {
          opacity: 1;
          visibility: visible;
        }

        .confirmation-modal {
          background-color: var(--card-bg, #232b3a);
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
          border: 1px solid var(--border-color, #2d3748);
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
          transform: scale(0.95) translateY(20px);
          transition: transform 0.3s ease;
        }

        .modal-animated.modal-animating .confirmation-modal {
          transform: scale(1) translateY(0);
        }

        /* Size variants */
        .modal-small .confirmation-modal {
          width: 100%;
          max-width: 400px;
        }

        .modal-medium .confirmation-modal {
          width: 100%;
          max-width: 500px;
        }

        .modal-large .confirmation-modal {
          width: 100%;
          max-width: 700px;
        }

        /* Close button */
        .modal-close-button {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          color: var(--text-muted, #a0aec0);
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
          z-index: 1;
        }

        .modal-close-button:hover {
          color: var(--text-light, #e2e8f0);
          background-color: rgba(255, 255, 255, 0.1);
        }

        .modal-close-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Modal content */
        .modal-content {
          padding: 32px;
          text-align: center;
        }

        .modal-small .modal-content {
          padding: 24px;
        }

        .modal-large .modal-content {
          padding: 40px;
        }

        /* Icon */
        .modal-icon {
          margin-bottom: 20px;
        }

        .modal-icon-emoji {
          font-size: 3rem;
          display: block;
        }

        /* Header */
        .modal-header {
          margin-bottom: 16px;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-light, #e2e8f0);
          margin: 0;
          line-height: 1.3;
        }

        .modal-small .modal-title {
          font-size: 1.3rem;
        }

        .modal-large .modal-title {
          font-size: 1.75rem;
        }

        /* Body */
        .modal-body {
          margin-bottom: 32px;
        }

        .modal-message {
          font-size: 1rem;
          color: var(--text-muted, #a0aec0);
          line-height: 1.5;
          margin: 0;
        }

        .modal-small .modal-message {
          font-size: 0.9rem;
        }

        .modal-large .modal-message {
          font-size: 1.1rem;
        }

        /* Actions */
        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .modal-cancel-btn,
        .modal-confirm-btn {
          min-width: 100px;
          position: relative;
        }

        .modal-confirm-btn.loading {
          color: transparent;
        }

        .btn-loading-spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          transform: translate(-50%, -50%);
        }

        .btn-loading-text {
          opacity: 0;
        }

        @keyframes spin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* Variant styles */
        .modal-danger .modal-title {
          color: var(--danger-color, #e53e3e);
        }

        .modal-warning .modal-title {
          color: var(--warning-color, #ed8936);
        }

        .modal-success .modal-title {
          color: var(--success-color, #48bb78);
        }

        .modal-info .modal-title {
          color: var(--info-color, #4299e1);
        }

        /* Focus styles */
        .modal-cancel-btn:focus,
        .modal-confirm-btn:focus,
        .modal-close-button:focus {
          outline: 2px solid var(--primary-color, #4a6cf7);
          outline-offset: 2px;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .confirmation-modal-overlay {
            padding: 16px;
          }

          .modal-content {
            padding: 24px;
          }

          .modal-title {
            font-size: 1.3rem;
          }

          .modal-message {
            font-size: 0.9rem;
          }

          .modal-actions {
            flex-direction: column-reverse;
          }

          .modal-cancel-btn,
          .modal-confirm-btn {
            width: 100%;
            min-width: auto;
          }

          .modal-icon-emoji {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 480px) {
          .confirmation-modal-overlay {
            padding: 12px;
          }

          .modal-content {
            padding: 20px;
          }

          .modal-close-button {
            top: 12px;
            right: 12px;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .confirmation-modal {
            border: 2px solid #ffffff;
          }

          .modal-cancel-btn,
          .modal-confirm-btn {
            border: 2px solid currentColor;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .confirmation-modal-overlay,
          .confirmation-modal,
          .modal-close-button,
          .btn-loading-spinner {
            transition: none;
            animation: none;
          }

          .confirmation-modal {
            transform: none;
          }
        }

        /* Print styles */
        @media print {
          .confirmation-modal-overlay {
            display: none;
          }
        }
      `}</style>
    </div>
  );
});

// Display name for debugging
ConfirmationModal.displayName = 'ConfirmationModal';

// PropTypes
ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  onClose: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'danger', 'warning', 'success', 'info']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showCloseButton: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  autoFocus: PropTypes.bool,
  preventBodyScroll: PropTypes.bool,
  animated: PropTypes.bool,
  confirmButtonLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node,
  customActions: PropTypes.node,
  trackInteraction: PropTypes.bool,
  modalId: PropTypes.string,
  className: PropTypes.string
};

export default ConfirmationModal;

// Convenience components for specific use cases
export const DangerConfirmationModal = (props) => (
  <ConfirmationModal 
    variant="danger" 
    title="Confirm Deletion" 
    confirmText="Delete"
    {...props} 
  />
);

export const WarningConfirmationModal = (props) => (
  <ConfirmationModal 
    variant="warning" 
    title="Warning" 
    confirmText="Continue"
    {...props} 
  />
);

export const SuccessConfirmationModal = (props) => (
  <ConfirmationModal 
    variant="success" 
    title="Success" 
    confirmText="Continue"
    {...props} 
  />
);

// Hook for managing confirmation modal state
export const useConfirmationModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});

  const show = useCallback((modalConfig = {}) => {
    setConfig(modalConfig);
    setIsOpen(true);
  }, []);

  const hide = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setConfig({}), 300); // Clear config after animation
  }, []);

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setConfig({
        message,
        onConfirm: () => {
          resolve(true);
          hide();
        },
        onCancel: () => {
          resolve(false);
          hide();
        },
        ...options
      });
      setIsOpen(true);
    });
  }, [hide]);

  return {
    isOpen,
    config,
    show,
    hide,
    confirm
  };
};