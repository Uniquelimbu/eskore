import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext'; 
import SingleStepForm from './components/SingleStepForm';
import './UserRegistrationPage.css';

const UserRegistrationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [redirectProgress, setRedirectProgress] = useState(0);
  const { registerUser } = useAuth();
  
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
      
      // Use the auth context registerUser method
      const response = await registerUser(formattedData);
      
      // Set registration success state
      setRegistrationSuccess(true);
      
      // Show progress bar for redirection
      const redirectDelay = 2000; // 2 seconds
      const updateInterval = 50; // Update every 50ms
      const steps = redirectDelay / updateInterval;
      let currentStep = 0;
      
      const progressInterval = setInterval(() => {
        currentStep++;
        setRedirectProgress(Math.min((currentStep / steps) * 100, 100));
        
        if (currentStep >= steps) {
          clearInterval(progressInterval);
          navigate('/login');
        }
      }, updateInterval);
    } catch (error) {
      console.error('Registration error:', error);
      setServerError(
        error.message || 
        'An error occurred during registration. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-registration-page-container">
      <div className="registration-page">
        <div className="registration-form-container">
          {registrationSuccess ? (
            <div className="registration-success">
              <div className="success-icon">✓</div>
              <h2>Registration Successful!</h2>
              <p>Your account has been created successfully.</p>
              <p>Redirecting to login page...</p>
              <div className="redirect-progress-container">
                <div 
                  className="redirect-progress-bar" 
                  style={{ width: `${redirectProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
        
        {!registrationSuccess && (
          <button
            type="button"
            className="back-to-home-btn"
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </button>
        )}
      </div>
    </div>
  );
};

export default UserRegistrationPage;
