import React, { useState } from 'react';
import AchievementModal from './AchievementModal';

const ProfileAchievements = ({ profileData, onProfileUpdate }) => {
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);

  // Achievements are stored in profileData.achievements array
  const achievements = profileData?.achievements || [];

  const handleAddAchievement = () => {
    setEditingAchievement(null);
    setShowAchievementModal(true);
  };

  const handleEditAchievement = (achievement) => {
    setEditingAchievement(achievement);
    setShowAchievementModal(true);
  };

  const handleDeleteAchievement = async (achievementId) => {
    if (window.confirm('Are you sure you want to delete this achievement?')) {
      try {
        // Filter out the achievement being deleted
        const updatedAchievements = achievements.filter(achievement => achievement.id !== achievementId);
        
        // Update profile with the new achievements array
        await onProfileUpdate({ achievements: updatedAchievements });
      } catch (error) {
        console.error('Error deleting achievement:', error);
      }
    }
  };

  const handleSaveAchievement = async (achievementData) => {
    try {
      let updatedAchievements;
      
      if (editingAchievement) {
        // Update existing achievement
        updatedAchievements = achievements.map(achievement => 
          achievement.id === editingAchievement.id ? { ...achievement, ...achievementData } : achievement
        );
      } else {
        // Add new achievement with a temporary ID (backend will assign real ID)
        const newAchievement = {
          id: `temp-${Date.now()}`,
          ...achievementData,
          date: achievementData.date || new Date().toISOString()
        };
        updatedAchievements = [...achievements, newAchievement];
      }
      
      await onProfileUpdate({ achievements: updatedAchievements });
      setShowAchievementModal(false);
      return true;
    } catch (error) {
      console.error('Error saving achievement:', error);
      return false;
    }
  };

  return (
    <div className="profile-achievements">
      <div className="profile-section-header">
        <h3 className="profile-section-title">Achievements & Awards</h3>
        <button className="add-button" onClick={handleAddAchievement}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Add Achievement
        </button>
      </div>
      
      {achievements.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <h4 className="empty-state-title">No Achievements Yet</h4>
          <p className="empty-state-desc">
            Showcase your soccer achievements, awards, and milestones to highlight your career progress.
          </p>
          <button className="add-button" onClick={handleAddAchievement}>
            Add Your First Achievement
          </button>
        </div>
      ) : (
        <div className="profile-cards">
          {achievements.map(achievement => (
            <div key={achievement.id} className="profile-card">
              <div className="profile-card-header">
                <h4 className="profile-card-title">{achievement.title}</h4>
                <div className="profile-card-actions">
                  <button 
                    className="card-action-btn" 
                    onClick={() => handleEditAchievement(achievement)}
                    aria-label="Edit achievement"
                  >
                    <i className="fas fa-pencil-alt"></i>
                  </button>
                  <button 
                    className="card-action-btn delete" 
                    onClick={() => handleDeleteAchievement(achievement.id)}
                    aria-label="Delete achievement"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              <div className="profile-card-content">
                {achievement.description}
              </div>
              {achievement.date && (
                <div className="profile-card-date">
                  {new Date(achievement.date).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {showAchievementModal && (
        <AchievementModal
          achievement={editingAchievement}
          onClose={() => setShowAchievementModal(false)}
          onSave={handleSaveAchievement}
        />
      )}
    </div>
  );
};

export default ProfileAchievements;
