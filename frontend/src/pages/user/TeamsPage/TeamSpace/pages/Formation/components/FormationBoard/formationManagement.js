import { PRESETS, DEFAULT_SUBS } from './constants';
import { generateDefaultStarters } from './playerManagement';

/**
 * Set dummy players for demo or initial state
 * @param {Function} get - Store's get function
 * @param {Function} set - Store's set function
 * @param {String} specificPreset - Optional specific preset to use
 */
export const setDummyPlayers = (get, set, specificPreset = null) => {
  // Use the provided specific preset, otherwise use current preset, or default to 4-3-3
  let actualPreset = specificPreset || get().preset || '4-3-3';
  
  // Check if preset is valid
  if (!PRESETS[actualPreset]) {
    console.warn(`Invalid preset: ${actualPreset}, falling back to 4-3-3`);
    actualPreset = '4-3-3';
  }
  
  console.log(`Creating dummy players with formation ${actualPreset}`);
  
  // Create dummy starters based on current formation with sequential naming
  const dummyStarters = generateDefaultStarters(actualPreset);
  
  set({ 
    preset: actualPreset,
    starters: dummyStarters,
    subs: DEFAULT_SUBS,
    saved: true
  });
};

/**
 * Change formation preset
 */
export const changePreset = (newPreset, get, set) => {
  if (!PRESETS[newPreset]) return;

  // Keep player assignments when changing formation
  const { starters } = get(); // Removed unused 'subs' variable
  
  // Create a map of player info (by position type where possible)
  const playerInfoMap = {};
  const playersByPosition = {};
  
  // First, collect all player information by position type
  starters.forEach(player => {
    if (player.playerId || player.playerName) {
      // Store player by position type (like CB, ST, GK) for better mapping
      const posType = player.label || 'UNKNOWN';
      
      if (!playersByPosition[posType]) {
        playersByPosition[posType] = [];
      }
      
      playersByPosition[posType].push({
        playerId: player.playerId,
        jerseyNumber: player.jerseyNumber,
        playerName: player.playerName
      });
      
      // Also store by ID as fallback
      playerInfoMap[player.id] = {
        playerId: player.playerId,
        jerseyNumber: player.jerseyNumber,
        playerName: player.playerName
      };
    }
  });

  // Apply the new preset positions
  const newStarters = PRESETS[newPreset].map((pos, index) => {
    let playerData = null;
    
    // First try to find a player with the same position type
    if (playersByPosition[pos.label] && playersByPosition[pos.label].length > 0) {
      playerData = playersByPosition[pos.label].shift();
    } 
    // If no exact position match, try to use existing position data when available
    else if (playerInfoMap[pos.id]) {
      playerData = playerInfoMap[pos.id];
      delete playerInfoMap[pos.id]; // Use it only once
    }
    // Otherwise, use the next available player of any type
    else {
      // Look for players in any remaining position
      for (const position in playersByPosition) {
        if (playersByPosition[position].length > 0) {
          playerData = playersByPosition[position].shift();
          break;
        }
      }
    }
    
    // If no player data found, use placeholder
    if (!playerData) {
      return {
        ...pos,
        position: pos.label,
        jerseyNumber: String(index + 1),
        playerName: `Player ${index + 1}`,
        playerId: null,
        positionId: pos.id
      };
    }
    
    // Return complete player with new position data
    return {
      ...pos,
      playerId: playerData.playerId || null,
      position: pos.label,
      jerseyNumber: playerData.jerseyNumber || String(index + 1),
      playerName: playerData.playerName || `Player ${index + 1}`,
      positionId: pos.id
    };
  });
  
  set({ 
    preset: newPreset, 
    starters: newStarters,
    saved: false 
  });
  
  // Save the updated formation to persist the changes
  get().saveFormation();
};
