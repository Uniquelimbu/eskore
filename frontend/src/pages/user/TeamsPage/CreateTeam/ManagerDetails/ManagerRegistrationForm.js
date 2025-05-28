import React, { useState } from 'react';
import './ManagerRegistrationForm.css'; // Make sure to import the CSS

const ManagerRegistrationForm = ({ onSubmit, onCancel, initialValues = {} }) => {
  const [formData, setFormData] = useState({
    playingStyle: initialValues.playingStyle || 'balanced',
    preferredFormation: initialValues.preferredFormation || '4-3-3',
    experience: initialValues.experience !== undefined ? initialValues.experience : '',
    ...initialValues
  });
  
  const [errors, setErrors] = useState({});

  const playingStyles = [
    { value: '', label: 'Select Playing Style' },
    { value: 'possession', label: 'Possession' },
    { value: 'counter-attack', label: 'Counter Attack' },
    { value: 'high-press', label: 'High Press' },
    { value: 'defensive', label: 'Defensive' },
    { value: 'balanced', label: 'Balanced' }
  ];

  const formations = [
    { value: '', label: 'Select Formation' },
    { value: '4-3-3', label: '4-3-3' },
    { value: '4-4-2', label: '4-4-2' },
    { value: '3-5-2', label: '3-5-2' },
    { value: '3-4-3', label: '3-4-3' },
    { value: '4-2-3-1', label: '4-2-3-1' },
    { value: '4-1-4-1', label: '4-1-4-1' },
    { value: '5-2-2-1', label: '5-2-2-1' },
    { value: '4-1-2-1-2', label: '4-1-2-1-2' }
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
    
    if (!formData.playingStyle) {
      newErrors.playingStyle = 'Playing style is required';
    }
    
    if (!formData.preferredFormation) {
      newErrors.preferredFormation = 'Preferred formation is required';
    }
    
    if (formData.experience !== '') {
      const exp = parseInt(formData.experience, 10);
      if (isNaN(exp) || exp < 0 || exp > 50) {
        newErrors.experience = 'Experience must be between 0-50 years';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert experience to integer or null if empty
      const submittedData = {
        ...formData,
        experience: formData.experience !== '' ? parseInt(formData.experience, 10) : 0
      };
      
      onSubmit(submittedData);
    }
  };

  return (
    <div className="manager-registration-form">
      <h2>Manager Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="playingStyle">Playing Style *</label>
            <select
              id="playingStyle"
              name="playingStyle"
              value={formData.playingStyle}
              onChange={handleChange}
              className={errors.playingStyle ? 'error' : ''}
            >
              {playingStyles.map(style => (
                <option key={style.value} value={style.value}>{style.label}</option>
              ))}
            </select>
            {errors.playingStyle && <div className="error-message">{errors.playingStyle}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="preferredFormation">Preferred Formation *</label>
            <select
              id="preferredFormation"
              name="preferredFormation"
              value={formData.preferredFormation}
              onChange={handleChange}
              className={errors.preferredFormation ? 'error' : ''}
            >
              {formations.map(formation => (
                <option key={formation.value} value={formation.value}>{formation.label}</option>
              ))}
            </select>
            {errors.preferredFormation && <div className="error-message">{errors.preferredFormation}</div>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="experience">Coaching Experience (years)</label>
            <input
              id="experience"
              name="experience"
              type="number"
              value={formData.experience}
              onChange={handleChange}
              className={errors.experience ? 'error' : ''}
              placeholder="Years of experience"
            />
            {errors.experience && <div className="error-message">{errors.experience}</div>}
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Skip for Now
          </button>
          <button type="submit" className="submit-button">
            Complete Manager Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManagerRegistrationForm;
