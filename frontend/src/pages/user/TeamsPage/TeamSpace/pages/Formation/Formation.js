import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import FormationContainer from './components/FormationContainer';
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
        <div className="header-spacer"></div> {/* Keep this to maintain layout */}
      </div>
      <div className="formation-content">
        <FormationContainer 
          teamId={teamId} 
          isManager={isManager}
          viewMode={viewMode}
          players={players} 
        />
      </div>
    </div>
  );
};

export default Formation;
