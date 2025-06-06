import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import FormationContainer from './components/FormationContainer';
import { apiClient } from '../../../../../../services'; // Updated import path
import { useAuth } from '../../../../../../contexts/AuthContext';
import { isUserManager, isUserPlayer } from '../../../../../../utils/permissions';
import './Formation.css';

const Formation = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
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

  // Verify user roles
  useEffect(() => {
    const verifyUserRoles = async () => {
      try {
        if (user && teamId) {
          console.log('Formation: Verifying user roles for team', teamId);
          
          // Get team data directly if not provided in context
          let isMgr = contextIsManager;
          let isPlyr = false;
          
          if (!contextTeam || contextIsManager === undefined) {
            const teamResponse = await apiClient.get(`/api/teams/${teamId}`);
            
            if (teamResponse && teamResponse.id) {
              isMgr = isUserManager(teamResponse, user);
              isPlyr = isUserPlayer(teamResponse, user);
              
              console.log(`Formation: Determined roles - manager: ${isMgr}, player: ${isPlyr}`);
              setIsManager(isMgr);
              setIsPlayer(isPlyr);
            }
          } else {
            // Use the context values if available but also check player status
            setIsManager(!!contextIsManager);
            
            // Determine if user is a player
            const isPlayerInTeam = isUserPlayer(contextTeam, user);
            setIsPlayer(isPlayerInTeam);
            
            console.log(`Formation: Using context/check - manager: ${contextIsManager}, player: ${isPlayerInTeam}`);
          }
        }
      } catch (error) {
        console.error('Error verifying user roles:', error);
        // If we can't verify, we'll fall back to the context value for manager
        // and assume not a player
        setIsPlayer(false);
      }
    };
    
    verifyUserRoles();
  }, [teamId, user, contextTeam, contextIsManager]);

  useEffect(() => {
    // Fetch players data - refresh when team members change
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        // Get players with their associated player details
        const response = await apiClient.get(`/teams/${teamId}/players`);
        
        if (response && Array.isArray(response.players)) {
          setPlayers(response.players);
          console.log('Formation: Fetched player data:', response.players.length);
        } else {
          setPlayers([]);
          console.warn('Formation: Invalid or empty player response');
        }
      } catch (error) {
        console.error('Error fetching player data:', error);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
    
    // Set up polling to refresh players when new members are added
    const pollInterval = setInterval(fetchPlayers, 30000); // Poll every 30 seconds
    
    return () => clearInterval(pollInterval);
  }, [teamId]);

  const handleBack = () => {
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
