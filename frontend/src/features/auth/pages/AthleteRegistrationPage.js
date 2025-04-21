import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './AthleteRegistrationPage.css';
// Fix the import path to use the correct API paths
import { authAPI } from '../../auth/api/authApi';
import { locationAPI } from '../../../utils/api/registry'; // Updated import path
// Import LazyImage from the correct location
import LazyImage from '../../../components/LazyImage/LazyImage';

// Use placeholder function for logo since we don't have the actual image file
const logoPlaceholder = () => {
  return (
    <div 
      style={{ 
        width: '40px', 
        height: '40px', 
        backgroundColor: '#2E1F5E', 
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold'
      }}
    >
      eS
    </div>
  );
};

function AthleteRegistrationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    height: '',
    position: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    province: '',
    district: '',
    city: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear related fields when country or province changes
    if (name === 'country') {
      setFormData(prev => ({ 
        ...prev, 
        province: '',
        district: '',
        city: '' 
      }));
      // Load provinces for the selected country
      fetchProvinces(value);
    }
    
    if (name === 'province') {
      setFormData(prev => ({ 
        ...prev, 
        district: '',
        city: '' 
      }));
      
      // If Nepal, load districts, else load cities
      if (formData.country === 'Nepal') {
        fetchDistricts(value);
      } else {
        fetchCities(value);
      }
    }
    
    if (name === 'district') {
      setFormData(prev => ({ ...prev, city: '' }));
      fetchCities(value);
    }
  };

  // Fetch provinces based on country
  const fetchProvinces = async (country) => {
    try {
      const response = await locationAPI.getProvinces(country);
      setProvinces(response.data);
    } catch (err) {
      console.error('Error fetching provinces:', err);
    }
  };
  
  // Fetch districts based on province (Nepal only)
  const fetchDistricts = async (province) => {
    if (formData.country !== 'Nepal') return;
    
    try {
      const response = await locationAPI.getDistricts(province);
      setDistricts(response.data);
    } catch (err) {
      console.error('Error fetching districts:', err);
    }
  };
  
  // Fetch cities based on province or district
  const fetchCities = async (parent) => {
    try {
      const params = formData.country === 'Nepal' 
        ? { district: parent } 
        : { province: parent };
      
      const response = await locationAPI.getCities(params);
      setCities(response.data);
    } catch (err) {
      console.error('Error fetching cities:', err);
    }
  };

  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.height) newErrors.height = 'Height is required';
    if (!formData.position) newErrors.position = 'Position is required';
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Location validation
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.province) newErrors.province = 'Province is required';
    if (formData.country === 'Nepal' && !formData.district) {
      newErrors.district = 'District is required';
    }
    if (!formData.city) newErrors.city = 'City is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await authAPI.registerAthlete(formData);
      
      // Set user session with the token
      localStorage.setItem('token', response.data.token);
      
      // Redirect to athlete home
      navigate('/athlete/home');
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({
        submit: err.response?.data?.message || 'Registration failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle OAuth login
  const handleOAuthLogin = (provider) => {
    window.location.href = `/api/auth/${provider}?role=athlete`;
  };

  return (
    <div className="athlete-registration-page">
      <Helmet>
        <title>Join eSkore as an Athlete</title>
        <meta name="description" content="Register as an athlete on eSkore and start building your sports profile." />
        {/* Add this style tag to fix the body background only for this page */}
        <style type="text/css">{`
          body {
            margin: 0;
            padding: 0;
            background-color: #222729;
            overflow-x: hidden;
          }
        `}</style>
      </Helmet>
      
      {/* Simplified header with just the login button */}
      <div className="simple-header">
        <div className="nav-actions">
          <Link to="/login" className="login-link">Login</Link>
        </div>
      </div>
      
      <div className="registration-container">
        <div className="registration-content">
          <h2>Create Your Athlete Profile</h2>
          <p>Fill out your information to get started</p>
          
          {errors.submit && (
            <div className="error-message" role="alert">
              {errors.submit}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <div className="error-text">{errors.firstName}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <div className="error-text">{errors.lastName}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className={errors.dob ? 'error' : ''}
                />
                {errors.dob && <div className="error-text">{errors.dob}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="height">Height (cm)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  min="0"
                  className={errors.height ? 'error' : ''}
                />
                {errors.height && <div className="error-text">{errors.height}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="position">Position</label>
                <select
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className={errors.position ? 'error' : ''}
                >
                  <option value="">Select Position</option>
                  <option value="FW">Forward (FW)</option>
                  <option value="MD">Midfielder (MD)</option>
                  <option value="DF">Defender (DF)</option>
                  <option value="GK">Goalkeeper (GK)</option>
                </select>
                {errors.position && <div className="error-text">{errors.position}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={errors.country ? 'error' : ''}
                >
                  <option value="">Select Country</option>
                  <option value="Nepal">Nepal</option>
                  <option value="Canada">Canada</option>
                </select>
                {errors.country && <div className="error-text">{errors.country}</div>}
              </div>
            </div>
            
            {/* Conditional location fields based on country */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="province">Province</label>
                <select
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  disabled={!formData.country}
                  className={errors.province ? 'error' : ''}
                >
                  <option value="">Select Province</option>
                  {provinces.map(province => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
                {errors.province && <div className="error-text">{errors.province}</div>}
              </div>
              
              {formData.country === 'Nepal' && (
                <div className="form-group">
                  <label htmlFor="district">District</label>
                  <select
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    disabled={!formData.province}
                    className={errors.district ? 'error' : ''}
                  >
                    <option value="">Select District</option>
                    {districts.map(district => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  {errors.district && <div className="error-text">{errors.district}</div>}
                </div>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={formData.country === 'Nepal' ? !formData.district : !formData.province}
                  className={errors.city ? 'error' : ''}
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {errors.city && <div className="error-text">{errors.city}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <div className="error-text">{errors.email}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <div className="error-text">{errors.password}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
              </div>
            </div>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            
            <div className="oauth-section">
              <div className="divider">
                <span>or</span>
              </div>
              
              <div className="oauth-buttons">
                <button 
                  type="button"
                  className="google-btn oauth-btn"
                  onClick={() => handleOAuthLogin('google')}
                >
                  <span className="oauth-icon">G</span>
                  Continue with Google
                </button>
                
                <button 
                  type="button"
                  className="facebook-btn oauth-btn"
                  onClick={() => handleOAuthLogin('facebook')}
                >
                  <span className="oauth-icon">f</span>
                  Continue with Facebook
                </button>
              </div>
            </div>
          </form>
          
          <div className="back-option">
            <Link to="/role-selection" className="back-link">
              <span className="back-arrow">←</span> Back to role selection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AthleteRegistrationPage;
