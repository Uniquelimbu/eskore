import { apiClient } from '../../../../../../../../services'; // Updated import path
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
    // Add cache-busting parameter to prevent browser caching
    const timestamp = new Date().getTime();
    const response = await apiClient.get(`/formations/${teamId}?_t=${timestamp}`);
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
  
  // Fix server data validation - check if starters exist and are valid
  const hasValidServerData = serverFormation && 
    Array.isArray(serverFormation.starters) && 
    (serverFormation.starters.length > 0 || serverFormation.preset) && // Accept if has preset even with empty starters
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
    currentPreset,
    serverStartersLength: serverFormation?.starters?.length || 0,
    serverPreset: serverFormation?.preset || 'none'
  });
  
  // Decide which data source to use - prioritize server data if it's valid
  let dataToUse = null;
  let source = 'unknown';
  
  if (hasValidServerData && hasValidLocalData) {
    // Compare timestamps to determine which is newer, but prefer server if timestamps are close
    const serverTimestamp = serverFormation.updated_at || serverFormation.last_saved_at || '1970-01-01';
    const localTimestamp = localBackup.updated_at || localBackup.last_saved_at || '1970-01-01';
    
    const serverDate = new Date(serverTimestamp).getTime();
    const localDate = new Date(localTimestamp).getTime();
    
    console.log('Timestamp comparison:', {
      serverTimestamp,
      localTimestamp,
      serverDate,
      localDate,
      timeDifference: Math.abs(serverDate - localDate)
    });
    
    // Prefer server data if timestamps are within 5 seconds of each other, or if server is newer
    if (serverDate >= localDate || Math.abs(serverDate - localDate) <= 5000) {
      dataToUse = serverFormation;
      source = 'server (preferred)';
    } else {
      dataToUse = localBackup;
      source = 'localStorage (newer)';
    }
  } else if (hasValidServerData) {
    dataToUse = serverFormation;
    source = 'server (only valid source)';
  } else if (hasValidLocalData) {
    dataToUse = localBackup;
    source = 'localStorage (only valid source)';
  }
  
  if (dataToUse) {
    console.log(`Setting formation data from ${source}`);
    
    // Ensure we don't exceed 11 starters
    const validStarters = dataToUse.starters.slice(0, 11);
    const validSubs = Array.isArray(dataToUse.subs) ? dataToUse.subs : DEFAULT_SUBS;
    
    // When using manager's preferred formation but data exists, we should ensure preset matches
    // If we have manager's preference, update the preset but keep player positions
    const finalPreset = preferredPreset || dataToUse?.preset || currentPreset;
    
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
 * Perform the API call to save formation to server with retry logic.
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
    return { error: 'Missing authentication token - please log in again', success: false };
  }
  
  // Add retry logic with exponential backoff
  const maxRetries = 3;
  let retryCount = 0;
  let lastError = null;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`performSaveFormationAPI: Sending data to server for team: ${teamId} (Attempt ${retryCount + 1}/${maxRetries})`);
      console.log('performSaveFormationAPI payload:', formationData);
      
      // Add timestamp to ensure we're tracking the most recent save
      const dataToSave = {
        ...formationData,
        last_saved_at: new Date().toISOString()
      };
      
      // Validate data before sending
      if (!dataToSave.preset) {
        throw new Error('Formation preset is required');
      }
      
      if (!Array.isArray(dataToSave.starters)) {
        throw new Error('Formation starters must be an array');
      }
      
      if (!Array.isArray(dataToSave.subs)) {
        throw new Error('Formation subs must be an array');
      }
      
      const response = await apiClient.put(`/formations/${teamId}`, { 
        schema_json: dataToSave 
      });
      
      console.log('performSaveFormationAPI: Server response:', response);
      
      if (!response) {
        throw new Error('Empty response from server');
      }
      
      // Check for explicit success field or assume success if no error
      const isSuccess = response.success !== false;
      
      if (isSuccess) {
        console.log('performSaveFormationAPI: Save completed successfully');
        
        // Always perform a verification GET to ensure data was saved properly
        try {
          const verifyResponse = await apiClient.get(`/formations/${teamId}?_t=${Date.now()}`);
          console.log('performSaveFormationAPI: Verification response:', verifyResponse);
          const savedData = verifyResponse.data?.schema_json || verifyResponse.schema_json;
          
          if (savedData && savedData.last_saved_at) {
            const savedTimestamp = new Date(savedData.last_saved_at).getTime();
            const ourTimestamp = new Date(dataToSave.last_saved_at).getTime();
            
            if (savedTimestamp >= ourTimestamp) {
              console.log('performSaveFormationAPI: Data verified on server with matching timestamp');
            } else {
              console.warn('performSaveFormationAPI: Verification found older timestamp - this may indicate a save issue');
            }
          } else {
            console.warn('performSaveFormationAPI: Verification couldn\'t compare timestamps');
          }
        } catch (verifyError) {
          console.warn('performSaveFormationAPI: Verification failed but original save was successful:', verifyError);
        }
        return { success: true };
      } else {
        console.error('performSaveFormationAPI: Server indicated failure:', response);
        lastError = { 
          error: response.message || response.error || 'Server indicated failure without details', 
          success: false 
        };
      }
    } catch (error) {
      console.error(`performSaveFormationAPI: Failed to save formation (Attempt ${retryCount + 1}/${maxRetries}):`, error);
      
      let errorMessage = 'Unknown error saving formation';
      let shouldRetry = true;
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        errorMessage = `Server error ${status}: ${data?.message || data?.error || JSON.stringify(data)}`;
        
        // Don't retry on authentication/authorization errors
        if (status === 401) {
          errorMessage = 'Authentication failed - please log in again';
          shouldRetry = false;
        } else if (status === 403) {
          errorMessage = 'Permission denied - you may not have permission to edit this formation';
          shouldRetry = false;
        } else if (status === 400) {
          errorMessage = `Invalid formation data: ${data?.message || data?.error || 'Bad request'}`;
          shouldRetry = false;
        } else if (status === 404) {
          errorMessage = 'Team not found';
          shouldRetry = false;
        }
      } else if (error.request) {
        errorMessage = 'No response from server - please check your internet connection';
      } else if (error.message) {
        errorMessage = `Request error: ${error.message}`;
        // Don't retry on validation errors
        if (error.message.includes('required') || error.message.includes('must be')) {
          shouldRetry = false;
        }
      }
      
      lastError = { 
        error: errorMessage, 
        originalError: error,
        success: false
      };
      
      // Don't retry if we know it won't help
      if (!shouldRetry) {
        console.log('performSaveFormationAPI: Not retrying due to error type');
        break;
      }
    }
    
    // Exponential backoff delay before retry
    if (retryCount < maxRetries - 1) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Max 5 seconds
      console.log(`performSaveFormationAPI: Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    retryCount++;
  }
  
  // All retries failed
  console.error(`performSaveFormationAPI: All ${maxRetries} save attempts failed`);
  return lastError;
};
