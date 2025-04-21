/**
 * Central API module that re-exports all API clients
 */

// Export the base API client
export { default as api } from './client';

// Export the mock client for testing
export { mockApi } from './mockClient';

// Re-export all registered APIs
export * from './registry';

// Export as default from registry
export { default } from './registry';