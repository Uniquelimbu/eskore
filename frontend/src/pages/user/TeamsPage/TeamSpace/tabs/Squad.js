import React, { useState } from 'react';
import './TabComponents.css';

const Squad = ({ team, members, isManager }) => {
  const [selectedPosition, setSelectedPosition] = useState('all');
  
  // Positions for filtering
  const positions = [
    { value: 'all', label: 'All Positions' },
    { value: 'GK', label: 'Goalkeeper' },
    { value: 'DF', label: 'Defender' },
    { value: 'MF', label: 'Midfielder' },
    { value: 'FW', label: 'Forward' },
  ];
  
  // Placeholder positions when actual positions are not set
  const getPlaceholderPosition = (index) => {
    const positions = ['GK', 'DF', 'MF', 'FW'];
    return positions[index % positions.length];
  };
  
  // Filter members by selected position
  const filteredMembers = selectedPosition === 'all' 
    ? members 
    : members.filter(member => (member.position || getPlaceholderPosition(members.indexOf(member))) === selectedPosition);
  
  return (
    <div className="squad-container">
      <div className="squad-header">
        <h2>Team Roster</h2>
        <div className="squad-actions">
          <div className="position-filter">
            <label htmlFor="position-select">Filter by Position:</label>
            <select 
              id="position-select"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
            >
              {positions.map(pos => (
                <option key={pos.value} value={pos.value}>{pos.label}</option>
              ))}
            </select>
          </div>
          
          {isManager && (
            <button className="action-button primary">
              <i className="fas fa-user-plus"></i> Add Player
            </button>
          )}
        </div>
      </div>
      
      {members.length <= 1 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No Players Yet</h3>
          <p>Add players to your team to start building your squad.</p>
          {isManager && (
            <button className="action-button primary">Invite Players</button>
          )}
        </div>
      ) : (
        <div className="roster-table-container">
          <table className="roster-table">
            <thead>
              <tr>
                <th className="player-column">Player</th>
                <th>Position</th>
                <th>Jersey #</th>
                <th>Role</th>
                <th>Status</th>
                {isManager && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, index) => (
                <tr key={member.id || index}>
                  <td className="player-cell">
                    <div className="player-info">
                      <div className="player-avatar">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </div>
                        )}
                      </div>
                      <div className="player-name">
                        <div className="full-name">{member.firstName} {member.lastName}</div>
                        <div className="user-email">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {member.position || getPlaceholderPosition(index)}
                  </td>
                  <td>{member.jerseyNumber || '-'}</td>
                  <td>
                    <span className={`role-badge ${member.UserTeam?.role || 'athlete'}`}>
                      {member.UserTeam?.role || 'athlete'}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge active">Active</span>
                  </td>
                  {isManager && (
                    <td className="action-cell">
                      <button className="table-action-btn edit" title="Edit Player">
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button className="table-action-btn remove" title="Remove Player">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="position-distribution">
        <h3>Position Distribution</h3>
        <div className="position-chart">
          <div className="position-bar">
            <div className="position-label">GK</div>
            <div className="position-count-bar">
              <div 
                className="position-count-fill gk" 
                style={{ width: `${(members.filter(m => (m.position || getPlaceholderPosition(members.indexOf(m))) === 'GK').length / members.length) * 100}%` }}
              ></div>
            </div>
            <div className="position-count">{members.filter(m => (m.position || getPlaceholderPosition(members.indexOf(m))) === 'GK').length}</div>
          </div>
          <div className="position-bar">
            <div className="position-label">DF</div>
            <div className="position-count-bar">
              <div 
                className="position-count-fill df" 
                style={{ width: `${(members.filter(m => (m.position || getPlaceholderPosition(members.indexOf(m))) === 'DF').length / members.length) * 100}%` }}
              ></div>
            </div>
            <div className="position-count">{members.filter(m => (m.position || getPlaceholderPosition(members.indexOf(m))) === 'DF').length}</div>
          </div>
          <div className="position-bar">
            <div className="position-label">MF</div>
            <div className="position-count-bar">
              <div 
                className="position-count-fill mf" 
                style={{ width: `${(members.filter(m => (m.position || getPlaceholderPosition(members.indexOf(m))) === 'MF').length / members.length) * 100}%` }}
              ></div>
            </div>
            <div className="position-count">{members.filter(m => (m.position || getPlaceholderPosition(members.indexOf(m))) === 'MF').length}</div>
          </div>
          <div className="position-bar">
            <div className="position-label">FW</div>
            <div className="position-count-bar">
              <div 
                className="position-count-fill fw" 
                style={{ width: `${(members.filter(m => (m.position || getPlaceholderPosition(members.indexOf(m))) === 'FW').length / members.length) * 100}%` }}
              ></div>
            </div>
            <div className="position-count">{members.filter(m => (m.position || getPlaceholderPosition(members.indexOf(m))) === 'FW').length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Squad;
