import React from 'react';

/**
 * Renders the soccer pitch markings (lines, circles, etc.)
 */
const PitchMarkings = () => (
  <div className="pitch-markings" style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  }}>
    <div className="center-line" style={{
      position: 'absolute',
      top: '50%',
      left: 0,
      width: '100%',
      height: '2px',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      transform: 'translateY(-50%)'
    }}></div>
    <div className="center-circle" style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '20%',
      height: '0',
      paddingBottom: '20%',
      border: '2px solid rgba(255, 255, 255, 0.7)',
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)'
    }}></div>
    
    {/* ...existing code for other markings... */}
    
    <div className="center-dot" style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '4px',
      height: '4px',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)'
    }}></div>
    
    <div className="penalty-area-top" style={{
      position: 'absolute',
      top: '10%',
      left: '15%',
      width: '70%',
      height: '20%',
      border: '2px solid rgba(255, 255, 255, 0.7)'
    }}></div>
    
    <div className="penalty-area-bottom" style={{
      position: 'absolute',
      bottom: '10%',
      left: '15%',
      width: '70%',
      height: '20%',
      border: '2px solid rgba(255, 255, 255, 0.7)'
    }}></div>
    
    {/* Field striping for visual effect */}
    {Array.from({ length: 5 }).map((_, i) => (
      <div 
        key={`stripe-${i}`}
        className="field-stripe"
        style={{ 
          position: 'absolute',
          left: 0,
          top: `${i * 20}%`,
          width: '100%',
          height: '10%',
          backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.03)'
        }}
      ></div>
    ))}
  </div>
);

export default PitchMarkings;
