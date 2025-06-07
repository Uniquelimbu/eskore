import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { apiClient } from '../../../../services'; // Updated import path
import { isUserManager } from '../../../../utils/permissions';
import PageLayout from '../../../../components/PageLayout/PageLayout';
import './styles/index.css'; // Updated import to use the new modular CSS
import { useAuth } from '../../../../contexts/AuthContext';
import { autoCollapseSidebarForPath } from '../../../../utils/sidebarUtils';

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

  // Auto-collapse sidebar for TeamSpace sub-pages
  useEffect(() => {
    autoCollapseSidebarForPath(location.pathname);
    
    // Cleanup on unmount - expand sidebar when leaving TeamSpace
    return () => {
      if (!location.pathname.includes('/teams/') || location.pathname.includes('/teams') && !location.pathname.includes('/space/')) {
        import('../../../../utils/sidebarUtils').then(({ expandSidebar }) => {
          expandSidebar();
        });
      }
    };
  }, [location.pathname]);

  // Function to refresh team data
  const refreshTeam = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/teams/${teamId}`);
      console.log('TeamSpace: Team data received:', response);

      if (response && response.id) {
        setTeam(response);

        const isUserManagerFlag = isUserManager(response, user);
        console.log(`TeamSpace: Setting isManager to ${isUserManagerFlag} for user ${user?.id}`);
        setIsManager(isUserManagerFlag);
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

  // Initial load
  useEffect(() => {
    refreshTeam();
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

  // Context value with refreshTeam function
  const contextValue = {
    team,
    isManager,
    refreshTeam
  };

  return (
    <div className="team-space-layout">
      <div className="team-space-container" style={{ paddingTop: 0 }}>
        {/* Team Header - Only show on dashboard (isBasePath) */}
        {isBasePath && (
          <div className="team-space-header">
            <div className="team-identity-section">
              <div className="team-logo">
                {team?.logoUrl ? (
                  <img src={team.logoUrl} alt={`${team.name} logo`} />
                ) : (
                  <div className="team-logo-placeholder">
                    {team?.abbreviation || (team?.name ? team.name.substring(0, 3).toUpperCase() : 'T')}
                  </div>
                )}
              </div>
              <div className="team-details">
                <h1>{team?.name || 'Team Name'}</h1>
                {team?.nickname && <div className="team-nickname">{team.nickname}</div>}
                <div className="team-meta">
                  {team?.city && <span>{team.city}</span>}
                  {team?.foundedYear && <span>Est. {team.foundedYear}</span>}
                  {team?.teamIdentifier && <span className="team-identifier">{team.teamIdentifier}</span>}
                </div>
              </div>
            </div>
            <div className="team-actions">
              {/* Settings button removed */}
            </div>
          </div>
        )}

        <div className="team-space-main-content">
          {/* If a child route is active (e.g., squad, formation), render it via Outlet.
              Otherwise (on the base /teams/:teamId path), render the dashboard tiles. */}
          {isBasePath ? (
            <div className="container-layout">
              <div className="container-main clickable-tile" onClick={() => navigate(`/teams/${teamId}/space/formation`)}>
                <h2>Formation</h2>
              </div>
              
              <div className="container-right">
                <div className="container-top clickable-tile" onClick={() => navigate(`/teams/${teamId}/space/squad`)}>
                  <h2>Squad</h2>
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
            <Outlet context={contextValue} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamSpace;