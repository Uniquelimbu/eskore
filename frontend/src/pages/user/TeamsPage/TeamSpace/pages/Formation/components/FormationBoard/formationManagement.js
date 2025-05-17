import { PRESETS, DEFAULT_SUBS } from './constants';
import { generateDefaultStarters } from './playerManagement';

/**
 * Set dummy players for demo or initial state
 */
export const setDummyPlayers = (get, set) => {
  const { preset } = get();
  
  // Create dummy starters based on current formation with sequential naming
  const dummyStarters = generateDefaultStarters(preset || '4-3-3');
  
  set({ 
    preset: preset || '4-3-3',
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
  const currentPlayerMap = {};
  
  starters.forEach(player => {
    if (player.playerId || player.playerName) {
      currentPlayerMap[player.id] = {
        playerId: player.playerId,
        jerseyNumber: player.jerseyNumber,
        playerName: player.playerName
      };
    }
  });
  
  // Apply the new preset positions
  const newStarters = PRESETS[newPreset].map((pos, index) => {
    // Preserve player data if this position existed in the old formation
    const playerData = currentPlayerMap[pos.id] || {};
    
    return {
      ...pos,
      ...playerData,
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
  
  // Save the updated formation
  get().saveFormation();
};
