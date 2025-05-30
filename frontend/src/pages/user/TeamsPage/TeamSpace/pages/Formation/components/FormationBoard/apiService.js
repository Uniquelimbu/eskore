import apiClient from '../../../../../../../../services/apiClient';
import { DEFAULT_SUBS } from './constants';
import { generateDefaultStarters } from './playerManagement';

// Local storage key for formation backup
const getFormationStorageKey = (teamId) => `formation_backup_${teamId}`;

/**
 * Load formation from local storage backup
 */
const loadFormationFromLocalStorage = (teamId) => {
  if (!teamId) return null;
  
  try {
    const key = getFormationStorageKey(teamId);
    const storedData = localStorage.getItem(key);
    
    if (!storedData) return null;
    
    const parsedData = JSON.parse(storedData);
    console.log(`Found formation backup in localStorage for team ${teamId}, saved at ${parsedData.savedAt}`);
    return parsedData;
  } catch (error) {
    console.warn('Failed to load formation backup from localStorage:', error);
    return null;
  }
};

/**
 * Initialize formation with team ID and load data
 * @param {number} teamId - The team ID
 * @param {string} preferredPreset - Optional preferred formation preset from manager
 * @param {Function} get - Store's get method
 * @param {Function} set - Store's set method
 */
export const initFormation = async (teamId, preferredPreset, get, set) => {
  if (!teamId) {
    console.warn('Formation init called without teamId, using default preset');
    get().setDummyPlayers(preferredPreset);
    set({ loading: false });
    return;
  }
  
  set({ teamId, loading: true });
  
  // Get current preset (potentially set by manager preference before this is called)
  const currentPreset = preferredPreset || get().preset || '4-3-3';
  console.log(`Formation initFormation: using currentPreset ${currentPreset}`, 
    preferredPreset ? '(from manager preference)' : '(from default)');
  
  // First, try to load from server
  let serverFormation = null;
  let serverLoadFailed = false;
  
  try {
    console.log(`Attempting to fetch formation for team ${teamId} from server`);
    const response = await apiClient.get(`/formations/${teamId}`);
    console.log(`Formation API response received:`, response);
    
    // Enhanced response validation
    if (response) {
      // Extract data correctly depending on response structure
      const formationData = response.data || response;
      
      // Check if schema_json exists and extract it properly
      if (formationData) {
        // Handle different schema_json formats - could be direct or nested
        let schemaJson = null;
        
        if (typeof formationData.schema_json === 'object' && formationData.schema_json !== null) {
          // Direct schema_json object
          schemaJson = formationData.schema_json;
        } else if (typeof formationData.schema_json === 'string') {
          // JSON string that needs parsing
          try {
            schemaJson = JSON.parse(formationData.schema_json);
          } catch (e) {
            console.error('Failed to parse schema_json string:', e);
          }
        }
        
        console.log('Extracted schema_json:', schemaJson);
        
        if (schemaJson) {
          serverFormation = schemaJson;
        }
      }
    }
  } catch (error) {
    console.error('Error fetching formation from server:', error);
    serverLoadFailed = true;
  }
  
  // Try to load backup from localStorage if server load failed or returned invalid data
  const localBackup = loadFormationFromLocalStorage(teamId);
  
  // Check if server formation has valid starters and subs
  const hasValidServerData = serverFormation && 
    Array.isArray(serverFormation.starters) && 
    serverFormation.starters.length > 0 &&
    Array.isArray(serverFormation.subs);
  
  // Check if local backup has valid starters and subs
  const hasValidLocalData = localBackup && 
    Array.isArray(localBackup.starters) && 
    localBackup.starters.length > 0 &&
    Array.isArray(localBackup.subs);
  
  console.log('Formation data validation:', {
    hasValidServerData,
    hasValidLocalData,
    serverFormation: serverFormation ? 'present' : 'missing',
    localBackup: localBackup ? 'present' : 'missing',
    currentPreset
  });
  
  // Decide which data source to use
  let dataToUse = null;
  let source = 'unknown';
  
  if (hasValidServerData) {
    dataToUse = serverFormation;
    source = 'server';
  } else if (hasValidLocalData) {
    dataToUse = localBackup;
    source = 'localStorage';
    console.log('Using localStorage backup as server data was invalid');
  }
  
  if (dataToUse) {
    console.log(`Setting formation data from ${source}`);
    
    // Ensure we don't exceed 11 starters
    const validStarters = dataToUse.starters.slice(0, 11);
    const validSubs = Array.isArray(dataToUse.subs) ? dataToUse.subs : DEFAULT_SUBS;
    
    // When using manager's preferred formation but data exists, we should ensure preset matches
    // If we have manager's preference, update the preset but keep player positions
    const finalPreset = preferredPreset || dataToUse?.preset || currentPreset;
    
    if (dataToUse) {
      console.log(`Setting formation data from ${source}`);
      
      // Ensure we don't exceed 11 starters
      const validStarters = dataToUse.starters.slice(0, 11);
      const validSubs = Array.isArray(dataToUse.subs) ? dataToUse.subs : DEFAULT_SUBS;
      
      // If preferred preset differs from stored one, remap player positions
      if (preferredPreset && preferredPreset !== dataToUse.preset) {
        console.log(`Formation preset changed from ${dataToUse.preset} to ${preferredPreset} - remapping positions`);
        
        // Call changePreset to remap players to new positions
        set({ 
          teamId,
          preset: dataToUse.preset, 
          starters: validStarters,
          subs: validSubs,
          loading: false,
          saved: true
        });
        
        // Use the changePreset function to properly remap players
        get().changePreset(finalPreset);
      } else {
        // Update state with the loaded formation without remapping
        set({ 
          teamId,
          preset: finalPreset,
          starters: validStarters,
          subs: validSubs,
          loading: false,
          saved: true
        });
      }
      
      // If we loaded from localStorage backup but server load failed,
      // or if we're using manager's preferred formation that differs from stored data,
      // trigger a save to sync back to server
      if ((source === 'localStorage' && serverLoadFailed) || 
          (preferredPreset && preferredPreset !== dataToUse.preset)) {
        console.log('Need to sync data back to server:', {
          reason: source === 'localStorage' ? 'Using localStorage backup' : 'Manager preference differs',
          preferredPreset,
          dataPreset: dataToUse.preset
        });
        setTimeout(() => {
          try {
            get().forceSave();
          } catch (e) {
            console.error('Failed to sync data to server:', e);
          }
        }, 1000);
      }
      
      return;
    }
    
    // If we reach here, no valid data was found anywhere
    console.log('No valid formation data found, using default with preset:', currentPreset);
    
    // Always use the currentPreset (which may have been set from manager preferences)
    set({ preset: currentPreset });
    get().setDummyPlayers(currentPreset); // Use the correct preset for dummy players
    
    // Create a proper formation in the backend for future requests
    try {
      console.log(`Attempting to save formation with preset: ${currentPreset} after loading dummy players`);
      // Ensure forceSave is awaited if it's async and we care about its completion before proceeding
      await get().forceSave();
      console.log('Force save after dummy players completed.');
    } catch (saveError) {
      console.error('Failed to save formation after loading dummy players:', saveError);
    }
    
    set({ loading: false, saved: true });
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
    const response = await apiClient.get(`/formations/${teamId}`);
    
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

/**
 * Perform the API call to save formation to server.
 * This function does NOT interact with the Zustand store's set method directly.
 */
export const performSaveFormationAPI = async (teamId, formationData) => {
  if (!teamId) {
    console.error('performSaveFormationAPI: Cannot save formation: teamId is missing');
    return { error: 'Missing teamId', success: false };
  }
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('performSaveFormationAPI: Cannot save formation: No authentication token found');
    return { error: 'Missing authentication token', success: false };
  }
  
  try {
    console.log('performSaveFormationAPI: Sending data to server for team:', teamId);
    console.log('performSaveFormationAPI payload:', formationData);
    
    const response = await apiClient.put(`/formations/${teamId}`, { 
      schema_json: formationData 
    });
    
    console.log('performSaveFormationAPI: Server response:', response);
    
    if (!response) {
      throw new Error('Empty response from server');
    }
    
    const isSuccess = response.success !== false;
    
    if (isSuccess) {
      console.log('performSaveFormationAPI: Save completed successfully');
      try {
        const verifyResponse = await apiClient.get(`/formations/${teamId}`);
        console.log('performSaveFormationAPI: Verification response:', verifyResponse);
        const savedData = verifyResponse.data?.schema_json || verifyResponse.schema_json;
        if (savedData) {
          console.log('performSaveFormationAPI: Data verified on server');
        }
      } catch (verifyError) {
        console.warn('performSaveFormationAPI: Verification failed but original save was successful:', verifyError);
      }
      return { success: true };
    } else {
      console.error('performSaveFormationAPI: Server indicated failure:', response);
      return { 
        error: response.message || 'Server indicated failure without details', 
        success: false 
      };
    }
  } catch (error) {
    console.error('performSaveFormationAPI: Failed to save formation:', error);
    
    let errorMessage = 'Unknown error saving formation';
    if (error.response) {
      errorMessage = `Server responded with status ${error.response.status}: ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      errorMessage = 'No response received from server. Check if backend is running.';
    } else {
      errorMessage = `Error setting up request: ${error.message}`;
    }
    console.error(`performSaveFormationAPI: ${errorMessage}`);
    return { 
      error: errorMessage, 
      originalError: error,
      success: false
    };
  }
};
