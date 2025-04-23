import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for using Intersection Observer
 * @param {Object} options - Intersection Observer options
 * @param {number} options.threshold - Visibility threshold (0-1)
 * @param {string} options.rootMargin - Margin around root element
 * @returns {Array} - [ref, isIntersecting, entry]
 */
const useIntersectionObserver = ({
  threshold = 0,
  rootMargin = '0px',
  root = null
} = {}) => {
  const [entry, setEntry] = useState(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof IntersectionObserver !== 'function') return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, rootMargin, root }
    );
    
    observer.observe(element);
    
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, root]);
  
  return [elementRef, isIntersecting, entry];
};

export default useIntersectionObserver;
