import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import PageLayout from '../../../../components/layout/PageLayout';
import './CreateTeam.css';

const CreateTeam = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeStep, setActiveStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState(null);
  const [formData, setFormData] = useState({
    clubName: '',
    nickname: '', 
    shortName: '',
    abbreviation: '',
    primaryColor: '#4a6cf7', // Default blue
    secondaryColor: '#ffffff', // Default white
    foundedYear: new Date().getFullYear().toString(),
    homeStadium: '',
    leagueId: '1', // Default to first league
    teamLogo: null
  });

  const [errors, setErrors] = useState({});
  const [leagues, setLeagues] = useState([
    { id: 1, name: 'Premier League' },
    { id: 2, name: 'La Liga' },
    { id: 3, name: 'Bundesliga' },
    { id: 4, name: 'Serie A' },
    { id: 5, name: 'Ligue 1' }
  ]);

  // Team kit preview canvas ref
  const kitCanvasRef = useRef(null);

  // Draw team kit preview when colors change
  useEffect(() => {
    if (kitCanvasRef.current) {
      const canvas = kitCanvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw jersey
      ctx.fillStyle = formData.primaryColor;
      ctx.fillRect(50, 20, 100, 160);
      
      // Draw collar
      ctx.fillStyle = formData.secondaryColor;
      ctx.fillRect(85, 20, 30, 10);
      
      // Draw sleeve lines
      ctx.fillStyle = formData.secondaryColor;
      ctx.fillRect(50, 40, 20, 5);
      ctx.fillRect(130, 40, 20, 5);
      
      // Draw team number
      ctx.font = "30px Arial";
      ctx.fillStyle = formData.secondaryColor;
      ctx.textAlign = "center";
      ctx.fillText(formData.abbreviation || "TM", 100, 100);
    }
  }, [formData.primaryColor, formData.secondaryColor, formData.abbreviation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
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

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.clubName.trim()) {
      newErrors.clubName = 'Club name is required';
    } else if (formData.clubName.length < 3 || formData.clubName.length > 30) {
      newErrors.clubName = 'Club name must be between 3 and 30 characters';
    }
    
    if (!formData.shortName.trim()) {
      newErrors.shortName = 'Short name is required';
    }
    
    if (!formData.abbreviation.trim()) {
      newErrors.abbreviation = 'Abbreviation is required';
    } else if (formData.abbreviation.length > 3) {
      newErrors.abbreviation = 'Abbreviation should be maximum 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.foundedYear) {
      newErrors.foundedYear = 'Founded year is required';
    } else if (parseInt(formData.foundedYear) < 1850 || parseInt(formData.foundedYear) > new Date().getFullYear()) {
      newErrors.foundedYear = `Year must be between 1850 and ${new Date().getFullYear()}`;
    }
    
    if (!formData.leagueId) {
      newErrors.leagueId = 'Please select a league';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Perform final validation
    if (validateStep1() && validateStep2()) {
      // Here we would typically make an API call to create the team
      console.log('Form submitted:', formData);
      
      // Show success message and redirect to teams page
      alert('Team created successfully!');
      navigate('/teams');
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
                <label htmlFor="clubName">Club Name*</label>
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
              
              <div className="form-group">
                <label htmlFor="nickname">Nickname <span className="optional">(optional)</span></label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="Enter team nickname"
                />
                <small className="form-hint">Common name fans use (e.g. The Purple knights)</small>
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="shortName">Short Name*</label>
                  <input
                    type="text"
                    id="shortName"
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleChange}
                    className={errors.shortName ? 'input-error' : ''}
                    placeholder="Enter short name"
                  />
                  {errors.shortName && <div className="error-message">{errors.shortName}</div>}
                  <small className="form-hint">Commonly used name (e.g. Eskore FC)</small>
                </div>
                
                <div className="form-group half">
                  <label htmlFor="abbreviation">Abbreviation*</label>
                  <input
                    type="text"
                    id="abbreviation"
                    name="abbreviation"
                    value={formData.abbreviation}
                    onChange={handleChange}
                    className={errors.abbreviation ? 'input-error' : ''}
                    placeholder="e.g. MUN"
                    maxLength={3}
                    style={{textTransform: 'uppercase'}}
                  />
                  {errors.abbreviation && <div className="error-message">{errors.abbreviation}</div>}
                  <small className="form-hint">3-letter code (e.g. EFC)</small>
                </div>
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
                  <label htmlFor="leagueId">League*</label>
                  <select
                    id="leagueId"
                    name="leagueId"
                    value={formData.leagueId}
                    onChange={handleChange}
                    className={errors.leagueId ? 'input-error' : ''}
                  >
                    <option value="" disabled>Select a league</option>
                    {leagues.map(league => (
                      <option key={league.id} value={league.id}>{league.name}</option>
                    ))}
                  </select>
                  {errors.leagueId && <div className="error-message">{errors.leagueId}</div>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="homeStadium">Home Stadium <span className="optional">(optional)</span></label>
                <input
                  type="text"
                  id="homeStadium"
                  name="homeStadium"
                  value={formData.homeStadium}
                  onChange={handleChange}
                  placeholder="Enter stadium name"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="primaryColor">Primary Color*</label>
                  <div className="color-picker-container">
                    <input
                      type="color"
                      id="primaryColor"
                      name="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleChange}
                      className="color-picker"
                    />
                    <span className="color-code">{formData.primaryColor}</span>
                  </div>
                </div>
                
                <div className="form-group half">
                  <label htmlFor="secondaryColor">Secondary Color*</label>
                  <div className="color-picker-container">
                    <input
                      type="color"
                      id="secondaryColor"
                      name="secondaryColor"
                      value={formData.secondaryColor}
                      onChange={handleChange}
                      className="color-picker"
                    />
                    <span className="color-code">{formData.secondaryColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="step-content">
            <div className="form-section">
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
              
              <h3 className="section-title">Team Preview</h3>
              <div className="team-preview-container">
                <div className="team-info-preview">
                  <h4>{formData.clubName || 'Club Name'}</h4>
                  <p>Est. {formData.foundedYear || new Date().getFullYear()}</p>
                  <p>{formData.shortName || 'Short Name'} ({formData.abbreviation || 'ABR'})</p>
                  <p>{leagues.find(l => l.id.toString() === formData.leagueId.toString())?.name || 'League'}</p>
                </div>
                
                <div className="team-kit-preview">
                  <h4>Team Colors</h4>
                  <canvas ref={kitCanvasRef} width="200" height="200" className="kit-canvas"></canvas>
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
            <div className="step-line"></div>
            <div className={`step ${activeStep >= 2 ? 'active' : ''} ${activeStep > 2 ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Team Details</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${activeStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Logo & Preview</div>
            </div>
          </div>
          
          <form className="create-team-form" onSubmit={handleSubmit}>
            {renderStepContent()}
            
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
                    >
                      Back
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="btn-create-team"
                  >
                    Create Team
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </PageLayout>
    </div>
  );
};

export default CreateTeam;
