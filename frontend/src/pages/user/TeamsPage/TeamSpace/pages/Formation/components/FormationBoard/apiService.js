import apiClient from '../../../../../../../../services/apiClient';
import { DEFAULT_SUBS } from './constants';
import { generateDefaultStarters } from './playerManagement';

/**
 * Initialize formation with team ID and load data
 */
export const initFormation = async (teamId, get, set) => {
  if (!teamId) {
    console.warn('Formation init called without teamId, using default preset');
    get().setDummyPlayers();
    set({ loading: false });
    return;
  }
  
  set({ teamId, loading: true });
  try {
    // Try to load existing formation from API
    console.log(`Attempting to fetch formation for team ${teamId}`);
    let response;
    try {
      response = await apiClient.get(`/api/formations/${teamId}`);
      console.log(`Formation API response received for team ${teamId}:`, 
        response.status === 200 ? 'Success' : `Unexpected status: ${response.status}`);
    } catch (error) {
      // If 404, the formation doesn't exist yet - we'll create one
      if (error.response && error.response.status === 404) {
        console.log('Formation API endpoint not found (404), creating default formation');
        // Create a default formation in the backend
        const defaultCreated = await get().createDefaultFormation(teamId);
        
        if (defaultCreated) {
          // Try to fetch again after creating
          try {
            response = await apiClient.get(`/api/formations/${teamId}`);
            console.log(`Retrieved newly created formation for team ${teamId}`);
          } catch (secondFetchError) {
            console.error('Failed to fetch newly created formation:', secondFetchError);
            // Fall back to dummy players
            get().setDummyPlayers();
            set({ loading: false, saved: true });
            return;
          }
        } else {
          // Fall back to dummy players if creation failed
          get().setDummyPlayers();
          set({ loading: false, saved: true });
          return;
        }
      } else {
        // Log detailed error information
        console.error('Error fetching formation:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        } else if (error.request) {
          console.error('Request made but no response received');
        } else {
          console.error('Error message:', error.message);
        }
        // Fall back to dummy players on error
        get().setDummyPlayers();
        set({ loading: false, saved: true });
        return;
      }
    }
    
    if (response && response.data && response.data.schema_json) {
      const { preset, starters, subs } = response.data.schema_json;
      
      // Check if starters and subs exist and have content, otherwise use default data
      const hasValidStarters = starters && Array.isArray(starters) && starters.length > 0;
      const hasValidSubs = subs && Array.isArray(subs) && subs.length > 0;
      
      if (hasValidStarters || hasValidSubs) {
        // Ensure we don't exceed 11 starters (handle historic bugs)
        const validStarters = hasValidStarters ? starters.slice(0, 11) : [];
        
        set({ 
          preset: preset || '4-3-3',
          starters: validStarters,
          subs: hasValidSubs ? subs : DEFAULT_SUBS,
          loading: false,
          saved: true
        });
        return;
      }
    }
    
    // If no valid data exists, initialize with dummy players
    console.log('No valid formation data found, using dummy players');
    get().setDummyPlayers();
    // And also create a default formation in the backend
    await get().createDefaultFormation(teamId);
    set({ loading: false, saved: true });
  } catch (error) {
    console.error('Failed to load formation:', error);
    // Initialize with dummy players on error
    console.log('Error loading formation, using dummy players instead');
    get().setDummyPlayers();
    set({ loading: false });
  }
};

/**
 * Create default formation in the backend
 */
