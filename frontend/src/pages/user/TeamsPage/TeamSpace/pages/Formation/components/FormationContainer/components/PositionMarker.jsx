import React from 'react';

/**
 * Position marker component to show the preset position label on the pitch
 */
const PositionMarker = ({ x, y, label }) => {
  return (
    <div className="position-marker" style={{ left: `${x}px`, top: `${y - 5}px` }}>
      <div className="position-marker-label">{label}</div>
    </div>
  );
};

export default PositionMarker;
