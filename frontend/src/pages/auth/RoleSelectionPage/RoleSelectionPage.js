import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleCard from './components/RoleCard';
import RoleDescription from './components/RoleDescription';
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
      description: 'Track your performance, analyze your stats, and improve your game.',
      icon: '🎮'
    },
    {
      id: 'coach',
      title: 'Coach',
      description: 'Manage your team, track player performance, and develop strategies.',
      icon: '👨‍🏫'
    },
    {
      id: 'team',
      title: 'Team Manager',
      description: 'Oversee team operations, schedule matches, and track overall performance.',
      icon: '🏆'
    }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (selectedRole === 'athlete') {
      navigate('/register/athlete');
    } else if (selectedRole === 'coach') {
      navigate('/register/coach');
    } else if (selectedRole === 'team') {
      navigate('/register/team');
    }
  };

  return (
    <div className="role-selection-page">
      <h1>Choose Your Role</h1>
      <p className="subtitle">Select how you'll be using eSkore</p>
      
      <div className="roles-container">
        {roles.map(role => (
          <RoleCard 
            key={role.id}
            role={role}
            isSelected={selectedRole === role.id}
            onSelect={() => handleRoleSelect(role.id)}
          />
        ))}
      </div>
      
      {selectedRole && (
        <>
          <RoleDescription roleId={selectedRole} />
          <button 
            className="continue-button"
            onClick={handleContinue}
          >
            Continue
          </button>
        </>
      )}
    </div>
  );
};

export default RoleSelectionPage;
