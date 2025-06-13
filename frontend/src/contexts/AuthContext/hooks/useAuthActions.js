import { useAuth } from './useAuth';

/**
 * Enhanced hook for auth actions with comprehensive functionality
 */
export const useAuthActions = () => {
  const { 
    login, 
    logout, 
    registerUser, 
    verifyUserData,
    updateUserProfile,
    changePassword,
    refreshUser,
    forceLogout
  } = useAuth();
  
  // Enhanced login with better error handling
  const handleLogin = async (credentials) => {
    try {
      const result = await login(credentials);
      if (result.success) {
        console.log('Login successful:', result.user.email);
        return result;
      } else {
        console.error('Login failed:', result.error);
        return result;
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  // Enhanced logout with cleanup
  const handleLogout = async () => {
    try {
      console.log('Logging out user...');
      await logout();
      
      // Additional cleanup if needed
      window.location.href = '/login'; // Redirect to login page
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      forceLogout();
    }
  };

  // Enhanced registration with validation
  const handleRegister = async (userData) => {
    try {
      // Basic client-side validation
      if (!userData.email || !userData.password) {
        return { 
          success: false, 
          error: 'Email and password are required' 
        };
      }

      if (userData.password.length < 8) {
        return { 
          success: false, 
          error: 'Password must be at least 8 characters long' 
        };
      }

      const result = await registerUser(userData);
      if (result.success) {
        console.log('Registration successful:', result.user?.email);
      }
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  // Enhanced profile update with optimistic updates
  const handleUpdateProfile = async (updateData) => {
    try {
      const result = await updateUserProfile(updateData);
      if (result.success) {
        console.log('Profile updated successfully');
        // Optionally trigger a user refresh
        await refreshUser(true);
      }
      return result;
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message || 'Profile update failed' };
    }
  };

  // Enhanced password change with validation
  const handleChangePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      // Client-side validation
      if (!currentPassword || !newPassword) {
        return { 
          success: false, 
          error: 'Current password and new password are required' 
        };
      }

      if (newPassword !== confirmPassword) {
        return { 
          success: false, 
          error: 'New password and confirmation do not match' 
        };
      }

      if (newPassword.length < 8) {
        return { 
          success: false, 
          error: 'New password must be at least 8 characters long' 
        };
      }

      const result = await changePassword(currentPassword, newPassword);
      if (result.success) {
        console.log('Password changed successfully');
      }
      return result;
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: error.message || 'Password change failed' };
    }
  };

  // Verify and refresh user data
  const handleRefreshUser = async (forceRefresh = false) => {
    try {
      const user = await verifyUserData(forceRefresh);
      return { success: true, user };
    } catch (error) {
      console.error('User refresh error:', error);
      return { success: false, error: error.message || 'Failed to refresh user data' };
    }
  };

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      const user = await verifyUserData(false);
      return {
        isAuthenticated: !!user,
        user
      };
    } catch (error) {
      console.error('Auth status check error:', error);
      return {
        isAuthenticated: false,
        user: null
      };
    }
  };

  return {
    // Core actions (enhanced)
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    
    // Profile management (enhanced)
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,
    refreshUser: handleRefreshUser,
    
    // Utility actions
    verifyUserData,
    checkAuthStatus,
    forceLogout,
    
    // Raw actions (for advanced use)
    rawActions: {
      login,
      logout,
      registerUser,
      updateUserProfile,
      changePassword,
      verifyUserData,
      refreshUser
    }
  };
};

/**
 * Hook for quick auth status checks
 */
export const useAuthStatus = () => {
  const { user, isAuthenticated, loading, error } = useAuth();
  
  return {
    user,
    isAuthenticated,
    loading,
    error,
    isLoading: loading,
    hasError: !!error
  };
};

/**
 * Hook for auth form helpers
 */
export const useAuthForms = () => {
  const { login, register } = useAuthActions();
  
  const loginForm = {
    submit: async (formData) => {
      return await login({
        email: formData.email,
        password: formData.password
      });
    }
  };

  const registerForm = {
    submit: async (formData) => {
      return await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        ...formData
      });
    }
  };

  return {
    loginForm,
    registerForm
  };
};