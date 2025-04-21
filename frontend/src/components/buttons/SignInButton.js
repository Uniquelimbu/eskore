import React from 'react';
import { Link } from 'react-router-dom';
import './SignInButton.css';

/**
 * Isolated Sign In button component to prevent styling conflicts
 */
const SignInButton = ({ className = '', ...props }) => {
  return (
    <div className="sign-in-button-wrapper">
      <Link 
        to="/login" 
        className={`sign-in-button ${className}`} 
        {...props}
      >
        <span className="sign-in-text">I already have an account</span>
      </Link>
    </div>
  );
};

export default SignInButton;
