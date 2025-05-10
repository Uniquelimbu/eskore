import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  
  const navigate = useNavigate();
  const { login, loading, error, isAuthenticated } = useAuth();
  
  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const errors = {};
    if (!credentials.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = 'Email is invalid';
    }
    if (!credentials.password) {
      errors.password = 'Password is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    
    if (validateForm()) {
      console.log("Form validation passed, attempting login with:", credentials.email);
      try {
        // Add explicit try/catch with better logging
        console.log("Calling login function with credentials");
        const result = await login(credentials.email, credentials.password);
        console.log("Login result:", result);
        
        if (result && result.success) {
          console.log("Login successful, navigating to dashboard");
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Login error details:', err);
        // Error is handled by context
      }
    } else {
      console.warn("Form validation failed. Errors:", formErrors);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate('/not-found');
  };

  return (
    <div className="login-page-container"> {/* Changed from page-bg-light */}
      <div className="login-page"> {/* This class can remain if it serves other layout purposes */}
        
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
          <div className="login-form-container"> {/* Changed from login-container */}
            <h1>Welcome Back</h1>
            <p className="subtitle">Sign in to continue to eSkore</p>
            {error && <div className="error-banner">{error}</div>}
            
            {/* FIX: Using onSubmit only, not mixing with onClick on button */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={loading}
                  required
                  autoComplete="email"
                  aria-required="true"
                />
                {formErrors.email && <div className="error" role="alert">{formErrors.email}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  disabled={loading}
                  required
                  autoComplete="current-password"
                  aria-required="true"
                />
                {formErrors.password && <div className="error" role="alert">{formErrors.password}</div>}
              </div>
              <button
                type="button"
                className="forgot-password-btn"
                onClick={handleForgotPassword}
                tabIndex={0}
              >
                Forgot password?
              </button>
              
              {/* FIX: Simplified button with better accessibility */}
              <button 
                type="submit" 
                className="login-button" 
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            
            {/* Add "Create a new account" link */}
            <div className="create-account-link">
              <span>Don't have an account? </span>
              <Link to="/register">Create a new account</Link>
            </div>
          </div>
          {/* Move Back to Home button OUTSIDE the card */}
          <button
            type="button"
            className="back-to-home-btn centered-back-btn"
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
