import { useCallback, useMemo } from 'react';
import { useTeam } from './useTeam';

/**
 * Enhanced hook for team actions with performance optimization
 */
export const useTeamActions = () => {
  const {
    loadUserTeams,
    switchToTeam,
    createAndSwitchToTeam,
    updateTeam,
    joinTeam,
    leaveTeam,
    refreshCurrentTeam,
    getTeamById,
    getTeamMembersById
  } = useTeam();

  // Add the missing getTeamDetails function that TeamSpace is looking for
  const getTeamDetails = useCallback(async (teamId) => {
    try {
      console.log(`TeamActions: Getting team details for ${teamId}`);
      const team = await getTeamById(teamId);
      
      if (team) {
        return {
          success: true,
          team,
          message: `Team details retrieved successfully`
        };
      } else {
        return {
          success: false,
          error: 'Team not found',
          code: 'TEAM_NOT_FOUND'
        };
      }
    } catch (error) {
      console.error('TeamActions: Get team details error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get team details',
        code: 'GET_DETAILS_FAILED',
        originalError: error
      };
    }
  }, [getTeamById]);

  // Enhanced refresh function for TeamSpace compatibility
  const refreshTeam = useCallback(async (teamId) => {
    try {
      console.log(`TeamActions: Refreshing team ${teamId}`);
      await refreshCurrentTeam();
      return {
        success: true,
        message: 'Team refreshed successfully'
      };
    } catch (error) {
      console.error('TeamActions: Refresh team error:', error);
      return {
        success: false,
        error: error.message || 'Failed to refresh team'
      };
    }
  }, [refreshCurrentTeam]);

  // Memoized enhanced team creation with validation
  const createTeam = useCallback(async (teamData) => {
    try {
      console.log('TeamActions: Creating team with data:', teamData);
      
      // Enhanced client-side validation
      const validationErrors = [];
      
      if (!teamData.name || teamData.name.trim().length < 2) {
        validationErrors.push('Team name must be at least 2 characters long');
      }
      
      if (teamData.abbreviation && (teamData.abbreviation.length < 2 || teamData.abbreviation.length > 4)) {
        validationErrors.push('Team abbreviation must be 2-4 characters');
      }
      
      if (teamData.foundedYear) {
        const year = parseInt(teamData.foundedYear);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1800 || year > currentYear) {
          validationErrors.push('Invalid founded year');
        }
      }

      if (validationErrors.length > 0) {
        return {
          success: false,
          error: validationErrors.join(', '),
          validationErrors
        };
      }

      const result = await createAndSwitchToTeam(teamData);
      
      if (result.success) {
        console.log('TeamActions: Team created successfully:', result.team?.name);
      }
      
      return result;
    } catch (error) {
      console.error('TeamActions: Create team error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create team',
        originalError: error
      };
    }
  }, [createAndSwitchToTeam]);

  // Enhanced team switching with validation
  const switchTeam = useCallback(async (team) => {
    try {
      if (!team || !team.id) {
        return {
          success: false,
          error: 'Invalid team data',
          code: 'INVALID_TEAM'
        };
      }

      console.log(`TeamActions: Switching to team ${team.name} (${team.id})`);
      await switchToTeam(team);
      return { 
        success: true,
        team,
        message: `Switched to ${team.name}`
      };
    } catch (error) {
      console.error('TeamActions: Switch team error:', error);
      return {
        success: false,
        error: error.message || 'Failed to switch team',
        code: 'SWITCH_FAILED',
        originalError: error
      };
    }
  }, [switchToTeam]);

  // Enhanced team joining with comprehensive status handling
  const handleJoinTeam = useCallback(async (teamId, joinData = {}) => {
    try {
      if (!teamId) {
        return {
          success: false,
          error: 'Team ID is required',
          code: 'MISSING_TEAM_ID'
        };
      }

      // Validate join data
      if (joinData.message && joinData.message.length > 500) {
        return {
          success: false,
          error: 'Join message cannot exceed 500 characters',
          code: 'MESSAGE_TOO_LONG'
        };
      }

      const result = await joinTeam(teamId, joinData);
      
      if (result.success) {
        if (result.isPending) {
          return {
            success: true,
            isPending: true,
            message: 'Join request sent! Waiting for approval.',
            code: 'REQUEST_PENDING'
          };
        } else {
          return {
            success: true,
            message: 'Successfully joined the team!',
            code: 'JOINED_SUCCESSFULLY'
          };
        }
      }
      
      return result;
    } catch (error) {
      console.error('TeamActions: Join team error:', error);
      
      // Enhanced error handling
      let errorCode = 'JOIN_FAILED';
      let errorMessage = error.message || 'Failed to join team';
      
      if (error.response?.status === 409) {
        errorCode = 'ALREADY_MEMBER';
        errorMessage = 'You are already a member of this team';
      } else if (error.response?.status === 403) {
        errorCode = 'JOIN_FORBIDDEN';
        errorMessage = 'You do not have permission to join this team';
      } else if (error.response?.status === 404) {
        errorCode = 'TEAM_NOT_FOUND';
        errorMessage = 'Team not found';
      }
      
      return {
        success: false,
        error: errorMessage,
        code: errorCode,
        originalError: error
      };
    }
  }, [joinTeam]);

  // Enhanced team leaving with confirmation
  const handleLeaveTeam = useCallback(async (teamId, options = {}) => {
    try {
      if (!teamId) {
        return {
          success: false,
          error: 'Team ID is required',
          code: 'MISSING_TEAM_ID'
        };
      }

      // Optional confirmation check
      if (options.requireConfirmation && !options.confirmed) {
        return {
          success: false,
          error: 'Please confirm you want to leave the team',
          code: 'CONFIRMATION_REQUIRED'
        };
      }

      const result = await leaveTeam(teamId);
      
      if (result.success) {
        return {
          success: true,
          message: 'Successfully left the team',
          code: 'LEFT_SUCCESSFULLY'
        };
      }
      
      return result;
    } catch (error) {
      console.error('TeamActions: Leave team error:', error);
      
      let errorCode = 'LEAVE_FAILED';
      let errorMessage = error.message || 'Failed to leave team';
      
      if (error.response?.status === 403) {
        errorCode = 'LEAVE_FORBIDDEN';
        errorMessage = 'You cannot leave this team (you might be the owner)';
      }
      
      return {
        success: false,
        error: errorMessage,
        code: errorCode,
        originalError: error
      };
    }
  }, [leaveTeam]);

  // Enhanced team update with optimistic updates
  const handleUpdateTeam = useCallback(async (teamId, updateData, options = {}) => {
    try {
      if (!teamId || !updateData) {
        return {
          success: false,
          error: 'Team ID and update data are required',
          code: 'MISSING_DATA'
        };
      }

      // Enhanced validation
      const validationErrors = [];
      
      if (updateData.name !== undefined) {
        if (!updateData.name || updateData.name.trim().length < 2) {
          validationErrors.push('Team name must be at least 2 characters long');
        } else if (updateData.name.length > 50) {
          validationErrors.push('Team name cannot exceed 50 characters');
        }
      }
      
      if (updateData.abbreviation !== undefined && updateData.abbreviation) {
        if (updateData.abbreviation.length < 2 || updateData.abbreviation.length > 4) {
          validationErrors.push('Team abbreviation must be 2-4 characters');
        }
      }

      if (validationErrors.length > 0) {
        return {
          success: false,
          error: validationErrors.join(', '),
          code: 'VALIDATION_FAILED',
          validationErrors
        };
      }

      const result = await updateTeam(teamId, updateData);
      
      if (result.success) {
        // Auto-refresh if requested
        if (options.autoRefresh !== false) {
          await refreshCurrentTeam();
        }
        
        return {
          success: true,
          team: result.team,
          message: 'Team updated successfully',
          code: 'UPDATED_SUCCESSFULLY'
        };
      }
      
      return result;
    } catch (error) {
      console.error('TeamActions: Update team error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update team',
        code: 'UPDATE_FAILED',
        originalError: error
      };
    }
  }, [updateTeam, refreshCurrentTeam]);

  // Batch operations for efficiency
  const batchOperations = useMemo(() => ({
    refreshAllData: async () => {
      try {
        const results = await Promise.allSettled([
          loadUserTeams(true),
          refreshCurrentTeam()
        ]);
        
        return {
          success: true,
          results: results.map(r => r.status === 'fulfilled' ? r.value : r.reason)
        };
      } catch (error) {
        return {
          success: false,
          error: error.message || 'Failed to refresh all data'
        };
      }
    },

    getTeamWithMembers: async (teamId) => {
      try {
        const [team, members] = await Promise.all([
          getTeamById(teamId),
          getTeamMembersById(teamId)
        ]);
        
        return {
          success: true,
          team,
          members
        };
      } catch (error) {
        return {
          success: false,
          error: error.message || 'Failed to get team data'
        };
      }
    }
  }), [loadUserTeams, refreshCurrentTeam, getTeamById, getTeamMembersById]);

  return {
    // Enhanced actions - INCLUDES MISSING FUNCTIONS
    createTeam,
    switchTeam,
    joinTeam: handleJoinTeam,
    leaveTeam: handleLeaveTeam,
    updateTeam: handleUpdateTeam,
    getTeamDetails, // ADDED - This was missing!
    refreshTeam,    // ADDED - For TeamSpace compatibility
    
    // Batch operations
    ...batchOperations,

    // Raw actions (for advanced use)
    rawActions: {
      loadUserTeams,
      switchToTeam,
      createAndSwitchToTeam,
      updateTeam,
      joinTeam,
      leaveTeam,
      refreshCurrentTeam,
      getTeamById,
      getTeamMembersById
    }
  };
};

