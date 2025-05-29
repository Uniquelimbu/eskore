import React, { useState } from 'react';
import './ManagerRegistrationForm.css';

const ManagerRegistrationForm = ({ onSubmit, onCancel, initialValues = {} }) => {
  const [formData, setFormData] = useState({
    playingStyle: initialValues.playingStyle || 'balanced',
    preferredFormation: initialValues.preferredFormation || '4-3-3',
    experience: initialValues.experience !== undefined ? initialValues.experience : '',
    ...initialValues
  });
  
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

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
    
    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate the field immediately
    validateField(name, value);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'playingStyle':
        if (!value) {
          newErrors.playingStyle = 'Playing style is required';
        } else {
          delete newErrors.playingStyle;
        }
        break;
      
      case 'preferredFormation':
        if (!value) {
          newErrors.preferredFormation = 'Preferred formation is required';
        } else {
          delete newErrors.preferredFormation;
        }
        break;
      
      case 'experience':
        if (value === '') {
          // Empty is allowed, will default to 0
          delete newErrors.experience;
        } else {
          const exp = parseInt(value, 10);
          if (isNaN(exp)) {
            newErrors.experience = 'Experience must be a number';
          } else if (exp < 0 || exp > 50) {
            newErrors.experience = 'Experience must be between 0-50 years';
          } else {
            delete newErrors.experience;
          }
        }
        break;
      
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    // Touch all fields to show all errors
    const allFields = {
      playingStyle: true,
      preferredFormation: true,
      experience: true
    };
    setTouchedFields(allFields);
    
    const newErrors = {};
    
    // Validate all fields
    if (!formData.playingStyle) {
      newErrors.playingStyle = 'Playing style is required';
    }
    
    if (!formData.preferredFormation) {
      newErrors.preferredFormation = 'Preferred formation is required';
    }
    
    if (formData.experience !== '') {
      const exp = parseInt(formData.experience, 10);
      if (isNaN(exp)) {
        newErrors.experience = 'Experience must be a number';
      } else if (exp < 0 || exp > 50) {
        newErrors.experience = 'Experience must be between 0-50 years';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert experience to integer or 0 if empty
      const submittedData = {
        ...formData,
        experience: formData.experience !== '' ? parseInt(formData.experience, 10) : 0
      };
      
      onSubmit(submittedData);
    }
  };

  // Helper function to determine if a field has an error and should be highlighted
  const hasError = (fieldName) => {
    return touchedFields[fieldName] && errors[fieldName];
  };

  return (
    <div className="manager-registration-form">
      <h2>Manager Profile</h2>
      <p className="form-description">
        Please complete your manager profile to continue. This information is required for team setup.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="playingStyle">Playing Style *</label>
            <select
              id="playingStyle"
              name="playingStyle"
              value={formData.playingStyle}
              onChange={handleChange}
              className={hasError('playingStyle') ? 'error' : ''}
              required
            >
              {playingStyles.map(style => (
                <option key={style.value} value={style.value}>{style.label}</option>
              ))}
            </select>
            {hasError('playingStyle') && <div className="error-message">{errors.playingStyle}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="preferredFormation">Preferred Formation *</label>
            <select
              id="preferredFormation"
              name="preferredFormation"
              value={formData.preferredFormation}
              onChange={handleChange}
              className={hasError('preferredFormation') ? 'error' : ''}
              required
            >
              {formations.map(formation => (
                <option key={formation.value} value={formation.value}>{formation.label}</option>
              ))}
            </select>
            {hasError('preferredFormation') && <div className="error-message">{errors.preferredFormation}</div>}
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
              className={hasError('experience') ? 'error' : ''}
              placeholder="Years of experience (0-50)"
              min="0"
              max="50"
            />
            {hasError('experience') && <div className="error-message">{errors.experience}</div>}
            <small className="field-hint">Enter a number between 0 and 50</small>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={Object.keys(errors).length > 0}
          >
            Complete Manager Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManagerRegistrationForm;
