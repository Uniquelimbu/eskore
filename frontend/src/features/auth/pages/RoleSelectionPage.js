import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './RoleSelectionPage.css';
import { eskore_logo } from '../../../assets';

function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();
  
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    // Route to specific registration pages based on role
    setTimeout(() => {
      if (role === 'athlete') {
        navigate('/role-selection/athlete');
      } else if (role === 'manager') {
        navigate('/role-selection/manager');
      } else if (role === 'team') {
        navigate('/role-selection/team');
      }
    }, 300);
  };

  return (
    <div className="role-selection-page">
      <Helmet>
        <title>Join eSkore - Select Your Role</title>
        <meta name="description" content="Select your role to join eSkore - the digital platform for grassroots football." />
      </Helmet>
      
      <div className="role-selection-container">
        <div className="role-selection-content">
          <div className="logo-container">
            {/* Replace placeholder with actual logo */}
            <img 
              src={eskore_logo} 
              alt="eSkore Logo" 
              className="role-selection-logo"
              onError={(e) => {
                e.target.onerror = null;
                // Fallback if image fails to load
                e.target.src = '/assets/images/logo/eskore-logo.png';
              }}
            />
            <h1 className="role-selection-title">eSkore</h1>
          </div>
          
          <h2>Select Your Role</h2>
          <p>Choose how you want to participate in the eSkore community</p>

          <div className="role-options">
            <button 
              className={`role-option ${selectedRole === 'athlete' ? 'selected' : ''}`}
              onClick={() => handleRoleSelect('athlete')}
            >
              <div className="role-icon">🧍</div>
              <div className="role-info">
                <h3>Athlete</h3>
                <p>Build your profile and get discovered</p>
              </div>
            </button>

            <button 
              className={`role-option ${selectedRole === 'manager' ? 'selected' : ''}`}
              onClick={() => handleRoleSelect('manager')}
            >
              <div className="role-icon">🧑‍💼</div>
              <div className="role-info">
                <h3>Manager/Coach</h3>
                <p>Manage teams and discover talent</p>
              </div>
            </button>

            <button 
              className={`role-option ${selectedRole === 'team' ? 'selected' : ''}`}
              onClick={() => handleRoleSelect('team')}
            >
              <div className="role-icon">🏆</div>
              <div className="role-info">
                <h3>Team</h3>
                <p>Create your team profile and build community</p>
              </div>
            </button>
          </div>

          <div className="back-option">
            <Link to="/" className="back-link" style={{color: '#2d3748', fontWeight: 700}}>
              <span className="back-arrow">←</span> Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleSelectionPage;
