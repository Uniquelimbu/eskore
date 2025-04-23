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
      displayName: '',
      bio: '',
      country: '',
      dateOfBirth: ''
    },
    gameInfo: {
      primaryGame: '',
      skillLevel: '',
      playingExperience: '',
      preferredPlatform: ''
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
      // Use the new fields for registrationData
      const registrationData = {
        firstName: completeData.basicInfo.firstName,
        middleName: completeData.basicInfo.middleName,
        lastName: completeData.basicInfo.lastName,
        email: completeData.basicInfo.email,
        password: completeData.basicInfo.password,
        // username removed
        dob: completeData.profileInfo.dateOfBirth || null,
        country: completeData.profileInfo.country || '',
        bio: completeData.profileInfo.bio || '',
        primaryGame: completeData.gameInfo.primaryGame || '',
        skillLevel: completeData.gameInfo.skillLevel || '',
        playingExperience: completeData.gameInfo.playingExperience || '',
        preferredPlatform: completeData.gameInfo.preferredPlatform || ''
      };
      
      // Register using auth context
      const result = await registerAthlete(registrationData);
      if (result) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      // Consider showing a local error message if context doesn't handle it
    }
  };

  const handleBackToRoleSelection = () => {
    navigate('/role-selection');
  };

  return (
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
      <button
        type="button"
        className="back-to-role-selection-link"
        onClick={handleBackToRoleSelection}
      >
        ← Back to Role Selection
      </button>
    </div>
  );
};

export default AthleteRegistrationPage;
