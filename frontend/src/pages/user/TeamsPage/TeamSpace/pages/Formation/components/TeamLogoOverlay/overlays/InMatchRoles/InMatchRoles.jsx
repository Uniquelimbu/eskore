import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../../../../../../../../services';
import { collapseSidebar, expandSidebar } from '../../../../../../../../../../utils/sidebarUtils';
import './styles/index.css';

const InMatchRoles = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [roles, setRoles] = useState({
    captain: null,
    longFKTaker: null,
    shortFKTaker: null,
    leftCKTaker: null,
    rightCKTaker: null,
    pkTaker: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Ensure sidebar is collapsed when InMatchRoles page loads
  useEffect(() => {
    console.log('InMatchRoles: Attempting to collapse sidebar');
    
    const timer = setTimeout(() => {
      collapseSidebar();
    }, 50);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (teamId) {
      fetchPlayersAndRoles();
    }
  }, [teamId]);

  const fetchPlayersAndRoles = async () => {
    try {
      setLoading(true);
      // Fetch players and existing roles
      const [playersResponse, rolesResponse] = await Promise.all([
        apiClient.get(`/teams/${teamId}/players`),
        apiClient.get(`/teams/${teamId}/match-roles`).catch(() => ({ roles: {} }))
      ]);
      
      setPlayers(playersResponse?.players || []);
      setRoles(rolesResponse?.roles || {
        captain: null,
        longFKTaker: null,
        shortFKTaker: null,
        leftCKTaker: null,
        rightCKTaker: null,
        pkTaker: null
      });
    } catch (error) {
      console.error('Error fetching players and roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (roleType, playerId) => {
    setRoles(prev => ({
      ...prev,
      [roleType]: playerId === prev[roleType] ? null : playerId
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.put(`/teams/${teamId}/match-roles`, { roles });
      // Navigate back to formation page after successful save
      handleBackClick();
    } catch (error) {
      console.error('Error saving roles:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBackClick = () => {
    console.log('InMatchRoles: Expanding sidebar and navigating back to formation');
    expandSidebar();
    navigate(`/teams/${teamId}/space/formation`);
  };

  const getPlayerName = (playerId) => {
    if (!playerId) return null;
    const player = players.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : 'Unknown Player';
  };

  const roleDefinitions = [
    { 
      key: 'captain', 
      label: 'Captain'
    },
    { 
      key: 'longFKTaker', 
      label: 'Long FK Taker'
    },
    { 
      key: 'shortFKTaker', 
      label: 'Short FK Taker'
    },
    { 
      key: 'leftCKTaker', 
      label: 'Left CK Taker'
    },
    { 
      key: 'rightCKTaker', 
      label: 'Right CK Taker'
    },
    { 
      key: 'pkTaker', 
      label: 'PK Taker'
    }
  ];

  if (loading) {
    return (
      <div className="inmatch-page">
        <div className="inmatch-header">
          <button className="inmatch-back-button" onClick={handleBackClick}>
            ← Back
          </button>
          <h1 className="inmatch-page-title">In-Match Roles</h1>
        </div>
        <div className="inmatch-loading-state">
          <div className="inmatch-loading-spinner"></div>
          <p>Loading players and roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inmatch-page">
      <div className="inmatch-header">
        <button className="inmatch-back-button" onClick={handleBackClick}>
          ← Back
        </button>
        <h1 className="inmatch-page-title">In-Match Roles</h1>
      </div>

      <div className="inmatch-content">
        <div className="inmatch-roles-container">
          <div className="inmatch-roles-list">
            {roleDefinitions.map(role => (
              <div key={role.key} className="inmatch-role-row">
                <div className="inmatch-role-label">
                  {role.label}
                </div>
                <div className="inmatch-role-selection">
                  <select 
                    value={roles[role.key] || ''} 
                    onChange={(e) => handleRoleChange(role.key, e.target.value || null)}
                    className="inmatch-player-select"
                  >
                    <option value="">Select Player</option>
                    {players.map(player => (
                      <option key={player.id} value={player.id}>
                        {player.firstName} {player.lastName}
                        {player.jerseyNumber && ` (#${player.jerseyNumber})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="inmatch-actions">
            <button 
              className="inmatch-save-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InMatchRoles;
