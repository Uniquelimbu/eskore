import React, { memo } from 'react';
import PropTypes from 'prop-types';
import TeamSpaceToast from './TeamSpaceToast';
import { TOAST_CONSTANTS } from './utils/constants';

/**
 * Toast Container Component
 * Manages the display and positioning of multiple toasts
 */
const ToastContainer = memo(({ 
  toasts = [], 
  maxToasts = TOAST_CONSTANTS.MAX_TOASTS,
  position = 'top-right',
  onRemove = null 
}) => {
  // Limit number of visible toasts
  const visibleToasts = toasts.slice(-maxToasts);

  if (visibleToasts.length === 0) return null;

  return (
    <div className={`toast-container toast-container-${position}`}>
      {visibleToasts.map((toast, index) => (
        <TeamSpaceToast
          key={toast.id || index}
          {...toast}
          position={position}
          onDismiss={onRemove}
        />
      ))}
    </div>
  );
});

ToastContainer.displayName = 'ToastContainer';

ToastContainer.propTypes = {
  toasts: PropTypes.array,
  maxToasts: PropTypes.number,
  position: PropTypes.oneOf([
    'top-right', 'top-left', 'bottom-right', 
    'bottom-left', 'top-center', 'bottom-center'
  ]),
  onRemove: PropTypes.func
};

export default ToastContainer;