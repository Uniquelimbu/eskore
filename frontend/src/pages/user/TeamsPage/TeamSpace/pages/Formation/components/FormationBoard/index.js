// Main entry point for the formation store system
import store from './store';

// Re-export the store as default
export default store;

// Allow specific imports of constants and utilities if needed
export { PRESETS, DEFAULT_SUBS } from './constants';
export * from './utils';
