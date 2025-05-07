import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../services/apiClient';
import SingleStepForm from './components/SingleStepForm';
import './UserRegistrationPage.css';

const UserRegistrationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  
  // Initial form state - removed height, position, and country
  const initialFormData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dobMonth: '',
    dobDay: '',
    dobYear: '',
    termsConsent: false
  };

  // Handle form submission
  const handleSubmit = async (formData) => {
    setLoading(true);
    setServerError('');
    
    try {
      // Format the date from separate fields
      const formattedData = { ...formData };
      
      if (formData.dobYear && formData.dobMonth && formData.dobDay) {
        formattedData.dob = `${formData.dobYear}-${formData.dobMonth.padStart(2, '0')}-${formData.dobDay.padStart(2, '0')}`;
      }
      
      // Remove fields not needed for API
      delete formattedData.dobYear;
      delete formattedData.dobMonth;
      delete formattedData.dobDay;
      delete formattedData.confirmPassword;
      
      // Send registration request
      const response = await apiClient.post('/api/auth/register', formattedData);
      
      // Handle successful registration
      if (response.success) {
        navigate('/login?registered=true');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setServerError(
        error.response?.data?.message || 
        'An error occurred during registration. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-bg-light">
      <div className="registration-page">
        <div className="user-registration-page">
          <h1>Create Your Account</h1>
          <SingleStepForm 
            initialFormData={initialFormData}
            onSubmit={handleSubmit}
            loading={loading}
            serverError={serverError}
          />
          
          <div className="login-redirect">
            <button 
              type="button" 
              className="login-redirect-btn"
              onClick={() => navigate('/login')}
            >
              Already have an account?
            </button>
          </div>
        </div>
        
        {/* Back to Home button outside the registration card */}
        <button
          type="button"
          className="back-to-home-btn"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default UserRegistrationPage;
