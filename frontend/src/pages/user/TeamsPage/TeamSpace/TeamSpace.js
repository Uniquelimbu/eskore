import React, { useEffect } from 'react';
import { useParams, useLocation, Outlet } from 'react-router-dom';
import { useTeam } from '../../../../contexts/TeamContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { TeamSpaceProvider, useTeamSpace } from './contexts/TeamSpaceContext';
import { autoCollapseSidebarForPath } from '../../../../utils/sidebarUtils';
import './styles/index.css';

// Internal component that uses TeamSpaceContext
const TeamSpaceContent = () => {
  const { teamId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  
  // Use TeamContext for global team data
  const { 
    currentTeam, 
    isManager, 
    teamMembers, 
    loading: teamLoading, 
    error: teamError,
    hasError,
    switchToTeam,
    getTeamById,
    refreshCurrentTeam
  } = useTeam();
  
  // Use TeamSpaceContext for local UI state
  const {
    loading: localLoading,
    setLoading,
    clearError
  } = useTeamSpace();

  // Check if we're on the base team space path
  const isBasePath = location.pathname === `/teams/${teamId}/space`;

  // Handle sidebar auto-collapse for specific paths
  useEffect(() => {
    autoCollapseSidebarForPath(location.pathname);
    
    // Cleanup on unmount - expand sidebar when leaving TeamSpace
    return () => {
      if (!location.pathname.includes('/teams/') || 
          (location.pathname.includes('/teams') && !location.pathname.includes('/space/'))) {
        import('../../../../utils/sidebarUtils').then(({ expandSidebar }) => {
          expandSidebar();
        });
      }
    };
  }, [location.pathname]);

  // Ensure we're viewing the correct team
  useEffect(() => {
    const ensureCorrectTeam = async () => {
      if (!teamId || !user) return;
      
      console.log(`TeamSpace: Ensuring correct team - URL: ${teamId}, Current: ${currentTeam?.id}`);
      
      // If no current team or different team, switch to the requested team
      if (!currentTeam || currentTeam.id.toString() !== teamId) {
        setLoading(true);
        try {
          console.log(`TeamSpace: Fetching team ${teamId}`);
          const team = await getTeamById(teamId);
          
          if (team) {
            console.log(`TeamSpace: Switching to team ${team.name}`);
            await switchToTeam(team);
            clearError(); // Clear any previous errors
          } else {
            console.error('TeamSpace: Team not found');
          }
        } catch (error) {
          console.error('TeamSpace: Error ensuring correct team:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    ensureCorrectTeam();
  }, [teamId, currentTeam, user, getTeamById, switchToTeam, setLoading, clearError]);

  // Enhanced refresh function using TeamContext
  const refreshTeamData = async () => {
    try {
      setLoading(true);
      console.log('TeamSpace: Refreshing team data');
      await refreshCurrentTeam();
      console.log('TeamSpace: Team data refreshed successfully');
      clearError();
    } catch (error) {
      console.error('TeamSpace: Error refreshing team data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Context value for child components
  const contextValue = {
    team: currentTeam,
    isManager,
    refreshTeam: refreshTeamData,
    teamMembers,
    loading: teamLoading || localLoading,
    error: teamError || (hasError ? 'Team system error' : null)
  };

  // Combined loading state
  const isLoading = teamLoading || localLoading;

  // Show loading state
  if (isLoading && !currentTeam) {
    return (
      <div className="team-space-layout">
        <div className="team-space-container" style={{ paddingTop: 0 }}>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading team data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (teamError || hasError) {
    return (
      <div className="team-space-layout">
        <div className="team-space-container" style={{ paddingTop: 0 }}>
          <div className="error-container">
            <h3>Error Loading Team</h3>
            <p>{teamError || 'Something went wrong loading the team data.'}</p>
            <button onClick={refreshTeamData} className="retry-button">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="team-space-layout">
      <div className="team-space-container" style={{ paddingTop: 0 }}>
        {/* Team Header - Only show on dashboard (isBasePath) */}
        {isBasePath && currentTeam && (
          <div className="team-space-header">
            <div className="team-identity-section">
              <div className="team-logo">
                {currentTeam.logoUrl ? (
                  <img src={currentTeam.logoUrl} alt={`${currentTeam.name} logo`} />
                ) : (
                  <div className="team-logo-placeholder">
                    {currentTeam.abbreviation || 
                     (currentTeam.name ? currentTeam.name.substring(0, 3).toUpperCase() : 'T')}
                  </div>
                )}
              </div>
              <div className="team-details">
                <h1>{currentTeam.name || 'Team Name'}</h1>
                {currentTeam.nickname && <div className="team-nickname">{currentTeam.nickname}</div>}
                <div className="team-meta">
                  {currentTeam.city && <span className="team-location">{currentTeam.city}</span>}
                  {currentTeam.foundedYear && (
                    <span className="team-founded">Est. {currentTeam.foundedYear}</span>
                  )}
                  <span className="team-members">{teamMembers?.length || 0} members</span>
                </div>
              </div>
            </div>
            
            <div className="team-actions">
              {isManager && (
                <button className="btn btn-primary" onClick={refreshTeamData}>
                  Refresh Data
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading overlay for partial updates */}
        {isLoading && currentTeam && (
          <div className="team-space-loading-overlay">
            <div className="loading-content">Updating...</div>
          </div>
        )}

        {/* Team Content */}
        <div className="team-space-content">
          <Outlet context={contextValue} />
        </div>
      </div>
    </div>
  );
};

// Main component wrapper with TeamSpaceProvider
const TeamSpace = () => {
  return (
    <TeamSpaceProvider>
      <TeamSpaceContent />
    </TeamSpaceProvider>
  );
};

export default TeamSpace;