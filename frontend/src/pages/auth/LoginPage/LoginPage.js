import React, { useState } from 'react';
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
  React.useEffect(() => {
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
    if (validateForm()) {
      try {
        const result = await login(credentials.email, credentials.password);
        if (result) {
          navigate('/dashboard');
        }
      } catch (err) {
        // Error is handled by context and shown in UI
        // Optionally, you can log or show a toast here
      }
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate('/not-found');
  };

  return (
    <div className="page-bg-light">
      <div className="login-page">
        <Link to="/role-selection" className="login-signup-top-btn">
          Sign up
        </Link>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
          <div className="login-container">
            <h1>Welcome Back</h1>
            <p className="subtitle">Sign in to continue to eSkore</p>
            {error && <div className="error-banner">{error}</div>}
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
              <button 
                type="submit" 
                className="login-button" 
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
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
