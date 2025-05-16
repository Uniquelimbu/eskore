import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import apiClient from '../../../../services/apiClient';
import PageLayout from '../../../../components/PageLayout/PageLayout';
import './TeamSpace.css';
import { useAuth } from '../../../../contexts/AuthContext';

const TeamSpace = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [isManager, setIsManager] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isBasePath = location.pathname === `/teams/${teamId}/space`;

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/api/teams/${teamId}`);
        console.log('TeamSpace: Team data received:', response);

        if (response && response.id) {
          setTeam(response);

          // Enhanced function to determine manager status with detailed logging
          const determineIsManager = (teamData, currentUser) => {
            if (!teamData || !currentUser) {
              console.log('TeamSpace: Missing team data or user data');
              return false;
            }
            
            // Additional check - if user created the team, they're automatically a manager
            // Handle multiple potential creator fields (createdBy, creatorId, ownerId)
            const creatorIds = [teamData.createdBy, teamData.creatorId, teamData.ownerId];
            if (creatorIds.some(id => id === currentUser.id)) {
              console.log(`TeamSpace: User is team creator/owner (creatorId match)`);
              return true;
            }
            
            const mgrRoles = ['manager', 'owner', 'admin'];
            console.log(`TeamSpace: Checking if user ${currentUser.id} is a manager of team ${teamData.id}`);
            
            // Direct properties on user
            if (teamData.userRole && mgrRoles.includes(teamData.userRole.toLowerCase())) {
              console.log(`TeamSpace: User is manager through userRole: ${teamData.userRole}`);
              return true;
            }
            
            if (teamData.role && mgrRoles.includes(teamData.role.toLowerCase())) {
              console.log(`TeamSpace: User is manager through role: ${teamData.role}`);
              return true;
            }

            // Check UserTeam association if available
            if (teamData.UserTeam && teamData.UserTeam.role && 
                mgrRoles.includes(teamData.UserTeam.role.toLowerCase())) {
              console.log(`TeamSpace: User is manager through UserTeam role: ${teamData.UserTeam.role}`);
              return true;
            }

            // Check members array with nested role/userId
            if (Array.isArray(teamData.members)) {
              const membership = teamData.members.find(m => (m.userId || m.id) === currentUser.id);
              if (membership && membership.role && mgrRoles.includes(membership.role.toLowerCase())) {
                console.log(`TeamSpace: User is manager through members array with role: ${membership.role}`);
                return true;
              }
            }

            // Check Users array from team response
            if (Array.isArray(teamData.Users)) {
              const userEntry = teamData.Users.find(u => u.id === currentUser.id);
              if (userEntry && userEntry.UserTeam && 
                  mgrRoles.includes(userEntry.UserTeam.role.toLowerCase())) {
                console.log(`TeamSpace: User is manager through Users array with role: ${userEntry.UserTeam.role}`);
                return true;
              }
            }

            // Separate managers array
            if (Array.isArray(teamData.managers)) {
              if (teamData.managers.some(mgr => (mgr.userId || mgr.id) === currentUser.id)) {
                console.log(`TeamSpace: User is manager through managers array`);
                return true;
              }
            }
            
            console.log('TeamSpace: User is NOT a manager of this team');
            return false;
          };

          const isUserManager = determineIsManager(response, user);
          console.log(`TeamSpace: Setting isManager to ${isUserManager} for user ${user?.id}`);
          setIsManager(isUserManager);
        } else {
          console.error('Received unexpected data structure for team. Expected team object, got:', response);
          throw new Error('Team data not found in response or response format is incorrect.');
        }
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Failed to load team information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (teamId && user) {
      fetchTeamData();
    } else {
      console.log('TeamSpace: Missing teamId or user, cannot fetch team data');
    }
  }, [teamId, user]);

  const handleBackClick = () => {
    navigate('/teams');
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading team space...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleBackClick} className="back-button">
          Back to Teams
        </button>
      </div>
    );
  }

  return (
    <div className="team-space-layout">
      <PageLayout 
        className="team-space-content-wrapper" 
        withPadding={true} 
        maxWidth="var(--content-max-width)"
      >
        {/* Team Header */}
        <div className="team-space-header">
          <div className="team-identity-section">
            <div className="team-logo">
              {team?.logoUrl ? (
                <img src={team.logoUrl} alt={`${team.name} logo`} />
              ) : (
                <div className="team-logo-placeholder">
                  {team?.name?.charAt(0) || 'T'}
                </div>
              )}
            </div>
            <div className="team-details">
              <h1>{team?.name || 'Team Name'}</h1>
              {team?.nickname && <div className="team-nickname">{team.nickname}</div>}
              <div className="team-meta">
                {team?.city && <span>{team.city}</span>}
                {team?.foundedYear && <span>Est. {team.foundedYear}</span>}
              </div>
            </div>
          </div>
          <div className="team-actions">
            {isManager && (
              <button 
                className="settings-button"
                onClick={() => navigate(`/teams/${teamId}/space/settings`)}
              >
                Settings
              </button>
            )}
          </div>
        </div>

        {/* If a child route is active (e.g., squad, formation), render it via Outlet.
            Otherwise (on the base /teams/:teamId path), render the dashboard tiles. */}
        {isBasePath ? (
          <div className="container-layout">
            <div className="container-main clickable-tile" onClick={() => navigate(`/teams/${teamId}/space/squad`)}>
              <h2>Squad</h2>
              <p>Manage your team members</p>
            </div>
            
            <div className="container-right">
              <div className="container-top clickable-tile" onClick={() => navigate(`/teams/${teamId}/space/formation`)}>
                <h2>Formation</h2>
                <p>Set up your team's formation</p>
              </div>
              
              <div className="container-bottom-grid">
                <div className="container-small clickable-tile" onClick={() => navigate(`/teams/${teamId}/space/calendar`)}>
                  <h3>Calendar</h3>
                </div>
                
                <div className="container-small clickable-tile" onClick={() => navigate(`/teams/${teamId}/space/settings`)}>
                  <h3>Settings</h3>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Outlet context={{ 
            team, 
            isManager, 
            userId: user?.id,
            // Add explicit flags to help debug
            isTeamLoaded: !!team,
            managerStatus: isManager
          }} />
        )}
      </PageLayout>
    </div>
  );
};

export default TeamSpace;