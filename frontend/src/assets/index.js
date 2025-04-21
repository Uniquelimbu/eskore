/**
 * Export all assets from a central location
 */

// Direct imports for required images - no fallbacks needed since we know files exist
export const eskore_logo = require('./images/logos/eskore-logo.png');
export const eskore_mockup = require('./images/mockups/eskore-mockup.png');
export const app_store_logo = require('./images/logos/app-store-logo.png');
export const google_play_logo = require('./images/logos/google-play-logo.png');

// Export all as a default object for convenience
export default {
  eskore_logo,
  eskore_mockup,
  app_store_logo,
  google_play_logo
};
