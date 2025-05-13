import React from 'react';
import FormationContainer from '../components/formation/FormationContainer';
import './TabComponents.css';

const Formation = ({ team, members, isManager }) => {
  // Filter to get only players (athletes)
  const players = members ? members.filter(m => m.role === 'athlete') : [];
  
  return (
    <div className="formation-container">
      <FormationContainer 
        teamId={team?.id} 
        isManager={isManager} 
        players={players}
      />
    </div>
  );
};

export default Formation;
