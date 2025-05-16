import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../contexts/AuthContext';
import apiClient from '../../../../services/apiClient';
import PageLayout from '../../../../components/PageLayout/PageLayout';
// Import pages directly rather than rendering conditionally
import './TeamSpace.css';
import Overview from './pages/Overview/Overview';
// Update the Squad import to correctly point to the file within the Squad directory
import Squad from './pages/Squad/Squad';
import Formation from './pages/Formation/Formation';
import Calendar from './pages/Calendar/Calendar';
// We'll still import Settings but we'll navigate to it rather than render it as a tab
import Settings from './pages/Settings/Settings';

const TeamSpace = () => {
  const { teamId } = useParams();
  const { user, verifyUserData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Add this to access the current location
  const [team, setTeam] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTransferManagerModal, setShowTransferManagerModal] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [selectedNewManager, setSelectedNewManager] = useState(null);
  const isMounted = useRef(true);
  
  // Remove tab-related logic and state
  // Navigate to settings page
  const navigateToSettings = () => {
    navigate(`/teams/${teamId}/settings`);
  };
  
  // Robust user authentication and refresh logic in a single effect
  useEffect(() => {
    const validateAndRefreshUser = async () => {
      if (!user || !user.id) {
        console.warn('TeamSpace: User data is incomplete or missing. Attempting to refresh auth state...');
        try {
          // Try to refresh the user data from the auth context
          const refreshedUser = await verifyUserData(true);
          if (!refreshedUser || !refreshedUser.id) {
            // If still not valid, try to refresh from API directly as a fallback
            const token = localStorage.getItem('token');
            if (!token) {
              toast.error('Your session has expired. Please log in again.');
              navigate('/login');
              return;
            }
            try {
              const response = await apiClient.get('/api/auth/me');
              if (response && response.id) {
                console.log('TeamSpace: Successfully refreshed user data from API');
                // Optionally update context here if needed
              } else {
                toast.error('Unable to verify your identity. Please log in again.');
                navigate('/login');
              }
            } catch (err) {
              console.error('TeamSpace: Failed to refresh user data from API', err);
              toast.error('Authentication error. Please log in again.');
              navigate('/login');
            }
          } else {
            console.log('TeamSpace: Successfully refreshed user data from context:', refreshedUser);
          }
        } catch (error) {
          console.error('TeamSpace: Error refreshing auth state:', error);
          toast.error('Session expired. Please login again.');
          navigate('/login');
        }
      }
    };

    validateAndRefreshUser(); // Call the function

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, verifyUserData]);

  // Wrap fetchTeamData in useCallback to prevent unnecessary re-renders
  const fetchTeamData = useCallback(async () => {
    try {
      setError(null);
      
      // If circuit breaker is open, wait before making new requests
      if (window.circuitBreakerOpen) {
        setError({
          status: 0,
          message: 'Backend server appears to be down. Reconnection paused to prevent flickering.',
          code: 'CIRCUIT_OPEN'
        });
        return;
      }
      
      const response = await apiClient.get(`/api/teams/${teamId}`);
      // Process successful response
      if (isMounted.current) {
        setTeam(response.data);
        setLoading(false);
      }
    } catch (err) {
      // Prevent UI flickering by maintaining stable error state
      if (err.circuitOpen) {
        window.circuitBreakerOpen = true;
        
        // Set a timeout to try again after circuit reset time
        setTimeout(() => {
          window.circuitBreakerOpen = false;
          // Only attempt to refetch if component is still mounted
          if (isMounted.current) {
            fetchTeamData();
          }
        }, 30000); // 30 seconds matches circuit breaker reset time
      }
      
      if (isMounted.current) {
        setError(err);
        setLoading(false);
      }
      console.error('Error fetching team data:', err);
    }
  }, [teamId]); // Add teamId as dependency

  // Replace your existing useEffect for fetching data with this improved version
  useEffect(() => {
    const isMounted = { current: true };
    
    if (teamId) {
      fetchTeamData();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [teamId, fetchTeamData]); // fetchTeamData is now stable thanks to useCallback

  // Fetch team data - modify to depend on validated user
  useEffect(() => {
    const fetchTeamData = async () => {
      // Only proceed if user is authenticated with a valid ID
      if (!user || !user.id) {
        console.warn('TeamSpace: Skipping team data fetch due to missing user ID. User:', user);
        setLoading(false); // Ensure loading is stopped if we return early
        return;
      }
      
      try {
        setLoading(true);
        console.log(`Fetching team data for ID: ${teamId} with User ID: ${user.id}`);
        
        const response = await apiClient.get(`/api/teams/${teamId}`);
        
        console.log('Team data raw response:', response);
        
        if (!response || typeof response !== 'object') {
          console.error('Invalid team response format:', response);
          setError('Invalid team data received');
          setTeam(null); // Clear previous team data
          setUserRole(null); // Clear previous role
          setLoading(false);
          return;
        }
        
        setTeam(response);
        
        // Determine user's role in the team from team data
        let userRoleFound = null;
        if (response.Users && Array.isArray(response.Users)) {
          console.log(`Current user ID from context: ${user?.id} (type: ${typeof user?.id})`);
          console.log('Team users from API:', JSON.stringify(response.Users.map(u => ({id: u.id, type: typeof u.id, role: u.UserTeam?.role}))));

          // First, try to find using strict equality
          let userMembership = response.Users.find(u => u.id === user?.id);
          
          // If not found, try converting IDs to strings for comparison
          if (!userMembership) {
            console.log('User not found with strict comparison, trying string comparison');
            userMembership = response.Users.find(u => String(u.id) === String(user?.id));
          }
          
          console.log('User membership found:', userMembership);
          
          if (userMembership && userMembership.UserTeam) {
            console.log(`User role from UserTeam: '${userMembership.UserTeam.role}'`);
            userRoleFound = userMembership.UserTeam.role;
          } else {
            console.warn('User not found in team members list or UserTeam data missing in team response.');
          }
        } else {
          console.warn('No Users array in team response or Users is not an array.');
        }
        
        // Get all team members
        console.log(`Fetching members for team ID: ${teamId}`);
        const membersResponse = await apiClient.get(`/api/teams/${teamId}/members`);
        console.log('Members response:', membersResponse);
        
        // Try to find user role in members data if not found in team data
        if (!userRoleFound && membersResponse && membersResponse.members) {
          // Try exact match first
          let currentUserInMembers = membersResponse.members.find(m => m.id === user?.id);
          
          // If not found, try string comparison
          if (!currentUserInMembers) {
            console.log('User not found in members with strict comparison, trying string comparison');
            currentUserInMembers = membersResponse.members.find(m => String(m.id) === String(user?.id));
          }
          
          console.log('Current user in members:', currentUserInMembers);
          
          if (currentUserInMembers) {
            // Check different possible locations for role data
            if (currentUserInMembers.UserTeam && currentUserInMembers.UserTeam.role) {
              userRoleFound = currentUserInMembers.UserTeam.role;
              console.log(`Found user role from members response UserTeam: ${userRoleFound}`);
            } 
            // Check if role is available as a direct property
            else if (currentUserInMembers.role) {
              userRoleFound = currentUserInMembers.role;
              console.log(`Found user role from direct property: ${userRoleFound}`);
            }
            // Special fallback cases
            else if (response.createdBy === user.id || response.ownerId === user.id) {
              userRoleFound = 'manager';
              console.log('User is team creator, setting role to manager');
            }
            else if (membersResponse.members.length === 1) {
              userRoleFound = 'manager';
              console.log('User is the only team member, assuming role is manager');
            }
          }
        }
        
        // Final fallback - if still no role found but user clearly has team access
        if (!userRoleFound && team) {
          console.log('No explicit role found but user can access team, defaulting to athlete');
          userRoleFound = 'athlete';  // Default fallback role
        }
        
        // Update state with found role
        setUserRole(userRoleFound);
        
        // Update members array from response
        if (membersResponse && membersResponse.members) {
          // Ensure each member has role information
          const processedMembers = membersResponse.members.map(member => {
            // If this is the current user and we found a role, make sure it's included
            if (String(member.id) === String(user?.id) && userRoleFound) {
              return {
                ...member,
                role: userRoleFound, // Add role as direct property for compatibility
                UserTeam: { ...member.UserTeam, role: userRoleFound } // Update nested structure if it exists
              };
            }
            return member;
          });
          
          setMembers(processedMembers);
        } else {
          console.warn('No members array in response:', membersResponse);
          setMembers([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching team data:', err);
        // Provide more detailed error message based on the error
        let errorMessage = 'Failed to load team information. Please try again.';
        if (err.status === 404) {
          errorMessage = `Team with ID ${teamId} not found`;
        } else if (err.status === 401) {
          errorMessage = 'You are not authorized to view this team';
        } else if (err.message) {
          errorMessage = `Error: ${err.message}`;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    if (teamId && user && user.id) { // Ensure user.id is explicitly checked here
      fetchTeamData();
    } else if (teamId && (!user || !user.id)) {
      console.log('TeamSpace: Waiting for user data to be validated before fetching team data.');
      // setLoading(true); // Optionally keep loading true until user is validated
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, user]); // Disable ESLint warning
  
  const isManager = userRole === 'manager' || userRole === 'owner'; // Note: 'owner' is not in current UserTeam model enum
  console.log(`TeamSpace calculated isManager: ${isManager} (userRole: '${userRole || "null/undefined"}')`); // Improved log
  const otherMembers = members.filter(m => m.id !== user?.id);
  
  const handleInviteMember = () => {
    navigate(`/teams/${teamId}/invite`);
  };
  
  // Helper: remove the current user from the team then navigate out
  const leaveTeam = async () => {
    try {
      const response = await apiClient.delete(`/api/teams/${teamId}/members/${user.id}`);
      if (response.success) {
        toast.success('You have left the team');
        navigate('/teams');
      }
    } catch (err) {
      console.error('Error leaving team:', err);
      toast.error(err.response?.data?.message || 'Failed to leave team');
      throw err; // rethrow so callers know it failed
    }
  };

  const handleLeaveTeam = async () => {
    // Case 1: Manager with other members -> must transfer role first
    if (isManager && members.length > 1) {
      setShowTransferManagerModal(true);
      return;
    }

    // Case 2: Sole remaining member (manager or not) -> confirm that team will be deleted
    if (members.length === 1) {
      // We'll handle this in the Settings component
      navigate(`/teams/${teamId}/space/settings`);
      return;
    }

    // Case 3: Regular member (not last one) can leave directly
    await leaveTeam();
  };

  const handleTransferManager = async () => {
    if (!selectedNewManager) {
      toast.error('Please select a team member to transfer manager role to');
      return;
    }
    
    try {
      setIsTransferring(true);
      const response = await apiClient.post(`/api/teams/${teamId}/transfer-manager`, {
        newManagerId: selectedNewManager
      });
      
      if (response.success) {
        toast.success('Manager role transferred successfully');
        setShowTransferManagerModal(false);
        // Immediately leave the team now that role has been transferred
        await leaveTeam();
        return; // exit handler; navigation already performed
      }
    } catch (err) {
      console.error('Error transferring manager role:', err);
      toast.error(err.response?.data?.message || 'Failed to transfer manager role');
    } finally {
      setIsTransferring(false);
    }
  };

  // Navigate to specific detail page - updated to maintain structure
  const navigateToDetail = (path) => {
    navigate(`/teams/${teamId}/space/${path}`);
  };

  // Create navigation buttons for the team space home view - this is now the primary navigation
  const renderNavigationButtons = () => {
    const navItems = [
      { id: 'overview', label: 'Overview', icon: 'fas fa-home' },
      { id: 'squad', label: 'Squad', icon: 'fas fa-users' },
      { id: 'formation', label: 'Formation', icon: 'fas fa-futbol' },
      { id: 'calendar', label: 'Calendar', icon: 'fas fa-calendar-alt' },
    ];
    
    // Only add settings for managers
    if (isManager) {
      navItems.push({ id: 'settings', label: 'Settings', icon: 'fas fa-cog' });
    }
    
    return (
      <div className="team-navigation-buttons">
        {navItems.map(item => (
          <button 
            key={item.id}
            className="navigation-button"
            onClick={() => navigateToDetail(item.id)}
          >
            <i className={`${item.icon} nav-icon`}></i>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    );
  };

  // Updated method to determine if we're on a specific page or the main dashboard
  const isSpecificPage = () => {
    // Get the path after /teams/:teamId/space/
    const pathSegments = location.pathname.split('/');
    const spaceIndex = pathSegments.findIndex(segment => segment === 'space');
    
    // If we're at /teams/:teamId/space exactly (no additional segments), we're on the main dashboard
    return spaceIndex >= 0 && pathSegments.length > spaceIndex + 1;
  };

  if (loading) {
    return (
      <PageLayout className="team-space-content" maxWidth="1200px" withPadding={true}>
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading team information...</p>
        </div>
      </PageLayout>
    );
  }
  
  if (error || !team) {
    return (
      <PageLayout className="team-space-content" maxWidth="1200px" withPadding={true}>
        <div className="error-message">
          {error || 'Team not found'}
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout className="team-space-content" maxWidth="1200px" withPadding={true}>
      {/* Only show the team header and dashboard when NOT on a specific page */}
      {!isSpecificPage() && (
        <>
          <div className="team-space-header">
            <div className="team-identity-section">
              {team.logoUrl ? (
                <img src={team.logoUrl} alt={`${team.name} logo`} className="team-logo" />
              ) : (
                <div className="team-logo-placeholder">
                  {team.abbreviation || team.name.substring(0, 3)}
                </div>
              )}
              <div className="team-details">
                <h1>
                  {team.name} 
                  {team.abbreviation && <span className="team-abbreviation">[{team.abbreviation}]</span>}
                </h1>
                {team.nickname && <p className="team-nickname">{team.nickname}</p>}
                <p className="team-founded">Est. {team.foundedYear || new Date().getFullYear()}</p>
                <div className="team-meta">
                  <span className="team-city">{team.city}</span>
                </div>
              </div>
            </div>

            <div className="team-quick-stats">
              <div className="stat-item">
                <span className="stat-value">Members: {members.length}/30</span>
              </div>
            </div>

            <div className="team-actions">
              {isManager ? (
                <>
                  <button className="action-button primary" onClick={handleInviteMember}>
                    <i className="fas fa-user-plus"></i> Invite Players
                  </button>
                  <button className="action-button secondary" onClick={navigateToSettings}>
                    <i className="fas fa-cog"></i> Team Settings
                  </button>
                </>
              ) : (
                <>
                  <button className="action-button secondary" onClick={handleLeaveTeam}>
                    <i className="fas fa-sign-out-alt"></i> Leave Team
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Main navigation area - only shown on home route */}
          <div className="team-space-home-content">
            <h2 className="team-space-home-title">Team Dashboard</h2>
            <p className="team-space-home-subtitle">Manage your team and view important information</p>
            
            {renderNavigationButtons()}
          </div>
        </>
      )}
      
      {/* Content area for the routes - always shown */}
      <div className="team-content">
        <Routes>
          <Route path="overview" element={<Overview team={team} members={members} isManager={isManager} />} />
          <Route path="squad" element={<Squad team={team} members={members} isManager={isManager} />} />
          <Route path="formation" element={<Formation team={team} members={members} isManager={isManager} />} />
          <Route path="calendar" element={<Calendar team={team} members={members} isManager={isManager} />} />
          {isManager && (
            <Route path="settings" element={<Settings team={team} members={members} isManager={isManager} />} />
          )}
          {/* Don't automatically redirect from the root path - just show the dashboard */}
          <Route path="/" element={null} />
          <Route path="*" element={<Navigate to={`/teams/${teamId}/space/overview`} replace />} />
        </Routes>
      </div>

      {/* Transfer manager modal */}
      {showTransferManagerModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h3>Transfer Manager Role</h3>
            <p>As the team manager, you must transfer your role before leaving the team.</p>
            <p>Select a new manager:</p>
            
            <div className="member-select-container">
              {otherMembers.length > 0 ? (
                <select 
                  className="member-select"
                  value={selectedNewManager || ''}
                  onChange={(e) => setSelectedNewManager(e.target.value)}
                >
                  <option value="">Select a team member</option>
                  {otherMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="error-message">No other members available to transfer role to.</p>
              )}
            </div>
            
            <div className="modal-buttons">
              <button 
                className="cancel-button"
                onClick={() => setShowTransferManagerModal(false)}
                disabled={isTransferring}
              >
                Cancel
              </button>
              <button 
                className="primary-button"
                onClick={handleTransferManager}
                disabled={isTransferring || !selectedNewManager}
              >
                {isTransferring ? <><i className="fas fa-spinner fa-spin"></i> Transferring...</> : 'Transfer & Leave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default TeamSpace;
