import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SingleStepForm from './components/SingleStepForm';
import './UserRegistrationPage.css';
import { useAuth } from '../../../contexts/AuthContext';

const UserRegistrationPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '',
    agreeTerms: false,
    allowLocation: false
  });
  
  const [registrationError, setRegistrationError] = useState(null);
  const navigate = useNavigate();
  const { registerUser, loading, error, isAuthenticated } = useAuth();

  // This useEffect will handle redirect on successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (formData) => {
    try {
      setRegistrationError(null);
      
      // Prepare registration data for API - only sending essential info
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        dob: formData.dob
      };
      
      // Register user
      await registerUser(registrationData);
      // The useEffect will handle redirection once auth state updates
    } catch (err) {
      console.error('Registration failed:', err);
      setRegistrationError(err.message || 'Registration failed. Please try again.');
    }
  };
  
  // Use registration error or auth context error
  const displayError = registrationError || error;

  return (
    <div className="page-bg-light">
      <div className="user-registration-page">
        <h1>Create Your Account</h1>
        
        {displayError && <div className="error-banner">{displayError}</div>}
        
        <SingleStepForm 
          formData={formData}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
        
        <button
          type="button"
          className="back-link"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default UserRegistrationPage;
