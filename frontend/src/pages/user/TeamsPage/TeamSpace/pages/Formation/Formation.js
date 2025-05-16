import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'react-toastify';
import { FormationContainer } from '../../components/formation';
import './Formation.css';

const Formation = ({ team, members, isManager }) => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [error] = useState(null);
  console.log('Formation page rendering with isManager:', isManager);
  console.log('Members data structure sample:', members?.[0]);
  
  // Filter to get only players (athletes) - handle both UserTeam.role and direct role properties
  const players = members ? members.filter(m => {
    // Check for role in different possible locations
    const memberRole = m.UserTeam?.role || m.role;
    return memberRole === 'athlete';
  }) : [];
  
  console.log('Filtered players for formation:', players.length);
  
  // Handler for save errors
  const handleSaveError = (error) => {
    if (error) {
      setSaveError(error);
      toast.error('Failed to save formation. Please try again.');
    } else {
      setSaveError(null);
    }
  };

  const handleBackClick = () => {
    // Direct navigation to team space instead of using browser history
    navigate(`/teams/${teamId}/space`);
  };

  useEffect(() => {
    if (!team || !members) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [team, members]);

  if (loading) return <div className="formation-loading">Loading formation data...</div>;
  if (error) return <div className="formation-error">{error}</div>;
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="formation-page">
        <div className="back-button-container">
          <button className="back-button" onClick={handleBackClick}>
            Back
          </button>
        </div>
        
        <div className="page-header">
          <h2>Team Formation</h2>
        </div>
        
        <div className="formation-page-header">
          <p className="formation-page-subtitle">
            {isManager 
              ? 'Drag and drop players to create your ideal team formation' 
              : 'View the current team formation setup'}
          </p>
        </div>
        
        {saveError && (
          <div className="error-message" style={{
            color: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            marginBottom: '1rem'
          }}>
            Failed to save formation. Please try again later.
          </div>
        )}
        
        <FormationContainer 
          teamId={teamId} 
          isManager={isManager} 
          players={players}
          onSaveError={handleSaveError}
        />
      </div>
    </DndProvider>
  );
};

export default Formation;
