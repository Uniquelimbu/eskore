import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { JoinTeamDialog } from '../../../JoinTeam/components';
import SquadHeader from './components/SquadHeader';
import MemberList from './components/MemberList';
import AddMemberForm from './components/AddMemberForm';
import useSquadMembers from './hooks/useSquadMembers';
import './styles/Squad.css';

const Squad = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  
  const {
    isLoading,
    initialLoad,
    error,
    team,
    managers,
    athletes,
    coaches,
    isManager,
    isMember,
    handleJoinTeamSubmit,
    handleRemoveMember,
    handleAddMemberSubmit
  } = useSquadMembers(teamId);

  const handleBack = () => {
    navigate(`/teams/${teamId}/space`);
  };

  const handleAddMember = () => {
    setShowAddMemberForm(true);
  };
  
  const handleJoinTeamClick = () => {
    setShowJoinModal(true);
  };

  if (initialLoad && isLoading) {
    return <div className="squad-loading">Loading squad information...</div>;
  }
  
  if (error) {
    return <div className="squad-error">{error}</div>;
  }

  // Check if we have any members at all
  const teamHasMembers = (managers?.length > 0 || athletes?.length > 0 || coaches?.length > 0);

  return (
    <div className="squad-page">
      <SquadHeader 
        onBack={handleBack}
        onAddMember={handleAddMember}
        onJoinTeam={handleJoinTeamClick}
        isManager={isManager}
        isMember={isMember}
        team={team}
      />
      
      {isLoading && !initialLoad && (
        <div className="squad-loading-overlay">
          <div className="squad-loading-content">Updating squad information...</div>
        </div>
      )}
      
      {showAddMemberForm && (
        <AddMemberForm
          onSubmit={handleAddMemberSubmit}
          onCancel={() => setShowAddMemberForm(false)}
          isManager={isManager}
        />
      )}
      
      {showJoinModal && team && (
        <JoinTeamDialog
          team={team}
          onJoin={handleJoinTeamSubmit}
          onCancel={() => setShowJoinModal(false)}
        />
      )}
      
      <div className="squad-container">
        {teamHasMembers ? (
          <>
            {Array.isArray(managers) && managers.length > 0 && (
              <MemberList 
                title="Managers"
                members={managers}
                isManager={isManager}
                onRemoveMember={handleRemoveMember}
                category="manager"
              />
            )}
            
            {Array.isArray(athletes) && athletes.length > 0 && (
              <MemberList 
                title="Athletes"
                members={athletes}
                isManager={isManager}
                onRemoveMember={handleRemoveMember}
                category="athlete"
              />
            )}
            
            {Array.isArray(coaches) && coaches.length > 0 && (
              <MemberList 
                title="Coaches"
                members={coaches}
                isManager={isManager}
                onRemoveMember={handleRemoveMember}
                category="coach"
              />
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>This team has no members yet. {isManager ? 'Add members to get started!' : 'Join the team to get started!'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Squad;
