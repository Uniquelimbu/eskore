/**
 * Convert normalized coordinates (0-100) to actual pixel coordinates
 */
export const normalizedToPixel = (x, y, dimensions) => {
  return {
    x: (x / 100) * dimensions.width,
    y: (y / 100) * dimensions.height
  };
};

/**
 * Check if a player is currently being swapped
 */
export const isPlayerSwapping = (playerId, swappingPlayers) => {
  return swappingPlayers.includes(playerId);
};

/**
 * Create placeholders for empty positions in the current formation
 */
export const createPositionPlaceholders = (PRESETS, preset, starters, dimensions, isManager) => {
  if (!PRESETS || !preset || !PRESETS[preset]) {
    console.error("Missing PRESETS or preset data", { preset, PRESETS });
    return null;
  }
  
  // Add defensive check to ensure starters is an array
  const startersArray = Array.isArray(starters) ? starters : [];
  
  // Find positions that don't have a player
  const filledPositions = startersArray.map(player => player.id);
  
  return PRESETS[preset]
    .filter(pos => !filledPositions.includes(pos.id))
    .map(pos => {
      const pixelPos = normalizedToPixel(pos.xNorm, pos.yNorm, dimensions);
      return {
        key: `placeholder-${pos.id}`,
        x: pixelPos.x,
        y: pixelPos.y - 15, // Move placeholder UP by 15px 
        label: pos.label,
        positionId: pos.id,
        isManager // Pass isManager for canDrop
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
  
  return PRESETS[preset].map(pos => {
    const pixelPos = normalizedToPixel(pos.xNorm, pos.yNorm, dimensions);
    return {
      key: `marker-${pos.id}`,
      x: pixelPos.x,
      y: pixelPos.y + 45, // Keep label 45px DOWN (below where player chips will be)
      label: pos.label
    };
  });
};
