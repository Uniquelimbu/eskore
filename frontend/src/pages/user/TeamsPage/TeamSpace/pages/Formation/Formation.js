import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { 
  FormationContainer 
} from './components';
import apiClient from '../../../../../../services/apiClient';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { isUserManager } from '../../../../../../utils/permissions';
import './Formation.css';

const Formation = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { team: contextTeam, isManager: contextIsManager } = useOutletContext() || {};
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(contextIsManager || false);
  const { user } = useAuth();
  
  console.log('Formation: Initial context values:', { 
    contextTeam: contextTeam?.id || 'None', 
    contextIsManager: contextIsManager || false,
    userId: user?.id
  });

  // Double check manager status
  useEffect(() => {
    const verifyManagerStatus = async () => {
      try {
        if (user && teamId) {
          console.log('Formation: Verifying manager status for team', teamId);
          
          // Get team data directly if not provided in context
          if (!contextTeam || contextIsManager === undefined) {
            const teamResponse = await apiClient.get(`/api/teams/${teamId}`);
            
            if (teamResponse && teamResponse.id) {
              const isMgr = isUserManager(teamResponse, user);
              console.log(`Formation: Determined manager status: ${isMgr}`);
              setIsManager(isMgr);
            }
          } else {
            // Use the context value if available
            setIsManager(!!contextIsManager);
            console.log(`Formation: Using context manager status: ${contextIsManager}`);
          }
        }
      } catch (error) {
        console.error('Error verifying manager status:', error);
        // If we can't verify, we'll fall back to the context value
      }
    };
    
    // If team creator or already have manager status, set it directly
    if (contextIsManager) {
      setIsManager(true);
      console.log('Formation: Using manager status from context:', contextIsManager);
    } else {
      verifyManagerStatus();
    }
  }, [teamId, user, contextTeam, contextIsManager]);

  useEffect(() => {
    // Fetch players data
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        // API call should go here instead of mock data
        // Example:
        // const response = await apiClient.get(`/api/teams/${teamId}/players`);
        // setPlayers(response.data);
        
        // Temporary empty array until API integration
        setPlayers([]);
      } catch (error) {
        console.error('Error fetching player data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
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

  console.log('Formation: Final manager status before render:', isManager);

  if (loading) {
    return <div className="formation-loading">Loading formation...</div>;
  }

  return (
    <div className="formation-page">
      <div className="page-header">
        <button className="back-button" onClick={handleBack}>
          &larr; Back
        </button>
        <h1 className="formation-title">Formation {isManager ? '(Manager View)' : '(Viewer)'}</h1>
        <div className="header-spacer"></div> {/* Empty div for flex alignment */}
      </div>
      <div className="formation-content">
        <FormationContainer 
          teamId={teamId} 
          isManager={isManager} 
          players={players} 
        />
      </div>
    </div>
  );
};

export default Formation;
