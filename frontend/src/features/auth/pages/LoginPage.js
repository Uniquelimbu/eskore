import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Form validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const validatePassword = (password) => {
    return password.length >= 6;
  };
  
  const getEmailError = () => {
    if (!touched.email) return '';
    if (!email) return 'Email is required';
    if (!validateEmail(email)) return 'Please enter a valid email';
    return '';
  };
  
  const getPasswordError = () => {
    if (!touched.password) return '';
    if (!password) return 'Password is required';
    if (!validatePassword(password)) return 'Password must be at least 6 characters';
    return '';
  };
  
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    setTouched({ email: true, password: true });
    
    if (!validateEmail(email) || !validatePassword(password)) {
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const credentials = { email, password };
      const result = await login(credentials);
      
      if (result.success) {
        // Navigate to the appropriate path based on user role
        navigate(result.redirectPath);
      } else {
        // Enhanced error handling with more specific messages
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      // More detailed error handling
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setError('Invalid email or password. Please try again.');
            break;
          case 429:
            setError('Too many login attempts. Please try again later.');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError(err.response.data?.message || 'Login failed. Please try again.');
        }
      } else if (err.request) {
        setError('Cannot connect to server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      {/* Top navigation */}
      <div className="login-top-nav">
        <button 
          className="close-button" 
          onClick={() => navigate('/')}
          aria-label="Close login form"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <Link to="/role-selection" className="signup-button">SIGN UP</Link>
      </div>

      {/* Login form */}
      <div className="login-form-container">
        <h1 className="login-title">Log in</h1>
        
        {error && <div className="error-message" role="alert">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className={`form-group ${getEmailError() ? 'has-error' : ''}`}>
            <label htmlFor="email" className="visually-hidden">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              aria-invalid={!!getEmailError()}
              aria-describedby={getEmailError() ? "email-error" : undefined}
              required
            />
            {getEmailError() && <div id="email-error" className="field-error">{getEmailError()}</div>}
          </div>
          
          <div className={`form-group ${getPasswordError() ? 'has-error' : ''}`}>
            <label htmlFor="password" className="visually-hidden">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              aria-invalid={!!getPasswordError()}
              aria-describedby={getPasswordError() ? "password-error" : undefined}
              required
            />
            {getPasswordError() && <div id="password-error" className="field-error">{getPasswordError()}</div>}
          </div>
          
          {/* Remember me checkbox removed */}
          
          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'SIGNING IN...' : 'LOG IN'}
          </button>
          
          <div className="forgot-password">
            <Link to="/forgot-password">FORGOT PASSWORD?</Link>
          </div>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="social-login">
          <button 
            className="social-button facebook"
            aria-label="Sign in with Facebook"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z"></path>
            </svg>
            <span>Facebook</span>
          </button>
          
          <button 
            className="social-button google"
            aria-label="Sign in with Google"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"></path>
              <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"></path>
              <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"></path>
              <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"></path>
            </svg>
            <span>Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;