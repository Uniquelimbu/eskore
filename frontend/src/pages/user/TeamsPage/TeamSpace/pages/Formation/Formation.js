import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import FormationContainer from './components/FormationContainer';
import TeamLogoOverlay from './components/TeamLogoOverlay';
import { apiClient } from '../../../../../../services';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { isUserManager, isUserPlayer } from '../../../../../../utils/permissions';
import { collapseSidebar, expandSidebar } from '../../../../../../utils/sidebarUtils';
import './Formation.css';

const Formation = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { team: contextTeam, isManager: contextIsManager } = useOutletContext() || {};
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(contextIsManager || false);
  const [isPlayer, setIsPlayer] = useState(false);
  const [showTeamLogoOverlay, setShowTeamLogoOverlay] = useState(false);
  const { user } = useAuth();
  
  console.log('Formation: Initial context values:', { 
    contextTeam: contextTeam?.id || 'None', 
    contextIsManager: contextIsManager || false,
    userId: user?.id
  });

  // Memoize the team ID to prevent unnecessary re-renders
  const currentTeamId = useMemo(() => {
    return contextTeam?.id || teamId;
  }, [contextTeam?.id, teamId]);

  // Fetch players only when team ID changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchPlayers = async () => {
      if (!currentTeamId) return;
      
      try {
        setLoading(true);
        const response = await apiClient.get(`/teams/${currentTeamId}/players`);
        
        if (isMounted) {
          const playersData = response?.players || [];
          setPlayers(playersData);
          console.log('Formation: Fetched player data:', playersData.length);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching players:', error);
          setPlayers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPlayers();
    
    return () => {
      isMounted = false;
    };
  }, [currentTeamId]); // Only depend on currentTeamId

  // Listen for team membership changes
  useEffect(() => {
    const handleMembershipChanged = () => {
      // Refetch players when team membership changes
      if (currentTeamId) {
        const fetchPlayersUpdate = async () => {
          try {
            console.log('Formation: Refreshing player data after membership change');
            const response = await apiClient.get(`/teams/${currentTeamId}/players`);
            const playersData = response?.players || [];
            setPlayers(playersData);
            console.log('Formation: Updated player data after membership change:', playersData.length);
            
            // Force formation to update with new players
            window.dispatchEvent(new CustomEvent('playersUpdated', { 
              detail: { players: playersData, teamId: currentTeamId } 
            }));
            
          } catch (error) {
            console.error('Error updating players after membership change:', error);
          }
        };
        fetchPlayersUpdate();
      }
    };

    const handlePlayersChanged = (event) => {
      if (event.detail?.teamId === currentTeamId || !event.detail?.teamId) {
        handleMembershipChanged();
      }
    };

    const handleForceRefresh = (event) => {
      if (event.detail?.teamId === currentTeamId || !event.detail?.teamId) {
        console.log('Formation: Force refresh triggered:', event.detail?.reason || 'unknown');
        handleMembershipChanged();
      }
    };

    const handleReloadFormationData = (event) => {
      if (event.detail?.teamId === currentTeamId || !event.detail?.teamId) {
        console.log('Formation: Reload formation data triggered');
        // Additional delay to ensure backend has processed everything
        setTimeout(() => {
          handleMembershipChanged();
        }, 1000);
      }
    };

    window.addEventListener('teamMembershipChanged', handleMembershipChanged);
    window.addEventListener('teamPlayersChanged', handlePlayersChanged);
    window.addEventListener('squadMembersChanged', handleMembershipChanged);
    window.addEventListener('forceFormationRefresh', handleForceRefresh);
    window.addEventListener('reloadFormationData', handleReloadFormationData);
    
    return () => {
      window.removeEventListener('teamMembershipChanged', handleMembershipChanged);
      window.removeEventListener('teamPlayersChanged', handlePlayersChanged);
      window.removeEventListener('squadMembersChanged', handleMembershipChanged);
      window.removeEventListener('forceFormationRefresh', handleForceRefresh);
      window.removeEventListener('reloadFormationData', handleReloadFormationData);
    };
  }, [currentTeamId]);

  // Update roles only when relevant data changes
  useEffect(() => {
    if (!user?.id || !currentTeamId) return;

    const updateRoles = () => {
      const managerStatus = contextIsManager || isUserManager(user, currentTeamId);
      const playerStatus = isUserPlayer(user, currentTeamId);
      
      setIsManager(managerStatus);
      setIsPlayer(playerStatus);
      
      console.log('Formation: Final roles before render - manager:', managerStatus, 'player:', playerStatus);
    };

    updateRoles();
  }, [user?.id, currentTeamId, contextIsManager]); // Only update when these specific values change

  // Ensure sidebar is collapsed when Formation page loads
  useEffect(() => {
    console.log('Formation: Attempting to collapse sidebar');
    
    // Use a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      collapseSidebar();
    }, 50);
    
    return () => {
      clearTimeout(timer);
      // Don't expand here - let TeamSpace handle it
    };
  }, []); // Empty dependency array - only run once when component mounts

  const handleBack = () => {
    console.log('Formation: Expanding sidebar and navigating back');
    expandSidebar();
    navigate(`/teams/${teamId}/space`);
  };

  const handleTeamLogoClick = () => {
    setShowTeamLogoOverlay(true);
  };

  const handleInMatchRoles = () => {
    // Navigate to in-match roles or show functionality
    console.log('Navigate to In-Match Roles');
    navigate(`/teams/${teamId}/space/formation/in-match-roles`); // Corrected navigation

  };

  const handleEditPlayerNumber = () => {
    // Navigate to edit player numbers or show functionality
    console.log('Navigate to Edit Player Number');
    // navigate(`/teams/${teamId}/space/squad?edit=numbers`);
  };

  const handleLineups = () => {
    // Navigate to lineups or show functionality
    console.log('Navigate to Lineups');
    // navigate(`/teams/${teamId}/space/lineups`);
  };

  // Fallback: if user created the team, they should be manager
  useEffect(() => {
    if (!isManager && user && contextTeam && contextTeam.createdBy === user.id) {
      console.log('Formation: User is team creator, setting as manager');
      setIsManager(true);
    }
  }, [user, contextTeam, isManager]);

  console.log('Formation: Final roles before render - manager:', isManager, 'player:', isPlayer);

  if (loading) {
    return <div className="formation-loading">Loading formation...</div>;
  }

  // View mode - either manager, player, or viewer
  let viewMode = 'viewer';
  if (isManager) viewMode = 'manager';
  else if (isPlayer) viewMode = 'player';

  return (
    <div className="formation-page">
      <div className="page-header">
        <button className="back-button" onClick={handleBack}>
          &larr; Back
        </button>
        <h1 className="formation-title">
          Formation
          {viewMode === 'manager' && <span className="view-mode-label"> (Manager View)</span>}
          {viewMode === 'player' && <span className="view-mode-label"> (Player View)</span>}
          {viewMode === 'viewer' && <span className="view-mode-label"> (Viewer)</span>}
        </h1>
        <div className="header-spacer"></div>
      </div>
      <div className="formation-content">
        <div className="formation-layout">
          <div className="formation-team-logo-container">
            <button 
              className="formation-team-logo-button"
              onClick={handleTeamLogoClick}
              title="Team Options"
            >
              {contextTeam?.logoUrl ? (
                <img 
                  src={contextTeam.logoUrl} 
                  alt={contextTeam.name} 
                  className="formation-team-logo-img"
                />
              ) : (
                <div className="formation-team-logo-placeholder">
                  {contextTeam?.abbreviation || contextTeam?.name?.substring(0, 3).toUpperCase() || 'TM'}
                </div>
              )}
            </button>
          </div>
          <FormationContainer 
            teamId={teamId} 
            isManager={isManager}
            viewMode={viewMode}
            players={players} 
          />
        </div>
      </div>

      {/* Team Logo Overlay */}
      <TeamLogoOverlay
        isOpen={showTeamLogoOverlay}
        onClose={() => setShowTeamLogoOverlay(false)}
        teamLogo={contextTeam?.logoUrl}
        teamName={contextTeam?.name}
        teamAbbreviation={contextTeam?.abbreviation}
        onInMatchRoles={handleInMatchRoles}
        onEditPlayerNumber={handleEditPlayerNumber}
        onLineups={handleLineups}
      />
    </div>
  );
};

export default Formation;
