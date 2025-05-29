import React, { useState } from 'react';
import './PlayerRegistrationForm.css';

const PlayerRegistrationForm = ({ onSubmit, onCancel, initialValues = {} }) => {
  const [formData, setFormData] = useState({
    position: initialValues.position || '',
    height: initialValues.height || '',
    weight: initialValues.weight || '',
    preferredFoot: initialValues.preferredFoot || '',
    jerseyNumber: initialValues.jerseyNumber || '',
    ...initialValues
  });
  
  const [errors, setErrors] = useState({});

  const positions = [
    { value: '', label: 'Select Position' },
    { value: 'GK', label: 'Goalkeeper (GK)' },
    { value: 'LB', label: 'Left Back (LB)' },
    { value: 'CB', label: 'Center Back (CB)' },
    { value: 'RB', label: 'Right Back (RB)' },
    { value: 'CDM', label: 'Defensive Midfielder (CDM)' },
    { value: 'CM', label: 'Central Midfielder (CM)' },
    { value: 'CAM', label: 'Attacking Midfielder (CAM)' },
    { value: 'LM', label: 'Left Midfielder (LM)' },
    { value: 'RM', label: 'Right Midfielder (RM)' },
    { value: 'LW', label: 'Left Wing (LW)' },
    { value: 'RW', label: 'Right Wing (RW)' },
    { value: 'ST', label: 'Striker (ST)' },
    { value: 'CF', label: 'Center Forward (CF)' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.position) {
      newErrors.position = 'Position is required';
    }
    
    if (formData.jerseyNumber) {
      const num = parseInt(formData.jerseyNumber);
      if (isNaN(num) || num < 1 || num > 99) {
        newErrors.jerseyNumber = 'Jersey number must be between 1-99';
      }
    }
    
    if (formData.height) {
      const height = parseFloat(formData.height);
      if (isNaN(height) || height < 120 || height > 250) {
        newErrors.height = 'Height must be between 120-250 cm';
      }
    }
    
    if (formData.weight) {
      const weight = parseFloat(formData.weight);
      if (isNaN(weight) || weight < 40 || weight > 150) {
        newErrors.weight = 'Weight must be between 40-150 kg';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert height and weight to numbers if they exist
      const formattedData = {
        ...formData,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined
      };
      
      // Remove empty string values to avoid validation errors
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === '') {
          delete formattedData[key];
        }
      });
      
      onSubmit(formattedData);
    }
  };

  return (
    <div className="player-registration-form">
      <h2>Player Registration</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="position">Position *</label>
            <select
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className={errors.position ? 'error' : ''}
            >
              {positions.map(pos => (
                <option key={pos.value} value={pos.value}>{pos.label}</option>
              ))}
            </select>
            {errors.position && <div className="error-message">{errors.position}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="jerseyNumber">Jersey Number</label>
            <input
              id="jerseyNumber"
              name="jerseyNumber"
              type="number"
              min="1"
              max="99"
              value={formData.jerseyNumber}
              onChange={handleChange}
              className={errors.jerseyNumber ? 'error' : ''}
              placeholder="1-99"
            />
            {errors.jerseyNumber && <div className="error-message">{errors.jerseyNumber}</div>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="height">Height (cm)</label>
            <input
              id="height"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              className={errors.height ? 'error' : ''}
              placeholder="Height in cm"
            />
            {errors.height && <div className="error-message">{errors.height}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="weight">Weight (kg)</label>
            <input
              id="weight"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              className={errors.weight ? 'error' : ''}
              placeholder="Weight in kg"
            />
            {errors.weight && <div className="error-message">{errors.weight}</div>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="preferredFoot">Preferred Foot</label>
            <select
              id="preferredFoot"
              name="preferredFoot"
              value={formData.preferredFoot}
              onChange={handleChange}
            >
              <option value="">Select Foot</option>
              <option value="right">Right</option>
              <option value="left">Left</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Complete Registration
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlayerRegistrationForm;
