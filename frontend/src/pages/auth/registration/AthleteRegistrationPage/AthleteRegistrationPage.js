import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import ProgressIndicator from './components/ProgressIndicator';
import './AthleteRegistrationPage.css';
import { useAuth } from '../../../../contexts/AuthContext';

const AthleteRegistrationPage = () => {
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
      // province removed
    },
    gameInfo: {
      // No longer used, but keep for step logic
    }
  });
  
  const navigate = useNavigate();
  const { registerAthlete, loading, error } = useAuth();

  const handleNextStep = (stepData) => {
    if (step === 1) {
      setFormData({ ...formData, basicInfo: stepData });
      setStep(2);
    } else if (step === 2) {
      setFormData({ ...formData, profileInfo: stepData });
      setStep(3);
    } else if (step === 3) {
      setFormData({ ...formData, gameInfo: stepData });
      // Submit registration
      handleSubmit({ ...formData, gameInfo: stepData });
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (completeData) => {
    try {
      const registrationData = {
        firstName: completeData.basicInfo.firstName,
        middleName: completeData.basicInfo.middleName,
        lastName: completeData.basicInfo.lastName,
        email: completeData.basicInfo.email,
        password: completeData.basicInfo.password,
        dob: completeData.profileInfo.dob,
        height: completeData.profileInfo.height,
        position: completeData.profileInfo.position,
        country: completeData.profileInfo.country
        // province removed
      };
      
      // Register using auth context
      const result = await registerAthlete(registrationData);
      if (result && (result.athlete || result.user)) {
        // Registration successful, redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      // Consider showing a local error message if context doesn't handle it
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

  return (
    <div className="page-bg-light">
      <div className="athlete-registration-page">
        <h1>Create Your Athlete Account</h1>
        <ProgressIndicator currentStep={step} totalSteps={3} />
        
        {error && <div className="error-banner">{error}</div>}
        
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
            className="back-to-role-selection-link"
            onClick={handleBackToRoleSelection}
          >
            ← Back to Role Selection
          </button>
        )}
        {(step === 2 || step === 3) && (
          <button
            type="button"
            className="back-to-role-selection-link"
            onClick={handleBackToStep}
          >
            {step === 2 ? '← Back to Account' : '← Back to Profile'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AthleteRegistrationPage;
