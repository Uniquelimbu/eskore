import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { apiClient, teamService } from '../../../../../../services'; // Updated import paths
import { isUserManager } from '../../../../../../utils/permissions';
import './Settings.css';

const Settings = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const outletCtx = useOutletContext(); // {team, isManager}
  const fileInputRef = useRef(null);

  const [team, setTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    city: '',
    abbreviation: '', 
    foundedYear: '',
    logoUrl: ''
  });
  const [logoFile, setLogoFile] = useState(null); // Added state for logo file
  const [logoPreview, setLogoPreview] = useState(null); // Added state for logo preview
  const [statusMsg, setStatusMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isManager, setIsManager] = useState(outletCtx?.isManager || false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({}); // Added validation errors state

  // Fetch team details on mount
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get(`/teams/${teamId}`);
        setTeam(data);
        setFormData({
          name: data.name || '',
          nickname: data.nickname || '',
          city: data.city || '',
          abbreviation: data.abbreviation || '', // Set abbreviation from data
          foundedYear: data.foundedYear || '',
          logoUrl: data.logoUrl || ''
        });

        // Set logo preview if logo exists
        if (data.logoUrl) {
          setLogoPreview(data.logoUrl.startsWith('http') ? data.logoUrl : `${process.env.REACT_APP_API_URL || ''}${data.logoUrl}`);
        }
        
        const resolvedIsManager = (outletCtx && outletCtx.isManager !== undefined)
          ? outletCtx.isManager
          : isUserManager(data, user);

        setIsManager(resolvedIsManager);
      } catch (err) {
        console.error('Error loading team:', err);
        setStatusMsg({ type: 'error', text: err.message || 'Failed to load team.' });
      } finally {
        setLoading(false);
      }
    };
    if (teamId) fetchTeam();
  }, [teamId, user, outletCtx]);

  // Additional effect to fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        if (teamId) {
          const response = await apiClient.get(`/teams/${teamId}/members`);
          if (response && response.members) {
            setTeamMembers(response.members);
          }
        }
      } catch (err) {
        console.error('Error fetching team members:', err);
      }
    };
    
    fetchTeamMembers();
  }, [teamId]);

  const handleBack = () => navigate(`/teams/${teamId}/space`);

  // Enhanced input change handler with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Validate the field immediately
    validateField(name, value);
  };

  // Field validation function
  const validateField = (name, value) => {
    const newErrors = { ...validationErrors };
    const currentYear = new Date().getFullYear();
    
    switch (name) {
      case 'abbreviation':
        if (!value || !value.trim()) {
          newErrors.abbreviation = 'Abbreviation is required';
        } else if (value.length < 2 || value.length > 3) {
          newErrors.abbreviation = 'Abbreviation must be 2-3 characters';
        } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
          newErrors.abbreviation = 'Abbreviation can only contain letters and numbers';
        } else {
          delete newErrors.abbreviation;
        }
        break;
      
      case 'foundedYear':
        if (value && (parseInt(value) > currentYear)) {
          newErrors.foundedYear = `Year cannot be greater than ${currentYear}`;
        } else if (value && parseInt(value) < 1800) {
          newErrors.foundedYear = 'Year cannot be earlier than 1800';
        } else {
          delete newErrors.foundedYear;
        }
        break;
        
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Team name is required';
        } else if (value.length < 2 || value.length > 100) {
          newErrors.name = 'Team name must be between 2 and 100 characters';
        } else {
          delete newErrors.name;
        }
        break;
        
      case 'city':
        if (value && !/^[a-zA-Z0-9\s\-_.&'()áéíóúÁÉÍÓÚñÑçÇâêîôûÂÊÎÔÛäëïöüÄËÏÖÜàèìòùÀÈÌÒÙ]+$/.test(value)) {
          newErrors.city = 'City name can only contain letters, numbers, spaces, accented characters, and basic symbols';
        } else {
          delete newErrors.city;
        }
        break;
        
      case 'nickname':
        if (value && !/^[a-zA-Z0-9\s\-_.&'()]+$/.test(value)) {
          newErrors.nickname = 'Nickname can only contain letters, numbers, spaces, and basic symbols';
        } else {
          delete newErrors.nickname;
        }
        break;
        
      default:
        break;
    }
    
    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate all fields before submission
  const validateForm = () => {
    const fieldsToValidate = ['name', 'abbreviation', 'foundedYear', 'city', 'nickname'];
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
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setLogoFile(file);
    }
  };

  // Trigger file input click
  const handleLogoClick = () => {
    fileInputRef.current.click();
  };

  // Handle logo removal
  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoPreview(null);
    // Set the logoUrl to empty string to indicate logo removal
    setFormData(prev => ({ ...prev, logoUrl: '' }));
  };

  const handleSave = async () => {
    // Validate all fields first
    if (!validateForm()) {
      setStatusMsg({ 
        type: 'error', 
        text: 'Please correct the errors in the form before saving.' 
      });
      return;
    }
    
    try {
      setSaving(true);
      setStatusMsg(null); // Clear previous messages
      
      // First, update the team basic info
      const updateResponse = await teamService.updateTeam(teamId, formData);

      // If there's a new logo, upload it separately
      if (logoFile) {
        try {
          await teamService.updateTeamLogo(teamId, logoFile);
        } catch (logoError) {
          console.error('Logo upload failed but team data was updated:', logoError);
          setStatusMsg({ 
            type: 'warning', 
            text: 'Team information updated but logo upload failed. Please try uploading the logo again.' 
          });
          
          // Still consider this a partial success - refresh team data
          if (outletCtx && outletCtx.refreshTeam) {
            await outletCtx.refreshTeam();
          }
          
          // Navigate back after short delay despite the logo error
          setTimeout(() => {
            navigate(`/teams/${teamId}/space`);
          }, 2000);
          return;
        }
      } 
      // Handle logo removal via the new service method
      else if (formData.logoUrl === '' && !logoPreview) {
        try {
          await teamService.deleteTeamLogo(teamId);
        } catch (logoDeleteError) {
          console.error('Logo removal failed but team data was updated:', logoDeleteError);
          // Non-critical error, can continue
        }
      }
      
      // Refresh team data in parent components
      if (outletCtx && outletCtx.refreshTeam) {
        await outletCtx.refreshTeam();
      }
      
      setStatusMsg({ type: 'success', text: 'Team updated successfully.' });
      
      // Navigate immediately without delay - this fixes the glitchy transition
      navigate(`/teams/${teamId}/space`);
      
    } catch (err) {
      console.error('Save failed:', err);
      
      let errorMessage = 'Failed to save changes.';
      
      if (err.response) {
        // Handle specific error cases from API
        if (err.response.status === 403) {
          errorMessage = 'You do not have permission to update this team.';
        } else if (err.response.status === 404) {
          errorMessage = 'Team not found.';
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message && err.message.includes('timeout')) {
        errorMessage = 'The server took too long to respond. Your changes may still be saved - please check after a few moments.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setStatusMsg({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleLeaveTeamClick = () => {
    setShowLeaveConfirm(true);
  };

  const handleLeaveTeam = async () => {
    try {
      // Fix: Use user.id instead of user.userId 
      // The correct URL should be /teams/${teamId}/members/${user.id}
      await apiClient.delete(`/teams/${teamId}/members/${user.id}`);
      navigate('/teams');
    } catch (err) {
      console.error('Leave team failed:', err);
      
      // Better error handling with specific messages for different cases
      let errorMessage = 'Failed to leave team.';
      
      if (err.response) {
        if (err.response.status === 403 && err.response.data?.code === 'FORBIDDEN_MANAGER_LEAVE') {
          errorMessage = 'You need to transfer manager role before leaving the team.';
        } else if (err.response.status === 404) {
          errorMessage = 'Team member relationship not found.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setStatusMsg({ type: 'error', text: errorMessage });
      setShowLeaveConfirm(false); // Close the dialog on error
    }
  };

  const handleDeleteTeam = async () => {
    try {
      setDeleteLoading(true);
      setStatusMsg({ type: 'info', text: 'Deleting team...' });
      
      await apiClient.delete(`/teams/${teamId}`);
      
      // Show success message before navigating
      setStatusMsg({ type: 'success', text: 'Team deleted successfully!' });
      setTimeout(() => navigate('/teams'), 1000);
    } catch (err) {
      console.error('Delete team failed:', err);
      setDeleteLoading(false);
      
      // More targeted error messages
      let errorMessage = 'Failed to delete team.';
      
      if (err.status === 408 || (err.message && err.message.includes('timeout'))) {
        errorMessage = 'The request timed out. Please try again or contact support.';
      } else if (err.status === 403) {
        errorMessage = 'You don\'t have permission to delete this team.';
      } else if (err.status === 404) {
        errorMessage = 'Team not found. It may have been already deleted.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setStatusMsg({ type: 'error', text: errorMessage });
      setShowDeleteConfirm(false); // Close dialog on error
    }
  };

  // ---------- RENDER ----------
  if (loading) {
    return <div className="loading-message">Loading settings…</div>;
  }

  if (!team) {
    return (
      <div className="settings-page">
        <div className="settings-header">
          <button className="back-button" onClick={handleBack}>&larr; Back</button>
        </div>
        <p className="save-error-message">Team not found.</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button className="back-button" onClick={handleBack}>&larr; Back</button>
        <h2>Team Settings</h2>
      </div>

      {statusMsg && (
        <div className={statusMsg.type === 'success' ? 'save-success-message' : 'save-error-message'}>
          {statusMsg.text}
        </div>
      )}

      {/* TEAM INFO SECTION */}
      <div className="settings-section">
        <h3>Team Information</h3>
        <form className="team-settings-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isManager}
                className={validationErrors.name ? 'input-error' : ''}
              />
              {validationErrors.name && (
                <div className="error-message">{validationErrors.name}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="abbreviation">Abbreviation</label>
              <input
                id="abbreviation"
                name="abbreviation"
                type="text"
                value={formData.abbreviation}
                onChange={handleInputChange}
                disabled={!isManager}
                maxLength={3} // Update maxLength to 3
                style={{textTransform: 'uppercase'}}
                placeholder="e.g. MUN"
                className={validationErrors.abbreviation ? 'input-error' : ''}
              />
              {validationErrors.abbreviation && (
                <div className="error-message">{validationErrors.abbreviation}</div>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nickname">Nickname</label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                value={formData.nickname}
                onChange={handleInputChange}
                disabled={!isManager}
                className={validationErrors.nickname ? 'input-error' : ''}
              />
              {validationErrors.nickname && (
                <div className="error-message">{validationErrors.nickname}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                disabled={!isManager}
                className={validationErrors.city ? 'input-error' : ''}
              />
              {validationErrors.city && (
                <div className="error-message">{validationErrors.city}</div>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="foundedYear">Founded</label>
              <input
                id="foundedYear"
                name="foundedYear"
                type="number"
                value={formData.foundedYear}
                onChange={handleInputChange}
                disabled={!isManager}
                className={validationErrors.foundedYear ? 'input-error' : ''}
                min="1800"
                max={new Date().getFullYear()}
              />
              {validationErrors.foundedYear && (
                <div className="error-message">{validationErrors.foundedYear}</div>
              )}
            </div>
          </div>
          
          {/* Logo Upload (functional) */}
          <div className="logo-section">
            <div className="current-logo">
              {logoPreview ? (
                <img className="team-logo-img" src={logoPreview} alt="team logo" />
              ) : (
                <div className="logo-placeholder">{formData.abbreviation || formData.name.charAt(0)}</div>
              )}
            </div>
            {isManager && (
              <div className="logo-actions">
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                <button 
                  className="upload-logo-button" 
                  type="button" 
                  onClick={handleLogoClick}
                >
                  Upload New Logo
                </button>
                <button 
                  className="remove-logo-button" 
                  type="button" 
                  disabled={!logoPreview}
                  onClick={handleLogoRemove}
                >
                  Remove Logo
                </button>
              </div>
            )}
          </div>
          {isManager && (
            <div className="form-actions">
              <button
                className="save-button"
                type="button"
                onClick={handleSave}
                disabled={saving || Object.keys(validationErrors).length > 0}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* DANGER ZONE SECTION */}
      <div className="settings-section danger-zone-section">
        <h3 className="danger-zone-heading">Danger Zone</h3>
        <p className="danger-zone-text">
          Leaving a team will remove you from its roster. Deleting a team is permanent.
        </p>
        <div className="delete-team-button-wrapper">
          <button className="danger-button" onClick={handleLeaveTeamClick}>
            Leave Team
          </button>
          {isManager && (
            <button className="danger-button" onClick={() => setShowDeleteConfirm(true)} style={{ marginLeft: '16px' }}>
              Delete Team
            </button>
          )}
        </div>
      </div>

      {/* CONFIRM DELETE POPUP */}
      {showDeleteConfirm && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Delete Team</h3>
            <p>
              This will permanently delete the team and all related data. Are you sure you want to proceed?
            </p>
            <div className="confirmation-buttons">
              <button 
                className="cancel-button" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                className="danger-button" 
                onClick={handleDeleteTeam}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM LEAVE POPUP */}
      {showLeaveConfirm && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Leave Team</h3>
            
            {isManager && teamMembers.filter(m => m.role === 'manager' || m.role === 'assistant_manager').length <= 1 ? (
              teamMembers.length > 1 ? (
                // Case 1: Manager with team members but no other managers
                <p>
                  You are the only manager of this team. You need to appoint another team member as manager before you can leave.
                </p>
              ) : (
                // Case 2: Manager is the only member
                <p>
                  You are the only member of this team. If you leave, the team will be permanently deleted.
                </p>
              )
            ) : (
              // Regular member or manager with other managers
              <p>
                Are you sure you want to leave this team? You will lose access to all team resources.
              </p>
            )}
            
            <div className="confirmation-buttons">
              <button className="cancel-button" onClick={() => setShowLeaveConfirm(false)}>Cancel</button>
              
              {isManager && teamMembers.filter(m => m.role === 'manager' || m.role === 'assistant_manager').length <= 1 && teamMembers.length > 1 ? (
                // Disabled for managers without other managers
                <button className="danger-button" disabled>
                  Leave Team
                </button>
              ) : (
                <button className="danger-button" onClick={handleLeaveTeam}>
                  {isManager && teamMembers.length <= 1 ? "Leave & Delete Team" : "Leave Team"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