export const createDefaultFormation = async (teamId, get, set) => {
  try {
    set({ loading: true });
    console.log('Creating default formation for team', teamId);
    
    // First try to GET the formation - the backend will return a default if it doesn't exist
    const response = await apiClient.get(`/api/formations/${teamId}`);
    
    // Check if we got a formation that's not saved (marked by the backend)
    if (response && response.notSaved) {
      console.log('Received default formation template from server');
      const defaultFormation = response.schema_json || {};
      
      // Ensure starters and subs are always arrays
      const starters = Array.isArray(defaultFormation.starters) ? defaultFormation.starters : [];
      const subsArray = Array.isArray(defaultFormation.subs) ? defaultFormation.subs : DEFAULT_SUBS;
      
      // Update the local state with the default formation
      set({ 
        teamId,
        starters: starters,
        subs: subsArray,
        preset: defaultFormation.preset || '4-3-3',
        loading: false,
        saved: false
      });
      
      return response;
    }
    
    // Otherwise, we got a real formation from the database
    if (response) {
      console.log('Successfully created/fetched default formation');
      const schemaJson = response.schema_json || {};
      
      // Ensure starters and subs are always arrays
      const starters = Array.isArray(schemaJson.starters) ? schemaJson.starters : [];
      const subs = Array.isArray(schemaJson.subs) ? schemaJson.subs : DEFAULT_SUBS;
      
      set({
        teamId,
        starters: starters,
        subs: subs,
        preset: schemaJson.preset || '4-3-3',
        loading: false,
        saved: true
      });
      return response;
    }
  } catch (error) {
    console.error('Failed to create default formation:', error);
    // If we get Forbidden, still create a client-side default
    if (error.status === 403 || (error.response && error.response.status === 403)) {
      console.log('Server responded with error:', error.status || error.response?.status, error.data || error.response?.data);
      
      // If forbidden, use local defaults
      const preset = '4-3-3';
      const defaultData = generateDefaultStarters(preset);
      
      // Ensure defaultData is an array
      const starters = Array.isArray(defaultData) ? defaultData : [];
      
      set({
        teamId,
        starters: starters,
        subs: DEFAULT_SUBS,
        preset: preset,
        loading: false,
        saved: false
      });
      
      return { 
        teamId, 
        schema_json: { 
          starters: starters, 
          subs: DEFAULT_SUBS, 
          preset: preset 
        }, 
        isDefault: true, 
        clientGenerated: true 
      };
    }
    
    // Ensure we set valid defaults even on error
    set({ 
      loading: false,
      starters: [],
      subs: DEFAULT_SUBS
    });
    
    throw error;
  }
};

// Debounce timer for save operations
let saveTimer = null;

/**
 * Save formation to server
 */
export const saveFormation = async (get, set) => {
  const { teamId, starters, subs, preset } = get();
  
  if (!teamId) {
    console.error('Cannot save formation: teamId is missing');
    return { error: 'Missing teamId', success: false };
  }
  
  // Clear any existing save timer
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  
  // Set saving state
  set({ saved: false, loading: true });
  
  // Debounce the save operation to avoid too many API calls
  return new Promise((resolve) => {
    saveTimer = setTimeout(async () => {
      try {
        const schemaJson = {
          preset,
          starters,
          subs,
          updated_at: new Date().toISOString()
        };
        
        console.log('Saving formation for team:', teamId);
        
        // Use apiClient for consistent error handling across the app
        const response = await apiClient.put(`/api/formations/${teamId}`, { 
          schema_json: schemaJson 
        });
        
        console.log('Formation saved successfully:', response);
        set({ saved: true, loading: false });
        resolve({ success: true });
      } catch (error) {
        console.error('Failed to save formation:', error);
        
        // Enhanced error logging for debugging
        let errorMessage = 'Unknown error saving formation';
        
        if (error.response) {
          errorMessage = `Server responded with status ${error.response.status}: ${JSON.stringify(error.response.data)}`;
        } else if (error.request) {
          errorMessage = 'No response received from server. Check if backend is running.';
        } else {
          errorMessage = `Error setting up request: ${error.message}`;
        }
        
        console.error(errorMessage);
        
        // Continue with local state rather than failing completely
        set({ loading: false, saved: false });
        
        // Return the error so it can be handled by the calling component 
        resolve({ 
          error: errorMessage, 
          originalError: error,
          success: false
        });
      }
    }, 500); // 500ms debounce delay
  });
};
