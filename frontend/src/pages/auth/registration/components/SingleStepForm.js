import React, { useState } from 'react';
import axios from 'axios';

const SingleStepForm = ({ formData, onSubmit, isLoading }) => {
  const [localFormData, setLocalFormData] = useState(formData);
  const [errors, setErrors] = useState({});
  const [checkingEmail, setCheckingEmail] = useState(false);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setLocalFormData({ 
      ...localFormData, 
      [name]: type === 'checkbox' ? checked : value 
    });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Async email uniqueness check
  const checkEmailExists = async (email) => {
    try {
      const res = await axios.get(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
      return res.data.exists;
    } catch (err) {
      return false; // Assume not exists to avoid blocking registration
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!localFormData.firstName) newErrors.firstName = 'First name is required';
    else if (localFormData.firstName.length < 2) newErrors.firstName = 'First name must be at least 2 characters';

    if (!localFormData.lastName) newErrors.lastName = 'Last name is required';
    else if (localFormData.lastName.length < 2) newErrors.lastName = 'Last name must be at least 2 characters';

    // Email validation
    if (!localFormData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(localFormData.email)) newErrors.email = 'Email is invalid';
    
    // Password validation
    if (!localFormData.password) newErrors.password = 'Password is required';
    else if (localFormData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(localFormData.password))
      newErrors.password = 'Password must include uppercase, lowercase, and numbers';
    
    if (!localFormData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (localFormData.password !== localFormData.confirmPassword) 
      newErrors.confirmPassword = 'Passwords do not match';
    
    // Basic required fields
    if (!localFormData.dob) newErrors.dob = 'Date of birth is required';
    
    // Terms agreement
    if (!localFormData.agreeTerms) newErrors.agreeTerms = 'You must agree to the Terms and Services';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check email uniqueness
    setCheckingEmail(true);
    const emailExists = await checkEmailExists(localFormData.email);
    setCheckingEmail(false);
    
    if (emailExists) {
      setErrors({ ...errors, email: 'An account with this email already exists. Please use a different email.' });
      return;
    }
    
    if (validateForm()) {
      onSubmit(localFormData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-section">
        {/* Removed "Account Information" title */}
        
        {/* First and Last Name side by side */}
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input 
              type="text" 
              name="firstName" 
              placeholder="Enter your first name"
              value={localFormData.firstName || ''} 
              onChange={handleChange} 
            />
            {errors.firstName && <div className="error">{errors.firstName}</div>}
          </div>
          
          <div className="form-group">
            <label>Last Name</label>
            <input 
              type="text" 
              name="lastName" 
              placeholder="Enter your last name"
              value={localFormData.lastName || ''} 
              onChange={handleChange} 
            />
            {errors.lastName && <div className="error">{errors.lastName}</div>}
          </div>
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            name="email" 
            placeholder="Your email address"
            value={localFormData.email || ''} 
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
            value={localFormData.password || ''} 
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
            value={localFormData.confirmPassword || ''} 
            onChange={handleChange} 
          />
          {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
        </div>
      </div>
      
      <div className="form-section">
        {/* Removed position and country fields */}
        
        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={localFormData.dob || ''}
            onChange={handleChange}
          />
          {errors.dob && <div className="error">{errors.dob}</div>}
        </div>
      </div>
      
      <div className="form-section">
        {/* Removed "Agreements" title */}
        
        <div className="form-group consent-group">
          <div className="consent-wrapper">
            <input
              type="checkbox"
              name="agreeTerms"
              id="agreeTerms"
              checked={!!localFormData.agreeTerms}
              onChange={handleChange}
              disabled={isLoading}
              className="custom-checkbox"
            />
            <label htmlFor="agreeTerms" className="consent-text">
              I have read and agree to the{' '}
              <a 
                href="/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="consent-link"
              >
                eSkore Terms of Service
              </a>{' '}
              and Privacy Policy.
            </label>
          </div>
          {errors.agreeTerms && <div className="error">{errors.agreeTerms}</div>}
        </div>
      </div>
      
      <div className="form-buttons">
        <button
          type="submit"
          className="submit-button"
          disabled={isLoading || checkingEmail}
        >
          {checkingEmail
            ? 'Checking Email...'
            : isLoading
            ? 'Creating Account...'
            : 'Register'}
        </button>
      </div>
    </form>
  );
};

export default SingleStepForm;
