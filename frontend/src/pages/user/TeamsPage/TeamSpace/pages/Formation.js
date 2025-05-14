import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'react-toastify';
import FormationContainer from '../components/formation/FormationContainer';
import '../tabs/TabComponents.css';

const Formation = ({ team, members, isManager }) => {
  const [saveError, setSaveError] = useState(null);
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
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="team-page formation-page">
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
          teamId={team?.id} 
          isManager={isManager} 
          players={players}
          onSaveError={handleSaveError}
        />
      </div>
    </DndProvider>
  );
};

export default Formation;
