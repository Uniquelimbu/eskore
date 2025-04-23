import { useState, useEffect } from 'react';

/**
 * Custom hook for handling media queries in components
 * @param {string} query - CSS media query string
 * @returns {boolean} - Whether the media query matches
 */
const useMediaQuery = (query) => {
  // Initialize with null and update after mount to prevent hydration issues
  const [matches, setMatches] = useState(null);
  
  useEffect(() => {
    // Set initial value after mount
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    // Update matches when media query changes
    const listener = (e) => setMatches(e.matches);
    
    // Add listener with compatibility
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Legacy support
      media.addListener(listener);
    }
    
    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        // Legacy support
        media.removeListener(listener);
      }
    };
  }, [query]);
  
  return matches;
};

export default useMediaQuery;
