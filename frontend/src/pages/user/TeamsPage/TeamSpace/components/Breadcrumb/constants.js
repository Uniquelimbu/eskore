/**
 * Breadcrumb Constants
 * Configuration constants for breadcrumb components
 */

/**
 * Separator types and their symbols
 */
export const SEPARATOR_TYPES = {
  chevron: '›',
  slash: '/',
  arrow: '→',
  dot: '·',
  pipe: '|',
  caretRight: '▶',
  triangleRight: '▷'
};

/**
 * Size variants for breadcrumb components
 */
export const SIZE_VARIANTS = {
  small: 'small',
  default: 'default',
  large: 'large'
};

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  maxItems: 5,
  separator: 'chevron',
  size: 'default',
  showIcons: true,
  showTeamLogo: true,
  trackNavigation: true,
  collapsible: true,
  hideOnSingleItem: false
};

/**
 * CSS class name prefixes
 */
export const CSS_CLASSES = {
  container: 'team-space-breadcrumb',
  list: 'breadcrumb-list',
  item: 'breadcrumb-item',
  link: 'breadcrumb-link',
  text: 'breadcrumb-text',
  separator: 'breadcrumb-separator',
  icon: 'breadcrumb-icon',
  label: 'breadcrumb-label',
  teamLogo: 'breadcrumb-team-logo',
  ellipsis: 'breadcrumb-ellipsis'
};

/**
 * ARIA labels and accessibility text
 */
export const ARIA_LABELS = {
  navigation: 'Breadcrumb navigation',
  currentPage: 'Current page',
  moreItems: 'More items',
  navigateTo: 'Navigate to'
};

/**
 * Animation duration and timing functions
 */
export const ANIMATIONS = {
  duration: '0.2s',
  timingFunction: 'ease',
  hoverTransform: 'translateY(-1px)'
};

/**
 * Responsive breakpoints for breadcrumb behavior
 */
export const BREAKPOINTS = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px'
};

/**
 * Maximum lengths for various content
 */
export const LIMITS = {
  maxLabelLength: 30,
  maxItemsBeforeCollapse: 5,
  maxMobileItems: 3
};

/**
 * Color variations for different themes
 */
export const COLORS = {
  light: {
    text: '#374151',
    muted: '#6b7280',
    active: '#2563eb',
    hover: '#3b82f6',
    background: '#f9fafb'
  },
  dark: {
    text: '#e2e8f0',
    muted: '#a0aec0',
    active: '#4a6cf7',
    hover: '#6366f1',
    background: '#1a202c'
  }
};