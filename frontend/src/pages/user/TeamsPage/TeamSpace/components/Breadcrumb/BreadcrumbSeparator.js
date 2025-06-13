import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { SEPARATOR_TYPES } from './constants';

/**
 * Breadcrumb Separator Component
 * Renders the separator between breadcrumb items
 */
const BreadcrumbSeparator = memo(({
  type = "chevron",
  size = "default",
  index
}) => {
  /**
   * Get separator symbol based on type
   */
  const getSeparatorSymbol = () => {
    return SEPARATOR_TYPES[type] || SEPARATOR_TYPES.chevron;
  };

  /**
   * Container classes
   */
  const separatorClasses = [
    'breadcrumb-separator',
    `separator-${type}`,
    `separator-${size}`
  ].filter(Boolean).join(' ');

  return (
    <span 
      className={separatorClasses}
      aria-hidden="true"
      role="presentation"
    >
      {getSeparatorSymbol()}

      {/* Separator Styles */}
      <style jsx>{`
        .breadcrumb-separator {
          color: var(--text-muted, #a0aec0);
          margin: 0 2px;
          font-size: 0.9em;
          opacity: 0.6;
          user-select: none;
          display: flex;
          align-items: center;
          line-height: 1;
        }

        /* Type-specific styles */
        .separator-slash {
          font-weight: 300;
          font-size: 1em;
        }

        .separator-arrow {
          font-weight: 400;
          font-size: 0.9em;
        }

        .separator-dot {
          font-size: 1.2em;
          font-weight: bold;
        }

        .separator-pipe {
          font-weight: 300;
          opacity: 0.5;
        }

        .separator-chevron {
          font-weight: 500;
        }

        /* Size variants */
        .separator-small {
          margin: 0 1px;
          font-size: 0.8em;
        }

        .separator-large {
          margin: 0 4px;
          font-size: 1em;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .breadcrumb-separator {
            margin: 0 1px;
            font-size: 0.8em;
          }
        }

        @media (max-width: 480px) {
          .breadcrumb-separator {
            font-size: 0.7em;
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .breadcrumb-separator {
            opacity: 1;
            font-weight: bold;
          }
        }

        /* Print styles */
        @media print {
          .breadcrumb-separator {
            color: #000;
            opacity: 1;
          }
        }
      `}</style>
    </span>
  );
});

// Display name for debugging
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

// PropTypes
BreadcrumbSeparator.propTypes = {
  type: PropTypes.oneOf(Object.keys(SEPARATOR_TYPES)),
  size: PropTypes.oneOf(['small', 'default', 'large']),
  index: PropTypes.number
};

export default BreadcrumbSeparator;