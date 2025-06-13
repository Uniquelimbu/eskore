import { authService, apiClient } from '../../services';
import { 
  AUTH_INIT, 
  AUTH_SUCCESS, 
  AUTH_ERROR, 
  AUTH_LOGOUT, 
  AUTH_LOADING 
} from './constants/authConstants';
import { 
  getStoredToken, 
  getStoredUser, 
  setStoredToken, 
  setStoredUser, 
  setStoredTeamId,
  clearAllAuthStorage 
} from './utils/tokenManager';
import { 
  isUserDataComplete, 
  sanitizeUserData, 
  validateProfileUpdate 
} from './utils/authValidation';
import { 
  validatePassword 
} from './utils/authHelpers';

/**
 * Initialize authentication state
 */
export const initializeAuth = (dispatch) => {
  return async () => {
    dispatch({ type: AUTH_LOADING });
    
    const token = getStoredToken();
    const storedUser = getStoredUser();
    
    if (!token) {
      console.log('AuthActions: No token found, initializing as logged out');
      dispatch({ type: AUTH_INIT });
      return;
    }
    
    console.log('AuthActions: Token found, attempting to restore session');
    
    // If we have valid stored user, use it first to prevent flickering
    if (storedUser && storedUser.id) {
      console.log('AuthActions: Restoring user from localStorage:', storedUser.id);
      dispatch({ type: AUTH_SUCCESS, payload: storedUser });
      
      // Validate with server in background
      validateTokenWithServer(dispatch, token);
      return;
    }
    
    // No valid stored user, validate with server
    await validateTokenWithServer(dispatch, token);
  };
};

/**
 * Validate token with server
 */
const validateTokenWithServer = async (dispatch, token) => {
  try {
    console.log('AuthActions: Validating token with server...');
    const currentUser = await authService.getCurrentUser(false);
    
    if (currentUser && currentUser.id) {
      console.log('AuthActions: Token valid, user authenticated:', currentUser.id);
      
      const cleanUser = sanitizeUserData(currentUser);
      setStoredUser(cleanUser);
      
      dispatch({ type: AUTH_SUCCESS, payload: cleanUser });
    } else {
      console.warn('AuthActions: Token validation failed');
      clearAllAuthStorage();
      dispatch({ type: AUTH_INIT });
    }
  } catch (error) {
    console.error('AuthActions: Error validating token:', error);
    clearAllAuthStorage();
    dispatch({ type: AUTH_INIT });
  }
};

/**
 * Login action
 */
export const loginUser = (dispatch) => {
  return async (emailOrCredentials, maybePassword) => {
    dispatch({ type: AUTH_LOADING });
    
    // Support both object and separate parameters
    let email, password;
    if (typeof emailOrCredentials === 'object' && emailOrCredentials !== null) {
      email = emailOrCredentials.email;
      password = emailOrCredentials.password;
    } else {
      email = emailOrCredentials;
      password = maybePassword;
    }

    try {
      console.log('AuthActions: Logging in user', { email });
      
      // Input validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response;
      
      if (!user || !user.id) {
        throw new Error('Invalid user data received from server');
      }
      
      // Get complete user data if needed
      let completeUserData = user;
      if (!isUserDataComplete(user)) {
        console.log('AuthActions: Fetching complete user profile');
        try {
          setStoredToken(token); // Set token for authenticated request
          const userResponse = await apiClient.get('/auth/me');
          if (userResponse && userResponse.id) {
            completeUserData = userResponse;
          }
        } catch (profileError) {
          console.error('AuthActions: Error fetching complete profile:', profileError);
        }
      }
      
      // Store authentication data
      setStoredToken(token);
      const cleanUser = sanitizeUserData(completeUserData);
      setStoredUser(cleanUser);
      
      dispatch({ type: AUTH_SUCCESS, payload: cleanUser });
      
      // Fetch user teams for team selection
      await fetchUserTeamsAfterLogin(cleanUser);
      
      console.log('AuthActions: Login successful for user:', cleanUser.email);
      return { success: true, user: cleanUser };
      
    } catch (err) {
      const errorMessage = err?.message || err?.response?.data?.message || 
                          'Failed to login. Please check your credentials.';
      
      console.error('AuthActions: Login failed:', errorMessage);
      dispatch({ type: AUTH_ERROR, payload: errorMessage });
      clearAllAuthStorage();
      
      return { success: false, error: errorMessage };
    }
  };
};

