import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SingleStepForm = ({ initialFormData, onSubmit, loading, serverError }) => {
  const [localFormData, setLocalFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  // Update local state when initialFormData changes
  useEffect(() => {
    setLocalFormData(initialFormData);
  }, [initialFormData]);

  // Generate month options for the dropdown
  const generateMonthOptions = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months.map((month, index) => (
      <option key={month} value={(index + 1).toString().padStart(2, '0')}>
        {month}
      </option>
    ));
  };

  // Generate day options (1-31)
  const generateDayOptions = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    return days.map(day => (
      <option key={day} value={day.toString().padStart(2, '0')}>
        {day}
      </option>
    ));
  };

  // Generate year options (current year - 100 years to current year)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
    return years.map(year => (
      <option key={year} value={year.toString()}>
        {year}
      </option>
    ));
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // For checkboxes, use the checked property
    if (type === 'checkbox') {
      setLocalFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      // For other inputs, use the value property
      setLocalFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear the error for this field when it changes
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!localFormData.firstName) newErrors.firstName = 'First name is required';
    if (!localFormData.lastName) newErrors.lastName = 'Last name is required';
    if (!localFormData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(localFormData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!localFormData.password) {
      newErrors.password = 'Password is required';
    } else if (localFormData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (localFormData.password !== localFormData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Date of birth validation
    if (!localFormData.dobYear || !localFormData.dobMonth || !localFormData.dobDay) {
      newErrors.dob = 'Date of birth is required';
    }
    
    // Terms consent validation
    if (!localFormData.termsConsent) {
      newErrors.termsConsent = 'You must agree to the terms and conditions';
    }
    
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    // Call parent component's onSubmit function
    onSubmit(localFormData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {serverError && (
        <div className="error-banner">{serverError}</div>
      )}
      
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
      
      {/* Birthday field - Positioned here above Email */}
      <div className="form-group birthdate-group">
        <label>Birthday</label>
        <div className="date-inputs">
          <select
            name="dobMonth"
            value={localFormData.dobMonth || ''}
            onChange={handleChange}
            className="date-select month-select"
            aria-label="Month"
          >
            <option value="" disabled hidden>Month</option>
            {generateMonthOptions()}
          </select>
          
          <select
            name="dobDay"
            value={localFormData.dobDay || ''}
            onChange={handleChange}
            className="date-select day-select"
            aria-label="Day"
          >
            <option value="" disabled hidden>Day</option>
            {generateDayOptions()}
          </select>
          
          <select
            name="dobYear"
            value={localFormData.dobYear || ''}
            onChange={handleChange}
            className="date-select year-select"
            aria-label="Year"
          >
            <option value="" disabled hidden>Year</option>
            {generateYearOptions()}
          </select>
        </div>
        {errors.dob && <div className="error">{errors.dob}</div>}
      </div>
      
      <div className="form-group">
        <label>Email</label>
        <input 
          type="email" 
          name="email" 
          placeholder="Enter your email address"
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
          placeholder="Create a password"
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
      
      {/* Height, Position and Country fields removed */}
      
      <div className="consent-group">
        <div className="consent-wrapper">
          <input
            type="checkbox"
            id="termsConsent"
            name="termsConsent"
            className="custom-checkbox"
            checked={localFormData.termsConsent || false}
            onChange={handleChange}
          />
          <label htmlFor="termsConsent" className="consent-text">
            I agree to the <Link to="/terms" className="consent-link" target="_blank">Terms of Service</Link> and <Link to="/privacy" className="consent-link" target="_blank">Privacy Policy</Link> of eSkore
          </label>
        </div>
        {errors.termsConsent && <div className="error">{errors.termsConsent}</div>}
      </div>
      
      <div className="form-buttons">
        <button 
          type="submit" 
          className="submit-button center-register-btn"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>
    </form>
  );
};

export default SingleStepForm;
