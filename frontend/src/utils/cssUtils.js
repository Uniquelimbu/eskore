/**
 * Creates namespaced CSS class names to prevent conflicts between components
 * @param {string} componentName - The component name to use as namespace
 * @param {Object} styles - Style object with class names as keys (for CSS modules)
 * @returns {Function} - Function that returns namespaced class name
 */
export const createNamespacedClasses = (componentName, styles = {}) => {
  return (className, additionalClasses = '') => {
    // If using CSS modules, use the imported styles
    const baseClass = styles[className] || `${componentName}__${className}`;
    return additionalClasses ? `${baseClass} ${additionalClasses}` : baseClass;
  };
};

/**
 * Combines multiple class names conditionally
 * @param {...string} classes - Class names to combine
 * @returns {string} - Combined class names
 */
export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Generate a unique page-specific CSS namespace to avoid conflicts
 * @param {string} pageName - Name of the page
 * @param {string} componentName - Name of the component
 * @returns {string} - Namespaced class name
 */
export const pageSpecificClass = (pageName, componentName) => {
  return `page-${pageName}__${componentName}`;
};

/**
 * Creates namespaced CSS class names to prevent conflicts
 * @param {string} baseNamespace - Base namespace for the component
 * @returns {Object} - Utility functions for working with namespaced classes
 */
export const createNamespace = (baseNamespace) => {
  /**
   * Create a namespaced class name
   * @param {string} className - Base class name
   * @returns {string} - Namespaced class
   */
  const cls = (className) => {
    return className ? `${baseNamespace}-${className}` : baseNamespace;
  };
  
  /**
   * Create a modifier class within the namespace
   * @param {string} className - Base class name
   * @param {string} modifier - Modifier name
   * @returns {string} - Namespaced modifier class
   */
  const modifier = (className, modifier) => {
    return modifier ? `${cls(className)}--${modifier}` : '';
  };
  
  /**
   * Combine multiple class names
   * @param {...string} classes - Class names to combine
   * @returns {string} - Combined class names
   */
  const classes = (...classNames) => {
    return classNames.filter(Boolean).join(' ');
  };
  
  return {
    cls,
    modifier,
    classes
  };
};

/**
 * Safely access CSS module classes with fallback
 * @param {Object} styles - CSS module styles object
 * @param {string} className - Class name to access
 * @param {string} [fallback] - Fallback class name if module class not found
 * @returns {string} - CSS class name
 */
export const getModuleClass = (styles, className, fallback = '') => {
  // If styles is not an object (e.g., if import failed), return fallback
  if (!styles || typeof styles !== 'object') {
    return fallback || className;
  }
  
  // If the className exists in the styles object, return it, otherwise fallback
  return styles[className] || fallback || className;
};

/**
 * Create a BEM-style class name
 * @param {string} block - BEM block name
 * @param {string} [element] - BEM element name
 * @param {string} [modifier] - BEM modifier name
 * @returns {string} - BEM class name
 */
export const bemClass = (block, element, modifier) => {
  let className = block;
  
  if (element) {
    className += `__${element}`;
  }
  
  if (modifier) {
    className += `--${modifier}`;
  }
  
  return className;
};
