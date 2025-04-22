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
      username: '',
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
      // Format data according to backend expectations
      const nameParts = completeData.profileInfo.displayName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      const registrationData = {
        firstName,
        lastName,
        email: completeData.basicInfo.email,
        password: completeData.basicInfo.password,
        username: completeData.basicInfo.username,
        dob: completeData.profileInfo.dateOfBirth,
        country: completeData.profileInfo.country,
        bio: completeData.profileInfo.bio,
        primaryGame: completeData.gameInfo.primaryGame,
        skillLevel: completeData.gameInfo.skillLevel,
        playingExperience: completeData.gameInfo.playingExperience,
        preferredPlatform: completeData.gameInfo.preferredPlatform
      };
      
      // Register using auth context
      await registerAthlete(registrationData);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by auth context
      console.error('Registration failed:', err);
    }
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
    </div>
  );
};

export default AthleteRegistrationPage;
