import React from 'react';
import './LazyImage.css';

/**
 * LazyImage component for loading images with placeholder
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Image alt text
 * @param {Object} props.style - Additional styles
 * @param {string} props.className - Additional CSS classes
 */
const LazyImage = ({ src, alt, style, className, ...rest }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setError(true);
  };

  return (
    <div className={`lazy-image-container ${className || ''}`} style={style}>
      {!loaded && !error && (
        <div className="lazy-image-placeholder">
          <div className="lazy-image-spinner"></div>
        </div>
      )}
      
      {error ? (
        <div className="lazy-image-error">
          <span>Image not available</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt || 'Image'}
          className={`lazy-image ${loaded ? 'lazy-image-loaded' : ''}`}
          onLoad={handleLoad}
          onError={handleError}
          {...rest}
        />
      )}
    </div>
  );
};

export default LazyImage;
