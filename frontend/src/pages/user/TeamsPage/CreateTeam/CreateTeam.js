import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../../../services/apiClient';
import Sidebar from '../../components/Sidebar/Sidebar';
import PageLayout from '../../../../components/layout/PageLayout';
import ManagerRegistrationForm from './ManagerDetails';
import './CreateTeam.css';

const CreateTeam = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeStep, setActiveStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState(null);
  const [formData, setFormData] = useState({
    clubName: '',
    nickname: '', 
    abbreviation: '',
    foundedYear: new Date().getFullYear().toString(),
    city: '',
    teamLogo: null
  });
  // eslint-disable-next-line no-unused-vars
  const [managerData, setManagerData] = useState(null);
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [createdTeamId, setCreatedTeamId] = useState(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Perform validation immediately when the field changes
    validateField(name, value);
  };

  // New function for real-time field validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    const currentYear = new Date().getFullYear();
    
    switch (name) {
      case 'abbreviation':
        if (!value.trim()) {
          newErrors.abbreviation = 'Abbreviation is required';
        } else if (value.length < 2 || value.length > 3) {
          newErrors.abbreviation = 'Abbreviation must be 2-3 characters';
        } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
          newErrors.abbreviation = 'Abbreviation can only contain letters and numbers';
        } else {
          delete newErrors.abbreviation;
        }
        break;
      
      case 'clubName':
        if (!value.trim()) {
          newErrors.clubName = 'Club name is required';
        } else if (value.length < 3 || value.length > 30) {
          newErrors.clubName = 'Club name must be between 3 and 30 characters';
        } else if (!/^[a-zA-Z0-9\s\-_.&'()]+$/.test(value)) {
          newErrors.clubName = 'Club name can only contain letters, numbers, spaces, and basic symbols (-, _, ., &, \', (, ))';
        } else {
          delete newErrors.clubName;
        }
        break;
      
      case 'foundedYear':
        if (value && (parseInt(value) < 1850 || parseInt(value) > currentYear)) {
          newErrors.foundedYear = `Year must be between 1850 and ${currentYear}`;
        } else {
          delete newErrors.foundedYear;
        }
        break;
      
      case 'city':
        if (!value) {
          newErrors.city = 'City is required';
        } else if (!/^[a-zA-Z0-9\s\-_.&'()áéíóúÁÉÍÓÚñÑçÇâêîôûÂÊÎÔÛäëïöüÄËÏÖÜàèìòùÀÈÌÒÙ]+$/.test(value)) {
          newErrors.city = 'City name can only contain letters, numbers, spaces, accented characters, and basic symbols (-, _, ., &, \', (, ))';
        } else {
          delete newErrors.city;
        }
        break;
      
      case 'nickname':
        if (value && !/^[a-zA-Z0-9\s\-_.&'()]+$/.test(value)) {
          newErrors.nickname = 'Nickname can only contain letters, numbers, spaces, and basic symbols (-, _, ., &, \', (, ))';
        } else {
          delete newErrors.nickname;
        }
        break;
      
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep1 = () => {
    const fieldsToValidate = ['clubName', 'abbreviation'];
    let isValid = true;
    
    fieldsToValidate.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  const validateStep2 = () => {
    const fieldsToValidate = ['foundedYear', 'city', 'nickname'];
    let isValid = true;
    
    fieldsToValidate.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData({
          ...formData,
          teamLogo: file
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoClick = () => {
    fileInputRef.current.click();
  };
  
  const handleNextStep = () => {
    if (activeStep === 1 && validateStep1()) {
      setActiveStep(2);
    } else if (activeStep === 2 && validateStep2()) {
      setActiveStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const logErrorDetails = (error, context) => {
    console.error(`Error during ${context}:`, error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error Response Data:', error.response.data);
      console.error('Error Response Status:', error.response.status);
      console.error('Error Response Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error('Error Request Data:', error.request);
      console.error('No response received for the request.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error Message:', error.message);
    }
    console.error('Error Config:', error.config);
  };

  const handleManagerFormSubmit = async (managerFormData) => {
    try {
      setIsSubmitting(true);
      
      // Save manager profile data
      const response = await apiClient.post('/managers', {
        ...managerFormData,
        teamId: createdTeamId
      });
      
      if (response && response.success) {
        toast.success("Manager profile created successfully!");
        setManagerData(managerFormData);
        navigateToTeamSpace();
      } else {
        console.error('Error creating manager profile:', response);
        toast.warn("Team created but manager profile couldn't be saved");
        navigateToTeamSpace();
      }
    } catch (error) {
      console.error('Error saving manager profile:', error);
      toast.warn("Team created but manager profile couldn't be saved");
      navigateToTeamSpace();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleManagerFormCancel = () => {
    // Skip manager profile creation but still navigate to team space
    navigateToTeamSpace();
  };
  
  const navigateToTeamSpace = () => {
    if (createdTeamId) {
      localStorage.setItem('lastTeamId', createdTeamId);
      navigate(`/teams/${createdTeamId}/space`);
    } else {
      console.error("Team ID is missing");
      setSubmitError("Team was created but navigation failed. Please go to Teams page.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    // Validate both steps
    if (validateStep1() && validateStep2()) {
      setIsSubmitting(true);
      setSubmitError(null);
      
      const teamPayload = {
        name: formData.clubName,
        abbreviation: formData.abbreviation,
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : null,
        city: formData.city,
        nickname: formData.nickname
      };

      console.log("Attempting to create team with payload:", teamPayload);

      try {
        // First, check if user is authenticated before proceeding
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Your session has expired. Please log in again.');
          navigate('/login');
          return;
        }

        const teamResponse = await apiClient.post('/teams', teamPayload);
        
        console.log("Team creation API response:", teamResponse);
        
        if (!teamResponse || !teamResponse.team || !teamResponse.team.id) {
          throw new Error('Invalid response from server: Missing team data');
        }
        
        const teamId = teamResponse.team.id;
        setCreatedTeamId(teamId);
        
        // If there's a logo, upload it in a separate request
        if (formData.teamLogo) {
          console.log("Attempting to upload logo for team ID:", teamId);
          const logoData = new FormData();
          logoData.append('logo', formData.teamLogo);
          
          try {
            const logoResponse = await apiClient.patch(`/teams/${teamId}/logo`, logoData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            console.log("Logo upload API response:", logoResponse);
          } catch (logoError) {
            console.error("Error uploading team logo:", logoError);
            toast.warn("Team created but logo upload failed. You can add a logo later.");
          }
        }
        
        // Show manager registration form instead of directly navigating
        setShowManagerForm(true);
        setIsSubmitting(false);
        
      } catch (error) {
        logErrorDetails(error, formData.teamLogo ? 'team creation or logo upload' : 'team creation');
        
        // Check for auth errors
        if (error.status === 401 || error.code === 'AUTH_ERROR') {
          toast.error('Your session has expired. Please log in again.');
          navigate('/login');
          return;
        }
        
        const errorMessage = 
          error.response?.data?.message || 
          error.response?.data?.error?.message || // Check for nested error message
          (error.response?.data?.errors && typeof error.response.data.errors === 'object' 
            ? Object.values(error.response.data.errors).flat().join(' ') 
            : null) ||
          error.message || // Fallback to generic Axios error message
          'An error occurred while creating the team. Please try again.';
        setSubmitError(errorMessage);
        setIsSubmitting(false);
      }
    }
  };
  
  const renderStepContent = () => {
    switch(activeStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="form-section">
              <h3 className="section-title">Team Identity</h3>
              
              <div className="form-group">
                <label htmlFor="clubName" data-required="*">Club Name</label>
                <input
                  type="text"
                  id="clubName"
                  name="clubName"
                  value={formData.clubName}
                  onChange={handleChange}
                  className={errors.clubName ? 'input-error' : ''}
                  placeholder="Enter full team name"
                />
                {errors.clubName && <div className="error-message">{errors.clubName}</div>}
                <small className="form-hint">The official name of your club (e.g. Eskore United Football Club)</small>
              </div>
              
              <div className="form-group">                <label htmlFor="nickname">Nickname <span className="optional">(optional)</span></label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  className={errors.nickname ? 'input-error' : ''}
                  placeholder="Enter team nickname"
                />
                {errors.nickname && <div className="error-message">{errors.nickname}</div>}
                <small className="form-hint">Common name fans use (e.g. The Purple knights)</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="abbreviation" data-required="*">Abbreviation</label>
                <input
                  type="text"
                  id="abbreviation"
                  name="abbreviation"
                  value={formData.abbreviation}
                  onChange={handleChange}
                  className={errors.abbreviation ? 'input-error' : ''}
                  placeholder="e.g. MUN"
                  maxLength={3}  // Updated max length to 3
                  style={{textTransform: 'uppercase'}}
                />
                {errors.abbreviation && <div className="error-message">{errors.abbreviation}</div>}
                <small className="form-hint">2-3 letter code (e.g. MUN, BAR)</small>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="step-content">
            <div className="form-section">
              <h3 className="section-title">Team Details</h3>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="foundedYear">Founded Year*</label>
                  <input
                    type="number"
                    id="foundedYear"
                    name="foundedYear"
                    value={formData.foundedYear}
                    onChange={handleChange}
                    className={errors.foundedYear ? 'input-error' : ''}
                    placeholder="e.g. 1878"
                    min="1850"
                    max={new Date().getFullYear()}
                  />
                  {errors.foundedYear && <div className="error-message">{errors.foundedYear}</div>}
                </div>
                
                <div className="form-group half">
                  <label htmlFor="city">City*</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={errors.city ? 'input-error' : ''}
                    placeholder="e.g. Manchester"
                  />
                  {errors.city && <div className="error-message">{errors.city}</div>}
                </div>
              </div>
              
              <h3 className="section-title">Team Logo</h3>
              
              <div className="logo-upload-container">
                <div 
                  className="logo-upload-area"
                  onClick={handleLogoClick}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Team logo preview" className="logo-preview" />
                  ) : (
                    <div className="logo-placeholder">
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">Click to upload logo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
                <div className="logo-instructions">
                  <h4>Logo Guidelines:</h4>
                  <ul>
                    <li>Square format recommended (1:1 ratio)</li>
                    <li>PNG or JPG format</li>
                    <li>Max file size: 5MB</li>
                    <li>Transparent background preferred</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="step-content">
            <div className="form-section">
              <h3 className="section-title">Review Team Information</h3>
              
              <div className="team-preview-container">
                <div className="team-info-preview">
                  <h4>{formData.clubName || 'Club Name'}</h4>
                  <p>Est. {formData.foundedYear || new Date().getFullYear()}</p>
                  <p>{formData.abbreviation || 'ABR'}</p>
                  <p>{formData.city || 'City'}</p>
                  {formData.nickname && <p>"{formData.nickname}"</p>}
                </div>
                
                <div className="logo-preview-container">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Team logo" className="logo-preview-large" />
                  ) : (
                    <div className="logo-placeholder large">
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">No logo uploaded</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="create-team-page-layout">
      <Sidebar />
      <PageLayout className="create-team-page-content" maxWidth="1200px" withPadding={true}>
        {showManagerForm ? (
          <div className="manager-form-overlay">
            <ManagerRegistrationForm
              onSubmit={handleManagerFormSubmit}
              onCancel={handleManagerFormCancel}
            />
          </div>
        ) : (
          <>
            <div className="create-team-header">
              <h1>Create New Team</h1>
              <p className="create-team-subtitle">Build your own club from the ground up</p>
            </div>
            
            <div className="create-team-form-container">
              <div className="stepper">
                <div className={`step ${activeStep >= 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`}>
                  <div className="step-number">1</div>
                  <div className="step-label">Team Identity</div>
                </div>
                <div className="step-line step-line-1"></div>
                <div className={`step ${activeStep >= 2 ? 'active' : ''} ${activeStep > 2 ? 'completed' : ''}`}>
                  <div className="step-number">2</div>
                  <div className="step-label">Team Details</div>
                </div>
                <div className="step-line step-line-2"></div>
                <div className={`step ${activeStep >= 3 ? 'active' : ''}`}>
                  <div className="step-number">3</div>
                  <div className="step-label">Review</div>
                </div>
              </div>
              
              <form className="create-team-form" onSubmit={handleSubmit}>
                {renderStepContent()}
                
                {submitError && (
                  <div className="submission-error">
                    {submitError}
                  </div>
                )}
                
                <div className="form-actions">
                  {activeStep === 1 && (
                    <>
                      <div className="spacer">
                        <button
                          type="button"
                          className="btn-prev-step"
                          onClick={() => navigate('/teams')}
                        >
                          Back
                        </button>
                      </div>
                      <button
                        type="button"
                        className="btn-next-step"
                        onClick={handleNextStep}
                      >
                        Next
                      </button>
                    </>
                  )}
                  {activeStep > 1 && activeStep < 3 && (
                    <>
                      <div className="spacer">
                        <button
                          type="button"
                          className="btn-prev-step"
                          onClick={handlePreviousStep}
                        >
                          Back
                        </button>
                      </div>
                      <button
                        type="button"
                        className="btn-next-step"
                        onClick={handleNextStep}
                      >
                        Next
                      </button>
                    </>
                  )}
                  {activeStep === 3 && (
                    <>
                      <div className="spacer">
                        <button
                          type="button"
                          className="btn-prev-step"
                          onClick={handlePreviousStep}
                          disabled={isSubmitting}
                        >
                          Back
                        </button>
                      </div>
                      <button
                        type="submit"
                        className="btn-create-team"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Creating...' : 'Create Team'}
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </>
        )}
      </PageLayout>
    </div>
  );
};

export default CreateTeam;
