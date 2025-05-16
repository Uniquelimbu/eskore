import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../contexts/AuthContext';
import apiClient from '../../../../services/apiClient';
import PageLayout from '../../../../components/PageLayout/PageLayout';
// Import pages directly rather than rendering conditionally
import './TeamSpace.css';
// Remove Overview import since we're removing this section
import Squad from './pages/Squad/Squad';
import Formation from './pages/Formation/Formation';
import Calendar from './pages/Calendar/Calendar';
import Settings from './pages/Settings/Settings';
// Removed TeamSpaceOverview import

const TeamSpace = () => {
  // Support multiple route parameter names (teamId or id) for robustness
  const params = useParams();
  // Prefer `teamId` but gracefully fall back to `id` if that is what the route provided
  const teamId = params.teamId || params.id;
  const { user, verifyUserData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [team, setTeam] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTransferManagerModal, setShowTransferManagerModal] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [selectedNewManager, setSelectedNewManager] = useState(null);
  
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
  
  // Fetch team data
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
        
        // Method 1: Check in response.Users array
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
        
        // Method 2: Check if user is the team creator/owner
        if (!userRoleFound && (response.createdBy === user.id || response.ownerId === user.id)) {
          console.log('User is team creator/owner, setting role to manager');
          userRoleFound = 'manager';
        }
        
        // Get all team members
        console.log(`Fetching members for team ID: ${teamId}`);
        const membersResponse = await apiClient.get(`/api/teams/${teamId}/members`);
        console.log('Members response:', membersResponse);
        
        // Method 3: Check in membersResponse data
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
            // If user is the only member, they should be manager
            else if (membersResponse.members.length === 1) {
              userRoleFound = 'manager';
              console.log('User is the only team member, setting role to manager');
            }
            // Default to athlete as last resort if we can confirm membership but no role
            else {
              userRoleFound = 'athlete';
              console.log('User found in members but no role info, defaulting to athlete');
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
                UserTeam: { ...(member.UserTeam || {}), role: userRoleFound }
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
        setLoading(false);
      } catch (err) {
        console.error('Error fetching team data:', err);
        // Provide more detailed error message based on the error
        let errorMessage = 'Failed to load team information. Please try again.';
        if (err.status === 404) {
          errorMessage = `Team with ID ${teamId} not found`;
        } else if (err.status === 401) {
          errorMessage = 'You are not authorized to view this team';
        } else if (err.message) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        setLoading(false);
      }
    };
    
    if (teamId && user && user.id) {
      fetchTeamData();
    } else if (teamId && (!user || !user.id)) {
      console.log('TeamSpace: Waiting for user data to be validated before fetching team data.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, user]);

  // Consolidated isManager calculation
  const isManager = userRole === 'manager' || userRole === 'owner';
  console.log(`TeamSpace calculated isManager: ${isManager} (userRole: '${userRole || "null/undefined"}')`);
  
  const otherMembers = members.filter(m => m.id !== user?.id);
  
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

  // Determine if we are currently at the overview (root) path for TeamSpace
  const atOverview = location.pathname === `/teams/${teamId}/space` || location.pathname === `/teams/${teamId}`;

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
    <PageLayout className="team-space-page-layout">
      {loading && <p>Loading team space...</p>}
      {error && <p className="error-message">Error: {error.message || 'Could not load team data.'}</p>}
      {team && !loading && !error && (
        <div className="team-space-container">
          {/* TeamSpaceSidebar component removed */}
          <main className="team-space-main-content">
            <div className="team-header">
              <h1>{team.name}</h1>
              {isManager && (
                <button 
                  className="settings-button"
                  onClick={navigateToSettings}
                >
                  <i className="fas fa-cog"></i> Settings
                </button>
              )}
              <button 
                className="leave-button"
                onClick={handleLeaveTeam}
              >
                Leave Team
              </button>
            </div>
            {!atOverview && (
            <div className="team-navigation">
              <button 
                onClick={() => navigate(`/teams/${teamId}/space/squad`)}
                className={location.pathname.includes('/squad') ? 'active' : ''}
              >
                <i className="fas fa-users"></i> Squad
              </button>
              <button 
                onClick={() => navigate(`/teams/${teamId}/space/formation`)}
                className={location.pathname.includes('/formation') ? 'active' : ''}
              >
                <i className="fas fa-project-diagram"></i> Formation
              </button>
              <button 
                onClick={() => navigate(`/teams/${teamId}/space/calendar`)}
                className={location.pathname.includes('/calendar') ? 'active' : ''}
              >
                <i className="fas fa-calendar-alt"></i> Calendar
              </button>
              {isManager && (
                <button 
                  onClick={() => navigate(`/teams/${teamId}/space/settings`)}
                  className={location.pathname.includes('/settings') ? 'active' : ''}
                >
                  <i className="fas fa-cog"></i> Settings
                </button>
              )}
            </div>
            )}
            <Routes>
              {/* Replace TeamSpaceOverview with redirect to squad */}
              <Route index element={<Navigate to="squad" replace />} />
              <Route path="squad" element={<Squad team={team} members={members} isManager={isManager} />} />
              <Route path="formation" element={<Formation team={team} members={members} isManager={isManager} />} />
              <Route path="calendar" element={<Calendar team={team} members={members} isManager={isManager} />} />
              {isManager && (
                <Route path="settings" element={<Settings team={team} members={members} isManager={isManager} />} />
              )}
              <Route path="*" element={<Navigate to="squad" replace />} />
            </Routes>
          </main>
        </div>
      )}
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