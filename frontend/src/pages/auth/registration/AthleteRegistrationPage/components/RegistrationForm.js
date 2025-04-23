import React, { useState, useEffect } from 'react';

const RegistrationForm = ({ step, formData, onNextStep, onPrevStep, isLoading }) => {
  const [stepData, setStepData] = useState({});
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    // Initialize step data based on current step
    if (step === 1) {
      setStepData(formData.basicInfo);
    } else if (step === 2) {
      setStepData(formData.profileInfo);
    } else if (step === 3) {
      setStepData(formData.gameInfo);
    }
  }, [step, formData]);

  const validateStep = () => {
    const newErrors = {};
    
    if (step === 1) {
      // First Name validation
      if (!stepData.firstName) newErrors.firstName = 'First name is required';
      else if (stepData.firstName.length < 2) newErrors.firstName = 'First name must be at least 2 characters';

      // Last Name validation
      if (!stepData.lastName) newErrors.lastName = 'Last name is required';
      else if (stepData.lastName.length < 2) newErrors.lastName = 'Last name must be at least 2 characters';

      // Email validation
      if (!stepData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(stepData.email)) newErrors.email = 'Email is invalid';
      
      // Password validation
      if (!stepData.password) newErrors.password = 'Password is required';
      else if (stepData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(stepData.password))
        newErrors.password = 'Password must include uppercase, lowercase, and numbers';
      
      if (!stepData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (stepData.password !== stepData.confirmPassword) 
        newErrors.confirmPassword = 'Passwords do not match';
    } else if (step === 2) {
      if (!stepData.displayName) newErrors.displayName = 'Display name is required';
      else if (stepData.displayName.length < 2) 
        newErrors.displayName = 'Display name must be at least 2 characters';
      
      if (!stepData.country) newErrors.country = 'Country is required';
      
      if (stepData.bio && stepData.bio.length > 500) 
        newErrors.bio = 'Bio cannot exceed 500 characters';
    } else if (step === 3) {
      if (!stepData.primaryGame) newErrors.primaryGame = 'Primary game is required';
      if (!stepData.skillLevel) newErrors.skillLevel = 'Skill level is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStepData({ ...stepData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateStep()) {
      onNextStep(stepData);
    }
  };

  const renderStepForm = () => {
    switch (step) {
      case 1:
        return (
          <>
            {/* Removed <h2>Account Information</h2> */}
            <div className="form-group">
              <label>First Name</label>
              <input 
                type="text" 
                name="firstName" 
                placeholder="Enter your first name"
                value={stepData.firstName || ''} 
                onChange={handleChange} 
              />
              {errors.firstName && <div className="error">{errors.firstName}</div>}
            </div>
            <div className="form-group">
              <label>Middle Name <span style={{color:'#a0aec0', fontWeight:400}}>(Optional)</span></label>
              <input 
                type="text" 
                name="middleName" 
                placeholder="Enter your middle name"
                value={stepData.middleName || ''} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input 
                type="text" 
                name="lastName" 
                placeholder="Enter your last name"
                value={stepData.lastName || ''} 
                onChange={handleChange} 
              />
              {errors.lastName && <div className="error">{errors.lastName}</div>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email" 
                placeholder="Your email address"
                value={stepData.email || ''} 
                onChange={handleChange} 
              />
              {errors.email && <div className="error">{errors.email}</div>}
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                name="password" 
                placeholder="At least 8 characters"
                value={stepData.password || ''} 
                onChange={handleChange} 
              />
              {errors.password && <div className="error">{errors.password}</div>}
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                placeholder="Re-enter your password"
                value={stepData.confirmPassword || ''} 
                onChange={handleChange} 
              />
              {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
            </div>
          </>
        );
      
      case 2:
        return (
          <>
            <h2>Profile Information</h2>
            <div className="form-group">
              <label>Display Name</label>
              <input 
                type="text" 
                name="displayName" 
                value={stepData.displayName || ''} 
                onChange={handleChange} 
              />
              {errors.displayName && <div className="error">{errors.displayName}</div>}
            </div>
            
            <div className="form-group">
              <label>Bio</label>
              <textarea 
                name="bio" 
                value={stepData.bio || ''} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="form-group">
              <label>Country</label>
              <select 
                name="country" 
                value={stepData.country || ''} 
                onChange={handleChange}
              >
                <option value="">Select Country</option>
                <option value="us">United States</option>
                <option value="ca">Canada</option>
                <option value="uk">United Kingdom</option>
                <option value="au">Australia</option>
                {/* More countries would be added here */}
              </select>
              {errors.country && <div className="error">{errors.country}</div>}
            </div>
            
            <div className="form-group">
              <label>Date of Birth</label>
              <input 
                type="date" 
                name="dateOfBirth" 
                value={stepData.dateOfBirth || ''} 
                onChange={handleChange} 
              />
            </div>
          </>
        );
      
      case 3:
        return (
          <>
            <h2>Gaming Information</h2>
            <div className="form-group">
              <label>Primary Game</label>
              <select 
                name="primaryGame" 
                value={stepData.primaryGame || ''} 
                onChange={handleChange}
              >
                <option value="">Select Game</option>
                <option value="lol">League of Legends</option>
                <option value="csgo">CS:GO</option>
                <option value="valorant">Valorant</option>
                <option value="dota2">Dota 2</option>
                <option value="fortnite">Fortnite</option>
                {/* More games would be added here */}
              </select>
              {errors.primaryGame && <div className="error">{errors.primaryGame}</div>}
            </div>
            
            <div className="form-group">
              <label>Skill Level</label>
              <select 
                name="skillLevel" 
                value={stepData.skillLevel || ''} 
                onChange={handleChange}
              >
                <option value="">Select Skill Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="professional">Professional</option>
              </select>
              {errors.skillLevel && <div className="error">{errors.skillLevel}</div>}
            </div>
            
            <div className="form-group">
              <label>Years of Experience</label>
              <select 
                name="playingExperience" 
                value={stepData.playingExperience || ''} 
                onChange={handleChange}
              >
                <option value="">Select Experience</option>
                <option value="less1">Less than 1 year</option>
                <option value="1to3">1-3 years</option>
                <option value="3to5">3-5 years</option>
                <option value="5plus">5+ years</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Preferred Platform</label>
              <select 
                name="preferredPlatform" 
                value={stepData.preferredPlatform || ''} 
                onChange={handleChange}
              >
                <option value="">Select Platform</option>
                <option value="pc">PC</option>
                <option value="console">Console</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {renderStepForm()}
      
      <div className="form-buttons">
        {step > 1 && (
          <button 
            type="button" 
            className="back-button" 
            onClick={onPrevStep}
            disabled={isLoading}
          >
            Back
          </button>
        )}
        
        <button 
          type="submit" 
          className={step === 3 ? 'submit-button' : 'next-button'}
          disabled={isLoading}
        >
          {isLoading ? (
            step === 3 ? 'Creating Account...' : 'Processing...'
          ) : (
            step === 3 ? 'Complete Registration' : 'Next Step'
          )}
        </button>
      </div>
    </form>
  );
};

export default RegistrationForm;
