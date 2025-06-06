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
  performSaveFormationAPI // Import the renamed function
} from './apiService';
import { exportAsPNG } from './exportService';
import { setDummyPlayers, changePreset } from './formationManagement';

// Helper function (can be in apiService.js or utils.js if preferred)
const saveFormationToLocalStorage = (teamId, formationData) => {
  if (!teamId || !formationData) return;
  try {
    const key = `formation_backup_${teamId}`; // Consistent key
    const dataToSave = {
      ...formationData,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(dataToSave));
    console.log(`Formation backup saved to localStorage for team ${teamId}`);
  } catch (error) {
    console.warn('Failed to save formation backup to localStorage:', error);
  }
};

// Create the store
const useFormationStore = create((set, get) => ({
  // State
  teamId: null,
  starters: [], // Array of {id, label, xNorm, yNorm, playerId, jerseyNumber, playerName}
  subs: [], // Array of {id, label, playerId, jerseyNumber, playerName}
  preset: '4-3-3',
  loading: false,
  saved: true,
  saveError: null, // Track save errors
  lastSaveAttempt: null, // Track when we last tried to save
  pendingChanges: false, // Track if there are pending changes to save
  
  // Export constants for direct access in components
  PRESETS,
  
  // Initialize store with team ID and load data
  // Modified to accept preferredPreset parameter
  init: async (teamId, preferredPreset) => await initFormation(teamId, preferredPreset, get, set),
  
  // Create default formation in the backend
  createDefaultFormation: async (teamId) => await createDefaultFormation(teamId, get, set),
  
  // Generate default starters based on a preset
  generateDefaultStarters,
  
  // Add dummy player data for demo purposes
  // Modified to accept a specific preset
  setDummyPlayers: (specificPreset = null) => setDummyPlayers(get, set, specificPreset),
  
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
  
  // Save formation to server (this action will now call forceSave)
  saveFormation: async () => {
    console.log("Formation store: saveFormation action called, deferring to forceSave.");
    return get().forceSave();
  },
  
  // Export formation as PNG
  exportAsPNG: async (element) => await exportAsPNG(element, get),
  
  // Add a new forceSave method to explicitly trigger a save
  forceSave: async () => {
    const { teamId, starters, subs, preset, loading: isLoading, lastSaveAttempt } = get();

    // Prevent concurrent saves
    if (isLoading) {
      console.log('Formation store: Save already in progress, skipping new forceSave call.');
      return { success: false, error: "Save already in progress" };
    }

    // Prevent too frequent saves (debounce)
    const now = Date.now();
    if (lastSaveAttempt && (now - lastSaveAttempt) < 1000) {
      console.log('Formation store: Recent save attempt detected, debouncing...');
      return { success: false, error: "Too frequent save attempts" };
    }

    if (!teamId) {
      console.error('Formation store: Cannot forceSave, teamId is missing.');
      const error = "Missing teamId - cannot save formation";
      set({ saveError: error, pendingChanges: true });
      return { success: false, error };
    }
    
    console.log('Formation store: Forcing immediate save');
    set({ 
      saved: false, 
      loading: true, 
      saveError: null, 
      pendingChanges: true,
      lastSaveAttempt: now
    });
    
    const formationData = {
      preset,
      starters: JSON.parse(JSON.stringify(starters)),
      subs: JSON.parse(JSON.stringify(subs)),
      updated_at: new Date().toISOString()
    };
    
    // Save to localStorage as backup immediately
    saveFormationToLocalStorage(teamId, formationData);
    
    try {
      // Call the API service function that only performs the API call
      const result = await performSaveFormationAPI(teamId, formationData);
      
      if (result && result.success) {
        console.log('Formation store: Force save successful');
        set({ 
          saved: true, 
          loading: false, 
          saveError: null, 
          pendingChanges: false 
        });
        return { success: true };
      } else {
        const errorMsg = result.error || 'Save failed via API';
        console.error('Formation store: Force save failed via API:', errorMsg);
        
        // Set error state but keep pendingChanges true so user knows there are unsaved changes
        set({ 
          loading: false, 
          saveError: errorMsg, 
          pendingChanges: true,
          saved: false 
        });
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = error.message || 'Unknown save error';
      console.error('Formation store: Force save exception:', error);
      set({ 
        loading: false, 
        saveError: errorMsg, 
        pendingChanges: true,
        saved: false 
      });
      return { error: errorMsg, success: false };
    }
  },

  // Enhanced save method with retry logic
  saveWithRetry: async (maxRetries = 3) => {
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Formation store: Save attempt ${attempt}/${maxRetries}`);
      
      const result = await get().forceSave();
      
      if (result.success) {
        console.log(`Formation store: Save succeeded on attempt ${attempt}`);
        return result;
      }
      
      lastError = result.error;
      
      // Don't retry on authentication errors
      if (result.error && (
        result.error.includes('401') || 
        result.error.includes('403') || 
        result.error.includes('Unauthorized') || 
        result.error.includes('Forbidden')
      )) {
        console.log('Formation store: Authentication error detected, not retrying');
        break;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Formation store: Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.error(`Formation store: All save attempts failed. Last error: ${lastError}`);
    return { success: false, error: lastError };
  },

  // Clear any save errors
  clearSaveError: () => {
    set({ saveError: null });
  },
  
  // Action to move a player to a specific position
  movePlayerToPosition: (draggedPlayerId, targetPositionId, wasStarter, originalPosId, originalSubIdx) => {
    console.log('Formation store: Moving player to position', { 
      draggedPlayerId, targetPositionId, wasStarter 
    });
    
    // Apply the state change directly
    set(state => {
      const newState = movePlayerToPosition(draggedPlayerId, targetPositionId, wasStarter, originalPosId, originalSubIdx)(state);
      return { ...newState, saved: false, pendingChanges: true, saveError: null };
    });
    
    // Use enhanced save with retry logic
    setTimeout(() => {
      get().saveWithRetry().catch(err => {
        console.error("Formation store: Failed to save after movePlayerToPosition:", err);
      });
    }, 100); // Small delay to ensure state is updated
  },
  
  // Action to move a player to a specific sub slot
  movePlayerToSubSlot: (draggedPlayerId, targetSubIndex, wasStarter, originalPosId, originalSubIdx) => {
    console.log('Formation store: Moving player to sub slot', { 
      draggedPlayerId, targetSubIndex, wasStarter 
    });
    
    set(state => {
      const newState = movePlayerToSubSlot(draggedPlayerId, targetSubIndex, wasStarter, originalPosId, originalSubIdx)(state);
      return { ...newState, saved: false, pendingChanges: true, saveError: null };
    });
    
    // Use enhanced save with retry logic
    setTimeout(() => {
      get().saveWithRetry().catch(err => {
        console.error("Formation store: Failed to save after movePlayerToSubSlot:", err);
      });
    }, 100);
  },
  
  // Action for when a starter is dropped onto the general subs strip area
  moveStarterToSubsGeneral: (draggedPlayerId, originalPositionId) => {
    console.log('Formation store: Moving starter to subs general', { 
      draggedPlayerId, originalPositionId 
    });
    
    set(state => {
      const newState = moveStarterToSubsGeneral(draggedPlayerId, originalPositionId)(state);
      return { ...newState, saved: false, pendingChanges: true, saveError: null };
    });
    
    // Use enhanced save with retry logic
    setTimeout(() => {
      get().saveWithRetry().catch(err => {
        console.error("Formation store: Failed to save after moveStarterToSubsGeneral:", err);
      });
    }, 100);
  },
  
  // Action to swap two players
  swapPlayersInFormation: (player1Id, player2Id) => {
    console.log('Formation store: Swapping players', { player1Id, player2Id });
    
    set(state => {
      const newState = swapPlayersInFormation(player1Id, player2Id)(state);
      return { ...newState, saved: false, pendingChanges: true, saveError: null };
    });
    
    // Use enhanced save with retry logic
    setTimeout(() => {
      get().saveWithRetry().catch(err => {
        console.error("Formation store: Failed to save after swapPlayersInFormation:", err);
      });
    }, 100);
  }
}));

export default useFormationStore;
