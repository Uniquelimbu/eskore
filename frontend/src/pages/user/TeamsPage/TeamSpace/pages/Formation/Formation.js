import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { 
  FormationContainer 
} from '../../components/formation';
import apiClient from '../../../../../../services/apiClient';
import { useAuth } from '../../../../../../contexts/AuthContext';
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
              // Check manager status from various possible team structures
              const mgrRoles = ['manager', 'owner', 'admin'];
              let isUserManager = false;
              
              // Check UserTeam role
              if (teamResponse.UserTeam && teamResponse.UserTeam.role) {
                isUserManager = mgrRoles.includes(teamResponse.UserTeam.role.toLowerCase());
              }
              
              // Check direct role properties
              if (!isUserManager && teamResponse.userRole) {
                isUserManager = mgrRoles.includes(teamResponse.userRole.toLowerCase());
              }
              
              if (!isUserManager && teamResponse.role) {
                isUserManager = mgrRoles.includes(teamResponse.role.toLowerCase());
              }
              
              // Check members array
              if (!isUserManager && Array.isArray(teamResponse.members)) {
                const membership = teamResponse.members.find(m => 
                  (m.userId === user.id) || (m.id === user.id)
                );
                if (membership && membership.role) {
                  isUserManager = mgrRoles.includes(membership.role.toLowerCase());
                }
              }
              
              // Check Users array
              if (!isUserManager && Array.isArray(teamResponse.Users)) {
                const userEntry = teamResponse.Users.find(u => u.id === user.id);
                if (userEntry && userEntry.UserTeam && userEntry.UserTeam.role) {
                  isUserManager = mgrRoles.includes(userEntry.UserTeam.role.toLowerCase());
                }
              }
              
              console.log(`Formation: Determined manager status: ${isUserManager}`);
              setIsManager(isUserManager);
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
          &larr; Back to Team Space
        </button>
        <h1>Formation {isManager ? '(Manager View)' : '(Viewer)'}</h1>
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
