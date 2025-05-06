import React, { useState, useEffect } from 'react';
import './TabComponents.css';

const Formation = ({ team, members, isManager }) => {
  const [formationTemplate, setFormationTemplate] = useState('4-4-2');
  const [playerPositions, setPlayerPositions] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  
  // Available formation templates
  const formationTemplates = [
    { value: '4-4-2', label: '4-4-2' },
    { value: '4-3-3', label: '4-3-3' },
    { value: '3-5-2', label: '3-5-2' },
    { value: '5-3-2', label: '5-3-2' },
    { value: '4-2-3-1', label: '4-2-3-1' },
  ];
  
  // Initialize player positions based on template
  useEffect(() => {
    // This would actually come from the API in a real implementation
    // For now, we'll generate placeholder positions
    const templatePositions = generateTemplatePositions(formationTemplate);
    setPlayerPositions(templatePositions);
  }, [formationTemplate]);
  
  // Generate positions based on formation template
  const generateTemplatePositions = (template) => {
    const positions = {};
    const positions4_4_2 = [
      { id: 'gk', x: 50, y: 90, label: 'GK' },
      { id: 'lb', x: 20, y: 70, label: 'LB' },
      { id: 'cb1', x: 40, y: 70, label: 'CB' },
      { id: 'cb2', x: 60, y: 70, label: 'CB' },
      { id: 'rb', x: 80, y: 70, label: 'RB' },
      { id: 'lm', x: 20, y: 50, label: 'LM' },
      { id: 'cm1', x: 40, y: 50, label: 'CM' },
      { id: 'cm2', x: 60, y: 50, label: 'CM' },
      { id: 'rm', x: 80, y: 50, label: 'RM' },
      { id: 'st1', x: 40, y: 30, label: 'ST' },
      { id: 'st2', x: 60, y: 30, label: 'ST' },
    ];
    
    const positions4_3_3 = [
      { id: 'gk', x: 50, y: 90, label: 'GK' },
      { id: 'lb', x: 20, y: 70, label: 'LB' },
      { id: 'cb1', x: 40, y: 70, label: 'CB' },
      { id: 'cb2', x: 60, y: 70, label: 'CB' },
      { id: 'rb', x: 80, y: 70, label: 'RB' },
      { id: 'dm', x: 50, y: 50, label: 'DM' },
      { id: 'cm1', x: 35, y: 40, label: 'CM' },
      { id: 'cm2', x: 65, y: 40, label: 'CM' },
      { id: 'lw', x: 20, y: 30, label: 'LW' },
      { id: 'st', x: 50, y: 20, label: 'ST' },
      { id: 'rw', x: 80, y: 30, label: 'RW' },
    ];
    
    // Return the appropriate template positions
    switch(template) {
      case '4-3-3':
        return positions4_3_3;
      default:
        return positions4_4_2;
    }
  };
  
  // Handle drag and drop
  const handleDragStart = (e, position) => {
    setSelectedPlayer(position);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    const pitch = document.getElementById('pitch');
    const boundingRect = pitch.getBoundingClientRect();
    
    const x = ((e.clientX - boundingRect.left) / boundingRect.width) * 100;
    const y = ((e.clientY - boundingRect.top) / boundingRect.height) * 100;
    
    // Update the position of the selected player
    if (selectedPlayer) {
      const updatedPositions = [...playerPositions];
      const index = updatedPositions.findIndex(pos => pos.id === selectedPlayer.id);
      
      if (index !== -1) {
        updatedPositions[index] = {
          ...updatedPositions[index],
          x,
          y
        };
        setPlayerPositions(updatedPositions);
      }
    }
    
    setSelectedPlayer(null);
  };
  
  return (
    <div className="formation-container">
      <div className="formation-header">
        <h2>Team Formation</h2>
        <div className="formation-actions">
          <div className="formation-selector">
            <label htmlFor="formation-template">Formation:</label>
            <select 
              id="formation-template"
              value={formationTemplate}
              onChange={(e) => setFormationTemplate(e.target.value)}
              disabled={!isManager}
            >
              {formationTemplates.map(template => (
                <option key={template.value} value={template.value}>{template.label}</option>
              ))}
            </select>
          </div>
          
          {isManager && (
            <div className="formation-buttons">
              <button className="action-button secondary">Reset</button>
              <button className="action-button primary">Save Formation</button>
            </div>
          )}
        </div>
      </div>
      
      <div className="formation-editor">
        <div 
          id="pitch" 
          className="soccer-pitch" 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Field markings */}
          <div className="center-circle"></div>
          <div className="center-line"></div>
          <div className="penalty-area home"></div>
          <div className="penalty-area away"></div>
          <div className="goal-area home"></div>
          <div className="goal-area away"></div>
          <div className="goal home"></div>
          <div className="goal away"></div>
          
          {/* Player positions */}
          {playerPositions.map(position => (
            <div 
              key={position.id}
              className="player-marker"
              style={{ 
                left: `${position.x}%`, 
                top: `${position.y}%` 
              }}
              draggable={isManager}
              onDragStart={(e) => handleDragStart(e, position)}
            >
              <div className="player-token">
                <div className="position-label">{position.label}</div>
                <div className="player-number">{position.playerNumber || ""}</div>
              </div>
              <div className="player-name">{position.playerName || "Unassigned"}</div>
            </div>
          ))}
        </div>
        
        <div className="bench-area">
          <h3>Bench</h3>
          <div className="bench-players">
            {members.length <= 1 ? (
              <div className="bench-empty-state">
                <p>No players available on the bench.</p>
              </div>
            ) : (
              members.slice(0, 5).map((member, index) => (
                <div key={member.id || index} className="bench-player">
                  <div className="player-avatar small">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} />
                    ) : (
                      <div className="avatar-placeholder small">
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="bench-player-info">
                    <div className="player-name small">{member.firstName} {member.lastName}</div>
                    <div className="player-position small">{member.position || "Not set"}</div>
                  </div>
                  {isManager && (
                    <button className="bench-action-btn">
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="formation-notes">
        <h3>Formation Notes</h3>
        <textarea 
          className="notes-textarea"
          placeholder={isManager ? "Add tactical notes here..." : "No tactical notes yet."}
          disabled={!isManager}
        ></textarea>
      </div>
    </div>
  );
};

export default Formation;
