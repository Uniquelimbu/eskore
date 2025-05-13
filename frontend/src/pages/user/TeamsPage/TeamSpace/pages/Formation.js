import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FormationContainer from '../components/formation/FormationContainer';
import '../tabs/TabComponents.css';

const Formation = ({ team, members, isManager }) => {
  console.log('Formation page rendering with isManager:', isManager);
  console.log('Members data structure sample:', members?.[0]);
  
  // Filter to get only players (athletes) - handle both UserTeam.role and direct role properties
  const players = members ? members.filter(m => {
    // Check for role in different possible locations
    const memberRole = m.UserTeam?.role || m.role;
    return memberRole === 'athlete';
  }) : [];
  
  console.log('Filtered players for formation:', players.length);
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="team-page formation-page">
        <FormationContainer 
          teamId={team?.id} 
          isManager={isManager} 
          players={players}
        />
      </div>
    </DndProvider>
  );
};

export default Formation;