/**
 * Enhanced hook for team management forms with validation
 */
export const useTeamForms = () => {
  const { createTeam, updateTeam } = useTeamActions();

  const createTeamForm = useMemo(() => ({
    submit: async (formData) => {
      const teamData = {
        name: formData.name?.trim(),
        abbreviation: formData.abbreviation?.trim().toUpperCase(),
        city: formData.city?.trim(),
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : null,
        description: formData.description?.trim(),
        logoUrl: formData.logoUrl?.trim() || null
      };

      // Remove empty strings
      Object.keys(teamData).forEach(key => {
        if (teamData[key] === '') {
          teamData[key] = null;
        }
      });

      return await createTeam(teamData);
    }
  }), [createTeam]);

  const updateTeamForm = useMemo(() => ({
    submit: async (teamId, formData) => {
      const updateData = {};
      
      if (formData.name !== undefined) updateData.name = formData.name.trim();
      if (formData.abbreviation !== undefined) updateData.abbreviation = formData.abbreviation.trim().toUpperCase();
      if (formData.city !== undefined) updateData.city = formData.city.trim();
      if (formData.foundedYear !== undefined) updateData.foundedYear = formData.foundedYear ? parseInt(formData.foundedYear) : null;
      if (formData.description !== undefined) updateData.description = formData.description.trim();
      if (formData.logoUrl !== undefined) updateData.logoUrl = formData.logoUrl.trim() || null;

      // Remove empty strings
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '') {
          updateData[key] = null;
        }
      });

      return await updateTeam(teamId, updateData);
    }
  }), [updateTeam]);

  return {
    createTeamForm,
    updateTeamForm
  };
};