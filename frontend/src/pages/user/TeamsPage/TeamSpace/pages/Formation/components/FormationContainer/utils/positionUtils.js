/**
 * Convert normalized coordinates (0-100) to pixel coordinates
 */
export const normalizedToPixel = (xNorm, yNorm, dimensions, posLabel, isMarker = false) => {
  // Add some padding to ensure players aren't too close to the edges
  const horizontalPadding = dimensions.width * 0.08; // 8% padding from edges
  const verticalPadding = dimensions.height * 0.08; // 8% padding from edges
  
  // Calculate available space after applying padding
  const availableWidth = dimensions.width - (horizontalPadding * 2);
  const availableHeight = dimensions.height - (verticalPadding * 2);
  
  // Special adjustment for goalkeeper position to place them closer to goal line
  let adjustedYNorm = yNorm;
  let adjustedXNorm = xNorm;
  
  if (posLabel === 'GK') {
    // Place goalkeeper much closer to goal line
    adjustedYNorm = Math.min(95, yNorm * 1.05); // Multiplier keeps GK near bottom
    
    // Constrain to prevent overflow
    if (adjustedYNorm > 95) adjustedYNorm = 95;
  }
  
  // For wide positions, utilize more of the width
  if (posLabel && ['LB', 'LWB', 'LM', 'LW'].includes(posLabel)) {
    // Push left-side players wider
    adjustedXNorm = Math.max(5, xNorm * 0.95);
  } else if (posLabel && ['RB', 'RWB', 'RM', 'RW'].includes(posLabel)) {
    // Push right-side players wider
    adjustedXNorm = Math.min(95, xNorm * 1.05);
  }
  
  // Position markers need a vertical offset to be below player chips
  const markerOffset = isMarker ? 25 : 0; // Only apply to markers, not player chips
  
  // Map coordinates to the available space, then add the padding offset
  return {
    x: (adjustedXNorm / 100 * availableWidth) + horizontalPadding,
    y: (adjustedYNorm / 100 * availableHeight) + verticalPadding + markerOffset,
    adjustedXNorm,
    adjustedYNorm
  };
};

/**
 * Check if a player is currently being swapped
 */
export const isPlayerSwapping = (playerId, swappingPlayers) => {
  return Array.isArray(swappingPlayers) && swappingPlayers.includes(playerId);
};

/**
 * Create placeholders for empty positions in the current formation
 * Ensure we only have exactly 11 positions (standard soccer formation)
 */
export const createPositionPlaceholders = (PRESETS, preset, starters, dimensions, isManager) => {
  if (!preset || !PRESETS[preset]) return [];
  
  const currentPreset = PRESETS[preset];
  
  // Ensure we have exactly 11 positions in the preset
  const validPositions = currentPreset.slice(0, 11);
  
  // Create a map of positions already filled by starters
  const usedPositionIds = new Set(starters.map(s => s.positionId));
  
  // Ensure we only create placeholders for unfilled positions
  return validPositions
    .filter(pos => !usedPositionIds.has(pos.id))
    .map(pos => {
      const pixelPos = normalizedToPixel(pos.xNorm, pos.yNorm, dimensions, pos.label);
      return {
        key: `placeholder-${pos.id}`,
        id: `placeholder-${pos.id}`,
        x: pixelPos.x,
        y: pixelPos.y,
        label: pos.label,
        positionId: pos.id,
        isManager,
        isGoalkeeper: pos.label === 'GK', // Add flag to identify goalkeeper position
        isPlaceholder: true // Important: mark as placeholder
      };
    });
};

/**
 * Render position markers for the preset formation
 */
export const createPositionMarkers = (PRESETS, preset, dimensions) => {
  if (!PRESETS || !preset || !PRESETS[preset]) {
    return null;
  }
  
  // Ensure we only create markers for exactly 11 positions
  const validPositions = PRESETS[preset].slice(0, 11);
  
  return validPositions.map(pos => {
    // Pass isMarker=true to apply the position marker offset
    const pixelPos = normalizedToPixel(pos.xNorm, pos.yNorm, dimensions, pos.label, true);
    return {
      key: `marker-${pos.id}`,
      x: pixelPos.x,
      y: pixelPos.y, // The offset is now handled inside normalizedToPixel
      label: pos.label
    };
  });
};

/**
 * Check if position is goalkeeper
 */
export const isGoalkeeper = (posLabel) => {
  return posLabel === 'GK';
};
