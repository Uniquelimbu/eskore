import { create } from 'zustand';
import { PRESETS } from './constants'; // Removed unused DEFAULT_SUBS import
import { 
  generateDefaultStarters, 
  mapPlayersToPositions, 
  assignPlayersToFormation 
} from './playerManagement';
import { 
  handleDrag, 
  movePlayerToPosition, 
  movePlayerToSubSlot, 
  moveStarterToSubsGeneral, 
  swapPlayersInFormation, 
  swapPlayers 
} from './dragAndDrop';
import { 
  initFormation, 
  createDefaultFormation, 
  saveFormation 
} from './apiService';
import { exportAsPNG } from './exportService';
import { setDummyPlayers, changePreset } from './formationManagement';

// Create the store
const useFormationStore = create((set, get) => ({
  // State
  teamId: null,
  starters: [], // Array of {id, label, xNorm, yNorm, playerId, jerseyNumber, playerName}
  subs: [], // Array of {id, label, playerId, jerseyNumber, playerName}
  preset: '4-3-3',
  loading: false,
  saved: true,
  
  // Export constants for direct access in components
  PRESETS,
  
  // Initialize store with team ID and load data
  init: async (teamId) => await initFormation(teamId, get, set),
  
  // Create default formation in the backend
  createDefaultFormation: async (teamId) => await createDefaultFormation(teamId, get, set),
  
  // Generate default starters based on a preset
  generateDefaultStarters,
  
  // Add dummy player data for demo purposes
  setDummyPlayers: () => setDummyPlayers(get, set),
  
  // Change formation preset
  changePreset: (newPreset) => changePreset(newPreset, get, set),
  
  // Map real players to positions
  mapPlayersToPositions: (players) => mapPlayersToPositions(players, get, set),
  
  // Assign players to formation intelligently
  assignPlayersToFormation: (players, presetName) => assignPlayersToFormation(players, presetName, get, set),
  
  // Handle different drag scenarios
  handleDrag: (id, newX, newY, targetType) => handleDrag(id, newX, newY, targetType, get, set),
  
  // Swap two players
  swapPlayers: (id1, id2, bothStarters) => swapPlayers(id1, id2, bothStarters, get, set),
  
  // Save formation to server
  saveFormation: async () => await saveFormation(get, set),
  
  // Export formation as PNG
  exportAsPNG: async (element) => await exportAsPNG(element, get),
  
  // Action to move a player to a specific position
  movePlayerToPosition: (draggedPlayerId, targetPositionId, wasStarter, originalPosId, originalSubIdx) => 
    set(movePlayerToPosition(draggedPlayerId, targetPositionId, wasStarter, originalPosId, originalSubIdx)),
  
  // Action to move a player to a specific sub slot
  movePlayerToSubSlot: (draggedPlayerId, targetSubIndex, wasStarter, originalPosId, originalSubIdx) => 
    set(movePlayerToSubSlot(draggedPlayerId, targetSubIndex, wasStarter, originalPosId, originalSubIdx)),
  
  // Action for when a starter is dropped onto the general subs strip area
  moveStarterToSubsGeneral: (draggedPlayerId, originalPositionId) => 
    set(moveStarterToSubsGeneral(draggedPlayerId, originalPositionId)),
  
  // Action to swap two players
  swapPlayersInFormation: (player1Id, player2Id) => 
    set(swapPlayersInFormation(player1Id, player2Id))
}));

export default useFormationStore;
