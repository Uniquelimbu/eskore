import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import './GetStartedButton.css';

const GetStartedButton = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const handleClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register'); // This will take users to the 3-step registration
    }
  };

  return (
    <button onClick={handleClick} className="get-started-button">
      {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
    </button>
  );
};

export default GetStartedButton;
