import { 
  AUTH_INIT, 
  AUTH_SUCCESS, 
  AUTH_ERROR, 
  AUTH_LOGOUT, 
  AUTH_LOADING,
  initialState 
} from './constants/authConstants';
import { validateUserData, sanitizeUserData } from './utils/authValidation';
import { clearAllAuthStorage } from './utils/tokenManager';

/**
 * Auth reducer to manage authentication state
 */
export const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_INIT:
      // Initialize state, typically when auth check completes with no user
      return { ...initialState, loading: false };
      
    case AUTH_SUCCESS:
      // Enhanced validation of user payload
      const userPayload = action.payload && typeof action.payload === 'object' ? action.payload : null;
      
      // Verify the user object has required fields
      if (!userPayload) {
        console.error('AuthReducer: No user payload provided');
        return {
          ...initialState,
          loading: false,
          error: 'No user data received'
        };
      }

      const validation = validateUserData(userPayload);
      if (!validation.valid) {
        console.error('AuthReducer: Invalid user data:', validation.reason);
        
        // Clear token if the user data is invalid
        clearAllAuthStorage();
        
        return {
          ...initialState,
          loading: false,
          error: `Invalid user data: ${validation.reason}`
        };
      }
      
      // Sanitize and store user data
      const cleanUser = sanitizeUserData(userPayload);
      
      return {
        ...state,
        user: cleanUser,
        loading: false,
        error: null,
        isAuthenticated: true,
      };
      
    case AUTH_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        // Note: We don't automatically logout on error unless it's an auth error
      };
      
    case AUTH_LOGOUT:
      // Clear storage and reset to initial state
      clearAllAuthStorage();
      return {
        ...initialState,
        loading: false,
      };
      
    case AUTH_LOADING:
      return { 
        ...state, 
        loading: true, 
        error: null 
      };
      
    default:
      return state;
  }
};