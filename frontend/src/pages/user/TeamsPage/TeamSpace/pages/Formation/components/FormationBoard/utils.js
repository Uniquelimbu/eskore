// Helper functions for the formation store

/**
 * Finds a player and their location in either starters or subs arrays
 */
export const findPlayerAndLocation = (playerId, starters, subs) => {
  const starterIndex = starters.findIndex(p => p.id === playerId);
  if (starterIndex !== -1) {
    return { 
      player: starters[starterIndex], 
      list: starters, 
      index: starterIndex, 
      isStarter: true 
    };
  }
  
  const subIndex = subs.findIndex(p => p.id === playerId);
  if (subIndex !== -1) {
    return { 
      player: subs[subIndex], 
      list: subs, 
      index: subIndex, 
      isStarter: false 
    };
  }
  
  return null;
};

/**
 * Fisher-Yates array shuffle algorithm
 */
export const shuffle = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
