import React, { useState } from 'react';
import { achievementCategories } from '../../../../utils/soccerUtils';
import { formatDateForInput } from '../../../../utils/dateUtils';

const AchievementModal = ({ achievement, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: achievement?.title || '',
    description: achievement?.description || '',
    date: achievement?.date ? formatDateForInput(achievement.date) : '',
    category: achievement?.category || 'award' // default category
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title) {
      setError('Title is required');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } catch (err) {
      setError('An error occurred while saving. Please try again.');
      console.error('Error saving achievement:', err);
    } finally {
      setLoading(false);
    }
  };

  // Soccer-specific achievement suggestions
  const achievementSuggestions = [
    { title: 'Tournament Champion', category: 'team' },
    { title: 'League Champion', category: 'team' },
    { title: 'Cup Winner', category: 'team' },
    { title: 'Golden Boot', category: 'individual' },
    { title: 'Most Valuable Player', category: 'individual' },
    { title: 'Best Goalkeeper', category: 'individual' },
    { title: 'Team Captain', category: 'leadership' },
    { title: 'National Team Selection', category: 'recognition' },
    { title: 'Youth Academy Graduate', category: 'development' },
    { title: 'Player of the Match', category: 'performance' },
    { title: 'Clean Sheet Record', category: 'performance' },
    { title: 'Hat-trick', category: 'performance' }
  ];

  const handleSelectSuggestion = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      title: suggestion.title,
      category: suggestion.category
    }));
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h3 className="profile-modal-title">{achievement ? 'Edit Achievement' : 'Add New Achievement'}</h3>
          <button className="profile-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="profile-modal-body">
            {error && <div className="error-banner">{error}</div>}
            
            {!achievement && (
              <div className="achievement-suggestions">
                <p className="suggestion-label">Common Soccer Achievements:</p>
                <div className="suggestion-chips">
                  {achievementSuggestions.map((suggestion, index) => (
                    <button
                      type="button"
                      key={index}
                      className="suggestion-chip"
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      {suggestion.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="profile-form-group">
              <label htmlFor="title">Achievement Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Golden Boot, Tournament Champion"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="profile-form-group">
                <label htmlFor="date">Date Achieved</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="profile-form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {Object.entries(achievementCategories).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="profile-form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the achievement or milestone..."
                rows="4"
              ></textarea>
            </div>
          </div>
          
          <div className="profile-modal-footer">
            <button type="button" className="modal-cancel-btn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="modal-save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Achievement'}
            </button>
          </div>
        </form>
      </div>
      
      <style jsx>{`
        .achievement-suggestions {
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #2d3748;
        }
        
        .suggestion-label {
          color: #a0aec0;
          font-size: 0.9rem;
          margin-bottom: 8px;
        }
        
        .suggestion-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .suggestion-chip {
          background-color: #283046;
          border: 1px solid #4a6cf7;
          color: #e2e8f0;
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .suggestion-chip:hover {
          background-color: #4a6cf7;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default AchievementModal;
