import React, { useState } from 'react';
import useFormationStore from '../../formationStore';
import './Edit.css';

const FormationPreview = ({ formation, positionData }) => {
  // Render a small preview of the formation
  return (
    <div className="formation-preview">
      <div className="formation-field">
        {positionData.map((position, index) => (
          <div 
            key={index}
            className="position-dot"
            style={{
              left: `${position.xNorm}%`,
              top: `${position.yNorm}%`
            }}
          />
        ))}
      </div>
    </div>
  );
};

const Edit = ({ onSelectPreset, currentPreset, onClose, isManager }) => {
  const [selectedPreset, setSelectedPreset] = useState(currentPreset || '4-3-3');
  const { PRESETS } = useFormationStore.getState();

  // List of all available formations
  const formations = [
    { id: '4-3-3', name: '4-3-3 Attack' },
    { id: '4-4-2', name: '4-4-2 Flat' },
    { id: '3-4-3', name: '3-4-3 Flat' },
    { id: '4-2-3-1', name: '4-2-3-1 Narrow' },
    { id: '4-1-4-1', name: '4-1-4-1' },
    { id: '5-2-2-1', name: '5-2-2-1' },
    { id: '4-1-2-1-2', name: '4-1-2-1-2 Narrow' },
    { id: '4-5-1', name: '4-5-1' },
    { id: '4-2-2-2', name: '4-2-2-2' },
    { id: '3-5-2', name: '3-5-2' }
  ];

  const handleSelectClick = () => {
    onSelectPreset(selectedPreset);
  };

  // Disable selection button if the user is not a manager
  const canSelect = isManager;

  return (
    <div className="edit-formation-container">
      <div className="edit-header">
        <h2>Select Formation</h2>
        <button className="close-button" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="formations-grid">
        {formations.map(formation => {
          // Get position data for preview (use the stored PRESETS if available, otherwise provide empty array)
          const positionData = PRESETS[formation.id] || [];
          
          return (
            <div 
              key={formation.id}
              className={`formation-option ${selectedPreset === formation.id ? 'selected' : ''}`}
              onClick={() => setSelectedPreset(formation.id)}
            >
              <h3>{formation.name}</h3>
              <FormationPreview 
                formation={formation.id} 
                positionData={positionData}
              />
            </div>
          );
        })}
      </div>

      <div className="edit-actions">
        <button 
          className="cancel-button" 
          onClick={onClose}
        >
          Cancel
        </button>
        <button 
          className="select-button"
          onClick={handleSelectClick}
          disabled={!canSelect}
        >
          SELECT
        </button>
      </div>
      
      {!isManager && (
        <div className="manager-notice">
          <p>You need manager permissions to change the formation</p>
        </div>
      )}
    </div>
  );
};

export default Edit;
