import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { JoinTeamDialog } from '../components';
import { apiClient } from '../../../../../services'; // Updated import path
import PageLayout from '../../../../../components/layout/PageLayout/PageLayout';
import Loading from '../../../../../components/ui/Loading/Loading';
import './TeamOverviewPage.css';

const TeamOverviewPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/teams/${teamId}`);
        setTeam(response);
      } catch (err) {
        console.error('Error fetching team details:', err);
        setError('Failed to load team information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [teamId]);

  // Add this useEffect to check for pending requests
  useEffect(() => {
    const checkPendingRequests = async () => {
      if (!team) return;
      
      try {
        const userResponse = await apiClient.get('/auth/me');
        const currentUserId = userResponse?.id;
        
        if (!currentUserId) return;
        
        const notificationsResponse = await apiClient.get('/notifications', {
          params: { status: 'all', limit: 100 }
        });
        
        if (notificationsResponse && notificationsResponse.notifications) {
          const pendingRequest = notificationsResponse.notifications.find(
            notification => 
              notification.type === 'join_request' &&
              notification.teamId === team.id &&
              notification.senderUserId === currentUserId &&
              (notification.status === 'unread' || notification.status === 'read')
          );
          
          setHasPendingRequest(!!pendingRequest);
        }
      } catch (error) {
        console.error('Error checking pending requests:', error);
      }
    };
    
    checkPendingRequests();
  }, [team]);

  const handleBackClick = () => {
    // Go back to search results
    navigate(-1);
  };

  const handleJoinClick = () => {
    setShowJoinDialog(true);
  };

  const handleJoinSubmit = async (joinData) => {
    try {
      // If we get a success response but with pendingApproval flag, 
      // show a different message and don't navigate
      if (joinData.success && joinData.pendingApproval) {
        // Set pending request state immediately
        setHasPendingRequest(true);
        // Close dialog
        setShowJoinDialog(false);
      } else {
        // This would be the direct join path, unlikely to be used now
        if (joinData.success) {
          toast.success('You have successfully joined the team!');
          setShowJoinDialog(false);
          navigate(`/teams/${teamId}/space`);
        } else {
          setError('Failed to join team. Please try again.');
          setShowJoinDialog(false);
        }
      }
    } catch (err) {
      console.error('Error joining team:', err);
      setError('Failed to join team: ' + (err.message || 'Unknown error'));
      setShowJoinDialog(false);
    }
  };

  // Listen for pending request changes
  useEffect(() => {
    const handlePendingRequestsChanged = () => {
      // Recheck pending requests when notified
      if (team && !hasPendingRequest) {
        const recheckRequests = async () => {
          try {
            const userResponse = await apiClient.get('/auth/me');
            const currentUserId = userResponse?.id;
            
            if (!currentUserId) return;
            
            const notificationsResponse = await apiClient.get('/notifications', {
              params: { status: 'all', limit: 100 }
            });
            
            if (notificationsResponse && notificationsResponse.notifications) {
              const pendingRequest = notificationsResponse.notifications.find(
                notification => 
                  notification.type === 'join_request' &&
                  notification.teamId === team.id &&
                  notification.senderUserId === currentUserId &&
                  (notification.status === 'unread' || notification.status === 'read')
              );
              
              setHasPendingRequest(!!pendingRequest);
            }
          } catch (error) {
            console.error('Error rechecking pending requests:', error);
          }
        };
        
        recheckRequests();
      }
    };
    
    window.addEventListener('pendingRequestsChanged', handlePendingRequestsChanged);
    
    return () => {
      window.removeEventListener('pendingRequestsChanged', handlePendingRequestsChanged);
    };
  }, [team, hasPendingRequest]);

  if (loading) {
    return (
      <PageLayout maxWidth="1000px">
        <div className="team-overview-loading">
          <Loading size="large" message="Loading team information..." />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout maxWidth="1000px">
        <div className="team-overview-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleBackClick} className="back-button">
            Back to Search
          </button>
        </div>
      </PageLayout>
    );
  }

  // Create abbreviation display fallback for when image is missing
  const hasValidImage = team?.logoUrl && !team.logoUrl.includes('undefined') && !team.logoUrl.endsWith('/null');
  const abbr = team?.abbreviation || (team?.name ? team.name.substring(0, 3).toUpperCase() : 'TM');

  return (
    <PageLayout maxWidth="1000px">
      <div className="team-overview-page">
        <button className="back-button" onClick={handleBackClick}>
          ← Back to Search
        </button>
        
        <div className="team-overview-card">
          <div className="team-overview-header">
            <div className="team-logo-container">
              {hasValidImage ? (
                <img 
                  src={team.logoUrl} 
                  alt={team.name} 
                  className="team-logo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add('team-abbr-fallback');
                    e.target.parentNode.innerText = abbr;
                  }} 
                />
              ) : (
                <div className="team-abbr-fallback">{abbr}</div>
              )}
            </div>
            <div className="team-overview-details">
              <h1>{team.name}</h1>
              {team.abbreviation && (
                <div className="team-identifier">{team.abbreviation}</div>
              )}
              <div className="team-meta-info">
                {team.city && <span className="team-meta-item">{team.city}</span>}
                {team.foundedYear && <span className="team-meta-item">Est. {team.foundedYear}</span>}
              </div>
            </div>
          </div>
          
          <div className="team-overview-content">
            {team.description && (
              <div className="team-description">
                <h3>About</h3>
                <p>{team.description}</p>
              </div>
            )}
            
            <div className="team-stats-grid">
              <div className="team-stat-card">
                <h4>Team Style</h4>
                <p>{team.playingStyle || "Not specified"}</p>
              </div>
              <div className="team-stat-card">
                <h4>Preferred Formation</h4>
                <p>{team.preferredFormation || "4-4-2"}</p>
              </div>
              <div className="team-stat-card">
                <h4>Manager</h4>
                <p>{team.managerName || "Not specified"}</p>
              </div>
              <div className="team-stat-card">
                <h4>Members</h4>
                <p>{team.memberCount || "Unknown"}</p>
              </div>
            </div>
          </div>
          
          <div className="team-overview-actions">
            <button 
              className={`join-team-button ${hasPendingRequest ? 'disabled' : ''}`}
              onClick={handleJoinClick}
              disabled={hasPendingRequest}
            >
              {hasPendingRequest ? 'Request Pending' : 'Join Team'}
            </button>
          </div>
        </div>
      </div>
      
      {showJoinDialog && (
        <JoinTeamDialog
          team={team}
          onJoin={handleJoinSubmit}
          onCancel={() => setShowJoinDialog(false)}
        />
      )}
    </PageLayout>
  );
};

export default TeamOverviewPage;
