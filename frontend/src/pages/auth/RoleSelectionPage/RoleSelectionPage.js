import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './RoleSelectionPage.css';

const RoleSelectionPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const roles = [
    {
      id: 'athlete',
      title: 'Athlete',
      description: 'Build your profile and get discovered',
      icon: '🏃'
    },
    {
      id: 'coach',
      title: 'Manager/Coach',
      description: 'Manage teams and discover talent',
      icon: '👨‍💼'
    },
    {
      id: 'team',
      title: 'Team',
      description: 'Create your team profile and build community',
      icon: '🏆'
    }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    
    // Navigate directly when clicking a role card
    if (roleId === 'athlete') {
      navigate('/register/athlete');
    } else if (roleId === 'coach') {
      navigate('/register/coach');
    } else if (roleId === 'team') {
      navigate('/register/team');
    }
  };

  return (
    <div className="role-selection-page">
      <div className="role-page-logo-container">
        <div className="role-page-logo">e</div>
        <span className="role-page-logo-text">eSkore</span>
      </div>
      
      <h1>Select Your Role</h1>
      <p className="subtitle">Choose how you want to participate in the eSkore community</p>
      
      <div className="roles-container">
        {roles.map(role => (
          <div
            key={role.id}
            className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
            onClick={() => handleRoleSelect(role.id)}
          >
            <div className={`role-icon ${role.id}`}>
              {role.icon}
            </div>
            <div className="role-content">
              <h3>{role.title}</h3>
              <p>{role.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <Link to="/" className="back-link">
        ← Back to home
      </Link>
    </div>
  );
};

export default RoleSelectionPage;
