import React, { useState } from 'react';
import StatModal from './StatModal';

const ProfileStats = ({ profileData, onProfileUpdate }) => {
  const [showStatModal, setShowStatModal] = useState(false);
  const [editingStat, setEditingStat] = useState(null);

  // Stats are stored in profileData.stats array
  const stats = profileData?.stats || [];

  const handleAddStat = () => {
    setEditingStat(null);
    setShowStatModal(true);
  };

  const handleEditStat = (stat) => {
    setEditingStat(stat);
    setShowStatModal(true);
  };

  const handleDeleteStat = async (statId) => {
    if (window.confirm('Are you sure you want to delete this stat?')) {
      try {
        // Filter out the stat being deleted
        const updatedStats = stats.filter(stat => stat.id !== statId);
        
        // Update profile with the new stats array
        await onProfileUpdate({ stats: updatedStats });
      } catch (error) {
        console.error('Error deleting stat:', error);
      }
    }
  };

  const handleSaveStat = async (statData) => {
    try {
      let updatedStats;
      
      if (editingStat) {
        // Update existing stat
        updatedStats = stats.map(stat => 
          stat.id === editingStat.id ? { ...stat, ...statData } : stat
        );
      } else {
        // Add new stat with a temporary ID (backend will assign real ID)
        const newStat = {
          id: `temp-${Date.now()}`,
          ...statData,
          date: new Date().toISOString()
        };
        updatedStats = [...stats, newStat];
      }
      
      await onProfileUpdate({ stats: updatedStats });
      setShowStatModal(false);
      return true;
    } catch (error) {
      console.error('Error saving stat:', error);
      return false;
    }
  };

  return (
    <div className="profile-stats">
      <div className="profile-section-header">
        <h3 className="profile-section-title">Performance Statistics</h3>
        <button className="add-button" onClick={handleAddStat}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Add Stat
        </button>
      </div>
      
      {stats.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h4 className="empty-state-title">No Statistics Yet</h4>
          <p className="empty-state-desc">
            Track your soccer performance by adding key statistics like goals, assists, save percentage, and more.
          </p>
          <button className="add-button" onClick={handleAddStat}>
            Add Your First Stat
          </button>
        </div>
      ) : (
        <div className="profile-cards">
          {stats.map(stat => (
            <div key={stat.id} className="profile-card">
              <div className="profile-card-header">
                <h4 className="profile-card-title">{stat.name}</h4>
                <div className="profile-card-actions">
                  <button 
                    className="card-action-btn" 
                    onClick={() => handleEditStat(stat)}
                    aria-label="Edit stat"
                  >
                    <i className="fas fa-pencil-alt"></i>
                  </button>
                  <button 
                    className="card-action-btn delete" 
                    onClick={() => handleDeleteStat(stat.id)}
                    aria-label="Delete stat"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              <div className="profile-card-value">
                {stat.value}
                {stat.unit ? ` ${stat.unit}` : ''}
              </div>
              <div className="profile-card-content">
                {stat.description}
              </div>
              {stat.date && (
                <div className="profile-card-date">
                  {new Date(stat.date).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {showStatModal && (
        <StatModal
          stat={editingStat}
          onClose={() => setShowStatModal(false)}
          onSave={handleSaveStat}
        />
      )}
    </div>
  );
};

export default ProfileStats;
