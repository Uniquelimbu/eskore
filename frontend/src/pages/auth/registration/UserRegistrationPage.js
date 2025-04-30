import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import ProgressIndicator from './components/ProgressIndicator';
import './UserRegistrationPage.css'; // Updated CSS filename
import { useAuth } from '../../../contexts/AuthContext';

const UserRegistrationPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    basicInfo: {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    profileInfo: {
      country: '',
      dob: '',
      // Additional fields can be added here based on your requirements
    },
    additionalInfo: {
      // Optional additional info fields
    }
  });
  
  const [registrationError, setRegistrationError] = useState(null);
  const navigate = useNavigate();
  // Updated to use registerUser instead of registerAthlete
  const { registerUser, loading, error, isAuthenticated } = useAuth();
  
  // This useEffect will handle redirect on successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleNextStep = (stepData) => {
    if (step === 1) {
      setFormData({ ...formData, basicInfo: stepData });
      setStep(2);
    } else if (step === 2) {
      setFormData({ ...formData, profileInfo: stepData });
      setStep(3);
    } else if (step === 3) {
      setFormData({ ...formData, additionalInfo: stepData });
      // Submit registration
      handleSubmit({ ...formData, additionalInfo: stepData });
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (completeData) => {
    try {
      setRegistrationError(null);
      const registrationData = {
        firstName: completeData.basicInfo.firstName,
        middleName: completeData.basicInfo.middleName,
        lastName: completeData.basicInfo.lastName,
        email: completeData.basicInfo.email,
        password: completeData.basicInfo.password,
        dob: completeData.profileInfo.dob,
        // Keep relevant fields, remove athlete-specific ones
        country: completeData.profileInfo.country
        // Add any other fields you want to keep
      };
      
      // Use generic registration function
      await registerUser(registrationData);
      // The useEffect will handle redirection once auth state updates
    } catch (err) {
      console.error('Registration failed:', err);
      setRegistrationError(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleBackToStep = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleBackToRoleSelection = () => {
    navigate('/role-selection');
  };

  // Use registration error or auth context error
  const displayError = registrationError || error;

  return (
    <div className="page-bg-light">
      <div className="user-registration-page">
        <h1>Create Your Account</h1>
        <ProgressIndicator currentStep={step} totalSteps={3} />
        
        {displayError && <div className="error-banner">{displayError}</div>}
        
        <RegistrationForm 
          step={step}
          formData={formData}
          onNextStep={handleNextStep}
          onPrevStep={handlePrevStep}
          isLoading={loading}
        />
        {step === 1 && (
          <button
            type="button"
            className="back-link"
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </button>
        )}
        {(step === 2 || step === 3) && (
          <button
            type="button"
            className="back-link"
            onClick={handleBackToStep}
          >
            {step === 2 ? '← Back to Account' : '← Back to Profile'}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserRegistrationPage;
