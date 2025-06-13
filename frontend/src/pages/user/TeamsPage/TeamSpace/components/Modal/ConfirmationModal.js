/**
 * ConfirmationModal Component
 * Accessible modal dialog with keyboard navigation and focus management
 */

import React, { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';

// Import CSS files
import './ConfirmationModal.css';
import './variants.css';
import './animations.css';
import './responsive.css';

/**
 * ConfirmationModal component with comprehensive accessibility and variants
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
  variant = "default",
  size = "default",
  icon = null,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  animated = true,
  disabled = false,
  loading = false,
  className = "",
  children = null,
  theme = "auto",
  animation = "scale",
  urgent = false,
  destructive = false,
  autoFocus = true,
  trapFocus = true
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [confirmButtonLoading, setConfirmButtonLoading] = useState(false);
  
  const modalRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Mount/unmount animation handling
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      if (animated) {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 300);
        return () => clearTimeout(timer);
      }
    } else if (isMounted) {
      if (animated) {
        setIsAnimating(true);
        const timer = setTimeout(() => {
          setIsMounted(false);
          setIsAnimating(false);
        }, 300);
        return () => clearTimeout(timer);
      } else {
        setIsMounted(false);
      }
    }
  }, [isOpen, animated, isMounted]);

  // Focus management
  useEffect(() => {
    if (isOpen && isMounted) {
      previousActiveElement.current = document.activeElement;
      
      if (autoFocus) {
        const timer = setTimeout(() => {
          if (cancelButtonRef.current) {
            cancelButtonRef.current.focus();
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    } else if (!isOpen && previousActiveElement.current) {
      previousActiveElement.current.focus();
      previousActiveElement.current = null;
    }
  }, [isOpen, isMounted, autoFocus]);

  // Escape key handling
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !trapFocus) return;

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen, trapFocus]);

  /**
   * Handle overlay click
   */
  const handleOverlayClick = useCallback((e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      handleCancel();
    }
  }, [closeOnOverlayClick]);

  /**
   * Handle cancel action
   */
  const handleCancel = useCallback(() => {
    if (disabled || confirmButtonLoading) return;
    
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  }, [disabled, confirmButtonLoading, onCancel, onClose]);

  /**
   * Handle confirm action
   */
  const handleConfirm = useCallback(async () => {
    if (disabled || confirmButtonLoading || !onConfirm) return;

    try {
      setConfirmButtonLoading(true);
      await onConfirm();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setConfirmButtonLoading(false);
    }
  }, [disabled, confirmButtonLoading, onConfirm]);

  /**
   * Get modal configuration based on variant
   */
  const config = useMemo(() => {
    const configs = {
      default: {
        icon: icon || '❓',
        confirmButtonClass: 'btn-primary',
        modalClass: 'modal-default'
      },
      danger: {
        icon: icon || '⚠️',
        confirmButtonClass: 'btn-danger',
        modalClass: 'modal-danger'
      },
      warning: {
        icon: icon || '⚠️',
        confirmButtonClass: 'btn-warning',
        modalClass: 'modal-warning'
      },
      success: {
        icon: icon || '✅',
        confirmButtonClass: 'btn-success',
        modalClass: 'modal-success'
      },
      info: {
        icon: icon || 'ℹ️',
        confirmButtonClass: 'btn-info',
        modalClass: 'modal-info'
      }
    };
    
    return configs[variant] || configs.default;
  }, [variant, icon]);

  /**
   * Render modal icon
   */
  const renderIcon = useCallback(() => {
    if (!config.icon) return null;

    return (
      <div className="modal-icon" aria-hidden="true">
        <span className="modal-icon-emoji">
          {config.icon}
        </span>
      </div>
    );
  }, [config.icon]);

  /**
   * Render modal actions
   */
  const renderActions = useCallback(() => {
    return (
      <div className="modal-actions">
        <button
          ref={cancelButtonRef}
          onClick={handleCancel}
          disabled={disabled || confirmButtonLoading}
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
  }, [
    cancelText, confirmText, disabled, confirmButtonLoading, 
    handleCancel, handleConfirm, config.confirmButtonClass
  ]);

  // Don't render if not mounted
  if (!isMounted) return null;

  // Container classes
  const containerClasses = [
    'confirmation-modal-overlay',
    isAnimating ? 'modal-animating' : '',
    animated ? 'modal-animated' : '',
    `modal-${size}`,
    `modal-theme-${theme}`,
    `modal-${animation}`,
    config.modalClass,
    urgent ? 'modal-urgent' : '',
    destructive ? 'modal-destructive' : '',
    !isOpen && animated ? 'modal-closing' : '',
    isOpen ? 'modal-visible' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={containerClasses}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      data-focus-trap={trapFocus}
    >
      <div className="modal-container" ref={modalRef}>
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={handleCancel}
            className="modal-close-button"
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>
        )}

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

      {/* Screen Reader Announcements */}
      <div className="sr-only" aria-live="polite">
        {confirmButtonLoading && "Processing your request..."}
      </div>
    </div>
  );
});

// Display name for debugging
ConfirmationModal.displayName = 'ConfirmationModal';

// PropTypes validation
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
  size: PropTypes.oneOf(['small', 'default', 'large']),
  icon: PropTypes.string,
  showCloseButton: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  animated: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
  theme: PropTypes.oneOf(['dark', 'light', 'auto']),
  animation: PropTypes.oneOf(['scale', 'slide-top', 'slide-bottom', 'bounce', 'zoom', 'blur']),
  urgent: PropTypes.bool,
  destructive: PropTypes.bool,
  autoFocus: PropTypes.bool,
  trapFocus: PropTypes.bool
};

export default ConfirmationModal;

// Convenience modal variants
export const DangerConfirmationModal = (props) => (
  <ConfirmationModal 
    variant="danger" 
    destructive={true}
    {...props} 
  />
);

export const WarningConfirmationModal = (props) => (
  <ConfirmationModal 
    variant="warning" 
    {...props} 
  />
);

export const SuccessConfirmationModal = (props) => (
  <ConfirmationModal 
    variant="success" 
    {...props} 
  />
);

export const InfoConfirmationModal = (props) => (
  <ConfirmationModal 
    variant="info" 
    {...props} 
  />
);

// Hook for modal state management
export const useConfirmationModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});

  const openModal = useCallback((modalConfig = {}) => {
    setConfig(modalConfig);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setConfig({});
  }, []);

  const confirmModal = useCallback((options = {}) => {
    return new Promise((resolve) => {
      openModal({
        ...options,
        onConfirm: () => {
          closeModal();
          resolve(true);
        },
        onCancel: () => {
          closeModal();
          resolve(false);
        }
      });
    });
  }, [openModal, closeModal]);

  return {
    isOpen,
    config,
    openModal,
    closeModal,
    confirmModal
  };
};