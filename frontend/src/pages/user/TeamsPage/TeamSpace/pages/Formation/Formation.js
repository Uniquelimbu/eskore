import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTeam } from '../../../../../../contexts/TeamContext';
import { useAuth } from '../../../../../../contexts/AuthContext';
import FormationContainer from './components/FormationContainer';
import TeamLogoOverlay from './components/TeamLogoOverlay';
import { collapseSidebar, expandSidebar } from '../../../../../../utils/sidebarUtils';
import './Formation.css';

const Formation = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Use TeamContext instead of manual API calls
  const {
    currentTeam,
    teamMembers,
    isManager,
    isPlayer,
    loading: teamLoading,
    error: teamError,
    switchToTeam,
    getTeamById,
    refreshCurrentTeam,
    isUserMemberOfCurrentTeam
  } = useTeam();

  // Local state for Formation-specific functionality
  const [showTeamLogoOverlay, setShowTeamLogoOverlay] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Derived state - players from team members
  const players = useMemo(() => {
    if (!teamMembers || teamMembers.length === 0) return [];
    
    // Convert team members to player format expected by FormationContainer
    return teamMembers
      .filter(member => member.role === 'athlete') // Only athletes can be in formations
      .map(member => ({
        id: member.id || member.userId,
        userId: member.userId || member.id,
        firstName: member.firstName || member.user?.firstName || '',
        lastName: member.lastName || member.user?.lastName || '',
        email: member.email || member.user?.email || '',
        role: member.role,
        jerseyNumber: member.jerseyNumber || null,
        position: member.position || null,
        // Include full member object for compatibility
        ...member,
        user: member.user || member
      }));
  }, [teamMembers]);

  // Check if user is a member of current team
  const isMember = isUserMemberOfCurrentTeam(user?.id);

  // Ensure we're on the correct team
  useEffect(() => {
    const ensureCorrectTeam = async () => {
      if (!teamId || !currentTeam) return;
      
      // If current team doesn't match URL team, switch to it
      if (currentTeam.id.toString() !== teamId) {
        try {
          setLocalLoading(true);
          console.log(`Formation: Switching from team ${currentTeam.id} to ${teamId}`);
          const team = await getTeamById(teamId);
          await switchToTeam(team);
        } catch (err) {
          console.error('Formation: Error switching to team:', err);
          setLocalError('Failed to load team data');
        } finally {
          setLocalLoading(false);
        }
      }
    };

    ensureCorrectTeam();
  }, [teamId, currentTeam, getTeamById, switchToTeam]);

  // Handle initial loading state
  useEffect(() => {
    if (currentTeam && teamMembers !== null) {
      setInitialLoad(false);
    }
  }, [currentTeam, teamMembers]);

  // Listen for team membership changes and refresh team data
  useEffect(() => {
    const handleMembershipChanged = async () => {
      if (!currentTeam) return;
      
      console.log('Formation: Team membership changed, refreshing team data');
      try {
        await refreshCurrentTeam();
        console.log('Formation: Team data refreshed successfully');
      } catch (error) {
        console.error('Formation: Error refreshing team data:', error);
      }
    };

    // Enhanced event listeners
    const handleTeamMembershipChanged = (event) => {
      if (event.detail?.teamId === currentTeam?.id || !event.detail?.teamId) {
        handleMembershipChanged();
      }
    };

    const handlePlayersChanged = (event) => {
      if (event.detail?.teamId === currentTeam?.id || !event.detail?.teamId) {
        handleMembershipChanged();
      }
    };

    const handleForceRefresh = (event) => {
      if (event.detail?.teamId === currentTeam?.id || !event.detail?.teamId) {
        console.log('Formation: Force refresh triggered:', event.detail?.reason || 'unknown');
        handleMembershipChanged();
      }
    };

    // Add event listeners
    window.addEventListener('teamMembershipChanged', handleTeamMembershipChanged);
    window.addEventListener('teamPlayersChanged', handlePlayersChanged);
    window.addEventListener('squadMembersChanged', handleTeamMembershipChanged);
    window.addEventListener('forceFormationRefresh', handleForceRefresh);
    window.addEventListener('reloadFormationData', handleForceRefresh);
    
    return () => {
      window.removeEventListener('teamMembershipChanged', handleTeamMembershipChanged);
      window.removeEventListener('teamPlayersChanged', handlePlayersChanged);
      window.removeEventListener('squadMembersChanged', handleTeamMembershipChanged);
      window.removeEventListener('forceFormationRefresh', handleForceRefresh);
      window.removeEventListener('reloadFormationData', handleForceRefresh);
    };
  }, [currentTeam?.id, refreshCurrentTeam]);

  // Sidebar management
  useEffect(() => {
    console.log('Formation: Attempting to collapse sidebar');
    
    const timer = setTimeout(() => {
      collapseSidebar();
    }, 50);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Navigation handlers
  const handleBack = () => {
    console.log('Formation: Expanding sidebar and navigating back');
    expandSidebar();
    navigate(`/teams/${teamId}/space`);
  };

  const handleInMatchRoles = () => {
    console.log('Formation: Navigating to in-match roles');
    // Navigate to in-match roles page when implemented
    // navigate(`/teams/${teamId}/space/roles`);
  };

  const handleEditPlayerNumber = () => {
    console.log('Formation: Navigating to edit player numbers');
    // Navigate to edit player numbers page when implemented
    // navigate(`/teams/${teamId}/space/players/edit`);
  };

  const handleLineups = () => {
    console.log('Formation: Navigating to lineups');
    // Navigate to lineups page when implemented
    // navigate(`/teams/${teamId}/space/lineups`);
  };

  // Enhanced role checking using TeamContext
  const canEditFormation = useMemo(() => {
    // Managers can always edit formations
    if (isManager) return true;
    
    // Team creators can edit even if not explicitly marked as manager
    if (user && currentTeam && currentTeam.createdBy === user.id) return true;
    
    return false;
  }, [isManager, user, currentTeam]);

  const canViewFormation = useMemo(() => {
    // Members can view formations
    if (isMember) return true;
    
    // Managers can always view
    if (isManager) return true;
    
    return false;
  }, [isMember, isManager]);

  // Determine view mode
  const viewMode = useMemo(() => {
    if (canEditFormation) return 'manager';
    if (isPlayer) return 'player';
    return 'viewer';
  }, [canEditFormation, isPlayer]);

  // Loading states
  const isLoading = teamLoading || localLoading;
  const error = teamError || localError;

  // Loading state for initial load
  if (initialLoad && isLoading) {
    return (
      <div className="formation-loading">
        <div className="loader"></div>
        <p>Loading formation...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="formation-error">
        <h3>Error Loading Formation</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/teams')} className="back-button">
          Back to Teams
        </button>
      </div>
    );
  }

  // No team selected state
  if (!currentTeam) {
    return (
      <div className="formation-error">
        <h3>No Team Selected</h3>
        <p>Please select a team to view formation.</p>
        <button onClick={() => navigate('/teams')} className="back-button">
          Back to Teams
        </button>
      </div>
    );
  }

  // Permission check
  if (!canViewFormation) {
    return (
      <div className="formation-error">
        <h3>Access Denied</h3>
        <p>You don't have permission to view this team's formation.</p>
        <button onClick={() => navigate('/teams')} className="back-button">
          Back to Teams
        </button>
      </div>
    );
  }

  console.log('Formation: Rendering with data:', {
    team: currentTeam.name,
    playersCount: players.length,
    isManager,
    isPlayer,
    canEditFormation,
    viewMode
  });

  return (
    <div className="formation-page">
      {isLoading && !initialLoad && (
        <div className="formation-loading-overlay">
          <div className="formation-loading-content">Updating formation...</div>
        </div>
      )}

      <div className="page-header">
        <button className="back-button" onClick={handleBack}>
          &larr; Back
        </button>
        
        <div className="page-title">
          <h1>Formation</h1>
          <span className="team-name">{currentTeam.name}</span>
        </div>

        <div className="page-actions">
          <button 
            className="team-logo-button"
            onClick={() => setShowTeamLogoOverlay(true)}
            title="Team Options"
          >
            {currentTeam.logoUrl ? (
              <img 
                src={currentTeam.logoUrl} 
                alt={`${currentTeam.name} logo`} 
                className="team-logo"
              />
            ) : (
              <div className="team-logo-placeholder">
                {currentTeam.abbreviation || currentTeam.name?.substring(0, 3).toUpperCase() || 'TM'}
              </div>
            )}
          </button>
        </div>
      </div>

      <div className="formation-content">
        <FormationContainer 
          teamId={teamId} 
          team={currentTeam}
          isManager={canEditFormation}
          isPlayer={isPlayer}
          viewMode={viewMode}
          players={players}
          onPlayersUpdate={refreshCurrentTeam}
        />
      </div>

      {/* Team Logo Overlay */}
      <TeamLogoOverlay
        isOpen={showTeamLogoOverlay}
        onClose={() => setShowTeamLogoOverlay(false)}
        teamLogo={currentTeam?.logoUrl}
        teamName={currentTeam?.name}
        teamAbbreviation={currentTeam?.abbreviation}
        onInMatchRoles={handleInMatchRoles}
        onEditPlayerNumber={handleEditPlayerNumber}
        onLineups={handleLineups}
      />
    </div>
  );
};

export default Formation;