/**
 * Update user profile action
 */
export const updateUserProfile = (dispatch) => {
  return async (updateData) => {
    try {
      dispatch({ type: AUTH_LOADING });
      
      console.log('AuthActions: Updating user profile');
      
      // Validate update data
      const validation = validateProfileUpdate(updateData);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }
      
      const response = await apiClient.put('/auth/profile', updateData);
      
      if (response && response.id) {
        const cleanUser = sanitizeUserData(response);
        setStoredUser(cleanUser);
        dispatch({ type: AUTH_SUCCESS, payload: cleanUser });
        
        console.log('AuthActions: Profile updated successfully');
        return { success: true, user: cleanUser };
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('AuthActions: Profile update error:', error);
      const errorMessage = error.message || 'Failed to update profile';
      dispatch({ type: AUTH_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };
};

/**
 * Change password action
 */
export const changePassword = (dispatch) => {
  return async (currentPassword, newPassword) => {
    try {
      dispatch({ type: AUTH_LOADING });
      
      console.log('AuthActions: Changing user password');
      
      // Validate current password
      if (!currentPassword) {
        throw new Error('Current password is required');
      }
      
      // Validate new password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.errors.join(', '));
      }
      
      const response = await apiClient.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      if (response && response.success) {
        // Password changed successfully, user remains logged in
        console.log('AuthActions: Password changed successfully');
        return { success: true, message: 'Password changed successfully' };
      } else {
        throw new Error(response?.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('AuthActions: Password change error:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to change password';
      dispatch({ type: AUTH_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };
};

/**
 * Logout action
 */
export const logoutUser = (dispatch) => {
  return async () => {
    console.log('AuthActions: Logging out user');
    
    try {
      // Send logout API call
      await authService.logout();
      console.log('AuthActions: Server logout successful');
    } catch (error) {
      console.error('AuthActions: Logout API error:', error);
      // Continue with client logout even if server call fails
    }
    
    // Always clear client state
    dispatch({ type: AUTH_LOGOUT });
    console.log('AuthActions: Client logout completed');
  };
};

/**
 * Register user action
 */
export const registerUser = (dispatch) => {
  return async (userData) => {
    try {
      dispatch({ type: AUTH_LOADING });
      
      console.log('AuthActions: Registering new user:', userData.email);
      
      // Client-side validation
      if (!userData.email || !userData.password) {
        throw new Error('Email and password are required');
      }
      
      if (!userData.firstName || !userData.lastName) {
        throw new Error('First name and last name are required');
      }
      
      // Validate password
      const passwordValidation = validatePassword(userData.password);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.errors.join(', '));
      }
      
      const registerResponse = await authService.registerUser(userData);
      
      if (registerResponse && registerResponse.success) {
        const userObject = registerResponse.user;
        
        if (userObject && userObject.id) {
          console.log('AuthActions: Registration successful');
          const cleanUser = sanitizeUserData(userObject);
          dispatch({ type: AUTH_SUCCESS, payload: cleanUser });
          
          // Store user data
          if (registerResponse.token) {
            setStoredToken(registerResponse.token);
            setStoredUser(cleanUser);
          }
          
          return { success: true, user: cleanUser };
        } else {
          console.log('AuthActions: Registration successful but incomplete user data');
          dispatch({ type: AUTH_INIT });
          return { success: true, message: 'Registration successful' };
        }
      } else {
        throw new Error(registerResponse?.message || 'Registration failed');
      }
    } catch (error) {
      console.error('AuthActions: Registration error:', error);
      const errorMessage = error.message || 'Registration failed';
      dispatch({ type: AUTH_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };
};

/**
 * Verify user data action
 */
export const verifyUserData = (dispatch) => {
  return async (forceRefresh = false, currentUser = null) => {
    if (currentUser && currentUser.id && !forceRefresh) {
      return currentUser;
    }
    
    try {
      console.log('AuthActions: Verifying user data', { forceRefresh });
      
      const token = getStoredToken();
      if (!token) {
        console.log('AuthActions: No token found during verification');
        dispatch({ type: AUTH_INIT });
        return null;
      }
      
      const response = await apiClient.get('/auth/me');
      
      if (response && response.id) {
        const cleanUser = sanitizeUserData(response);
        setStoredUser(cleanUser);
        dispatch({ type: AUTH_SUCCESS, payload: cleanUser });
        
        console.log('AuthActions: User data verified and updated');
        return cleanUser;
      } else {
        console.warn('AuthActions: Invalid user data received during verification');
        clearAllAuthStorage();
        dispatch({ type: AUTH_INIT });
        return null;
      }
    } catch (err) {
      console.error('AuthActions: Failed to refresh user data:', err);
      
      // Only clear storage if it's an auth error
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        clearAllAuthStorage();
        dispatch({ type: AUTH_INIT });
      } else {
        // For other errors, just set error state but keep user logged in
        dispatch({ type: AUTH_ERROR, payload: 'Failed to refresh user data' });
      }
      
      return null;
    }
  };
};

/**
 * Reset password request action
 */
export const requestPasswordReset = (dispatch) => {
  return async (email) => {
    try {
      console.log('AuthActions: Requesting password reset for:', email);
      
      const response = await apiClient.post('/auth/reset-password-request', { email });
      
      if (response && response.success) {
        console.log('AuthActions: Password reset email sent');
        return { success: true, message: 'Password reset email sent' };
      } else {
        throw new Error(response?.message || 'Failed to send password reset email');
      }
    } catch (error) {
      console.error('AuthActions: Password reset request error:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to send password reset email';
      return { success: false, error: errorMessage };
    }
  };
};

/**
 * Reset password action
 */
export const resetPassword = (dispatch) => {
  return async (token, newPassword) => {
    try {
      console.log('AuthActions: Resetting password with token');
      
      // Validate new password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.errors.join(', '));
      }
      
      const response = await apiClient.post('/auth/reset-password', {
        token,
        newPassword
      });
      
      if (response && response.success) {
        console.log('AuthActions: Password reset successful');
        return { success: true, message: 'Password reset successful' };
      } else {
        throw new Error(response?.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('AuthActions: Password reset error:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to reset password';
      return { success: false, error: errorMessage };
    }
  };
};

/**
 * Delete account action
 */
export const deleteAccount = (dispatch) => {
  return async (password) => {
    try {
      console.log('AuthActions: Deleting user account');
      
      if (!password) {
        throw new Error('Password is required to delete account');
      }
      
      const response = await apiClient.delete('/auth/account', {
        data: { password }
      });
      
      if (response && response.success) {
        console.log('AuthActions: Account deleted successfully');
        dispatch({ type: AUTH_LOGOUT });
        return { success: true, message: 'Account deleted successfully' };
      } else {
        throw new Error(response?.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('AuthActions: Account deletion error:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to delete account';
      return { success: false, error: errorMessage };
    }
  };
};

/**
 * Helper to fetch user teams after login
 */
const fetchUserTeamsAfterLogin = async (user) => {
  try {
    if (user && user.id) {
      console.log('AuthActions: Fetching teams for logged in user');
      const teamsResponse = await apiClient.get(`/teams/user/${user.id}`);
      
      if (teamsResponse && teamsResponse.teams && teamsResponse.teams.length > 0) {
        const firstTeam = teamsResponse.teams[0];
        if (firstTeam && firstTeam.id) {
          setStoredTeamId(firstTeam.id);
          console.log('AuthActions: Set default team:', firstTeam.name);
        }
      }
    }
  } catch (teamErr) {
    console.error('AuthActions: Error fetching user teams:', teamErr);
    // Non-fatal error
  }
};