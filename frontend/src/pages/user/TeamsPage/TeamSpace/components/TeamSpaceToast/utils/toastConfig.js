/**
 * Toast Type Configurations
 * Centralized configuration for different toast types
 */

export const TOAST_CONFIGS = {
  success: {
    iconDefault: '✅',
    bgColor: 'var(--success-color, #48bb78)',
    textColor: '#ffffff',
    borderColor: 'var(--success-dark, #38a169)',
    progressColor: 'rgba(255, 255, 255, 0.3)',
    ariaLabel: 'Success notification'
  },
  error: {
    iconDefault: '❌',
    bgColor: 'var(--danger-color, #e53e3e)',
    textColor: '#ffffff',
    borderColor: 'var(--danger-dark, #c53030)',
    progressColor: 'rgba(255, 255, 255, 0.3)',
    ariaLabel: 'Error notification'
  },
  warning: {
    iconDefault: '⚠️',
    bgColor: 'var(--warning-color, #ed8936)',
    textColor: '#ffffff',
    borderColor: 'var(--warning-dark, #dd6b20)',
    progressColor: 'rgba(255, 255, 255, 0.3)',
    ariaLabel: 'Warning notification'
  },
  info: {
    iconDefault: 'ℹ️',
    bgColor: 'var(--info-color, #4299e1)',
    textColor: '#ffffff',
    borderColor: 'var(--info-dark, #3182ce)',
    progressColor: 'rgba(255, 255, 255, 0.3)',
    ariaLabel: 'Information notification'
  },
  loading: {
    iconDefault: '⏳',
    bgColor: 'var(--secondary-color, #232b3a)',
    textColor: 'var(--text-light, #e2e8f0)',
    borderColor: 'var(--border-color, #2d3748)',
    progressColor: 'var(--primary-color, #4a6cf7)',
    ariaLabel: 'Loading notification'
  }
};

export const TOAST_DEFAULTS = {
  duration: 5000,
  position: 'top-right',
  size: 'default',
  animate: true,
  sound: false,
  showProgress: true,
  dismissible: true,
  persistent: false,
  trackInteraction: true
};

export const TOAST_POSITIONS = [
  'top-right', 'top-left', 'bottom-right', 
  'bottom-left', 'top-center', 'bottom-center'
];

export const TOAST_SIZES = ['small', 'default', 'large'];

export const TOAST_TYPES = ['success', 'error', 'warning', 'info', 'loading'];