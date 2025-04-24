import React, { useState, useEffect } from 'react';
// Add axios or use your apiClient if available
import axios from 'axios';

const RegistrationForm = ({ step, formData, onNextStep, onPrevStep, isLoading }) => {
  const [stepData, setStepData] = useState({});
  const [errors, setErrors] = useState({});
  const [checkingEmail, setCheckingEmail] = useState(false);

  useEffect(() => {
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
      if (!stepData.height) newErrors.height = 'Height is required';
      else if (isNaN(Number(stepData.height)) || Number(stepData.height) < 100 || Number(stepData.height) > 250)
        newErrors.height = 'Height must be between 100 and 250 cm';

      if (!stepData.position) newErrors.position = 'Position is required';
      if (!stepData.country) newErrors.country = 'Country is required';
      if (!stepData.dob) newErrors.dob = 'Date of birth is required';
    } else if (step === 3) {
      if (!stepData.agreeTerms) newErrors.agreeTerms = 'You must agree to the Terms and Services';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setStepData({ ...stepData, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Async email uniqueness check
  const checkEmailExists = async (email) => {
    try {
      // Replace with your API client if available
      const res = await axios.get(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
      return res.data.exists;
    } catch (err) {
      // If error, assume not exists to avoid blocking registration
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Step 1: Check email uniqueness before proceeding
    if (step === 1) {
      setCheckingEmail(true);
      const emailExists = await checkEmailExists(stepData.email);
      setCheckingEmail(false);
      if (emailExists) {
        setErrors({ ...errors, email: 'An account with this email already exists. Please use a different email.' });
        return;
      }
    }

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
            {/* Removed <h2>Profile Information</h2>, Display Name, and Bio */}
            <div className="form-group">
              <label>Height (cm)</label>
              <input
                type="number"
                name="height"
                placeholder="Enter your height in cm"
                value={stepData.height || ''}
                onChange={handleChange}
                min={100}
                max={250}
              />
              {errors.height && <div className="error">{errors.height}</div>}
            </div>
            <div className="form-group">
              <label>Position</label>
              <select
                name="position"
                value={stepData.position || ''}
                onChange={handleChange}
              >
                <option value="" disabled hidden>
                  Select Position
                </option>
                <option value="FW">Forward (FW)</option>
                <option value="MD">Midfield (MD)</option>
                <option value="DF">Defence (DF)</option>
                <option value="GK">Goalkeeper (GK)</option>
              </select>
              {errors.position && <div className="error">{errors.position}</div>}
            </div>
            <div className="form-group">
              <label>Country</label>
              <select
                name="country"
                value={stepData.country || ''}
                onChange={handleChange}
              >
                <option value="" disabled hidden>
                  Select Country
                </option>
                <option value="us">United States</option>
                <option value="ca">Canada</option>
                <option value="np">Nepal</option>
              </select>
              {errors.country && <div className="error">{errors.country}</div>}
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={stepData.dob || ''}
                onChange={handleChange}
              />
              {errors.dob && <div className="error">{errors.dob}</div>}
            </div>
          </>
        );
      case 3:
        // Step 3: Register (Consent)
        return (
          <>
            <div className="form-group consent-group">
              <div className="consent-wrapper">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  id="agreeTerms"
                  checked={!!stepData.agreeTerms}
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
            
            <div className="form-group consent-group">
              <div className="consent-wrapper">
                <input
                  type="checkbox"
                  name="allowLocation"
                  id="allowLocation"
                  checked={!!stepData.allowLocation}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="custom-checkbox"
                />
                <label htmlFor="allowLocation" className="consent-text">
                  I consent to eSkore using my location to enhance my experience with improved team pairing and personalized regional features.
                </label>
              </div>
              {errors.allowLocation && <div className="error">{errors.allowLocation}</div>}
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
        {/* Only show Back button if step > 1 and not step 2 or 3 */}
        {step > 1 && step !== 2 && step !== 3 && (
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
          className={step === 3 ? 'submit-button center-register-btn' : 'next-button'}
          disabled={isLoading || checkingEmail}
        >
          {checkingEmail
            ? 'Checking Email...'
            : isLoading
            ? step === 3
              ? 'Creating Account...'
              : 'Processing...'
            : step === 3
            ? 'Register'
            : 'Next'}
        </button>
      </div>
    </form>
  );
};

export default RegistrationForm;
