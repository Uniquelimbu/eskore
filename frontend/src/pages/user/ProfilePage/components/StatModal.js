import React, { useState } from 'react';
import { statCategories, getRecommendedUnit } from '../../../../utils/soccerUtils';

const StatModal = ({ stat, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: stat?.name || '',
    value: stat?.value || '',
    unit: stat?.unit || '',
    description: stat?.description || '',
    category: stat?.category || 'performance' // default category
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If name field is changed, suggest a unit
    if (name === 'name' && !formData.unit) {
      const suggestedUnit = getRecommendedUnit(value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        unit: suggestedUnit
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.value) {
      setError('Name and value are required fields');
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
      console.error('Error saving stat:', err);
    } finally {
      setLoading(false);
    }
  };

  // Soccer-specific stat suggestions
  const statSuggestions = [
    { name: 'Goals', unit: '', category: 'offense' },
    { name: 'Assists', unit: '', category: 'offense' },
    { name: 'Shots on Target', unit: '%', category: 'offense' },
    { name: 'Pass Accuracy', unit: '%', category: 'technical' },
    { name: 'Tackles', unit: '', category: 'defense' },
    { name: 'Interceptions', unit: '', category: 'defense' },
    { name: 'Clean Sheets', unit: '', category: 'goalkeeper' },
    { name: 'Save Percentage', unit: '%', category: 'goalkeeper' },
    { name: 'Distance Covered', unit: 'km', category: 'fitness' },
    { name: 'Sprint Speed', unit: 'km/h', category: 'fitness' },
    { name: 'Dribble Success', unit: '%', category: 'technical' },
    { name: 'Aerial Duels Won', unit: '%', category: 'physical' }
  ];

  const handleSelectSuggestion = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      name: suggestion.name,
      unit: suggestion.unit,
      category: suggestion.category
    }));
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h3 className="profile-modal-title">{stat ? 'Edit Stat' : 'Add New Stat'}</h3>
          <button className="profile-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="profile-modal-body">
            {error && <div className="error-banner">{error}</div>}
            
            {!stat && (
              <div className="stat-suggestions">
                <p className="suggestion-label">Common Soccer Stats:</p>
                <div className="suggestion-chips">
                  {statSuggestions.map((suggestion, index) => (
                    <button
                      type="button"
                      key={index}
                      className="suggestion-chip"
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      {suggestion.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="profile-form-group">
              <label htmlFor="name">Stat Name*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Goals, Save Percentage, Assists"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="profile-form-group">
                <label htmlFor="value">Value*</label>
                <input
                  type="text"
                  id="value"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  placeholder="e.g. 12, 85.5"
                  required
                />
              </div>
              
              <div className="profile-form-group">
                <label htmlFor="unit">Unit</label>
                <input
                  type="text"
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="e.g. %, km/h"
                />
              </div>
            </div>
            
            <div className="profile-form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {Object.entries(statCategories).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            
            <div className="profile-form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add context to this stat..."
                rows="3"
              ></textarea>
            </div>
          </div>
          
          <div className="profile-modal-footer">
            <button type="button" className="modal-cancel-btn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="modal-save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Stat'}
            </button>
          </div>
        </form>
      </div>
      
      <style jsx>{`
        .profile-modal {
          width: 90% !important;
          max-width: 700px !important;
          margin: 0 auto;
        }
        
        @media (min-width: 768px) {
          .profile-modal {
            width: 80% !important;
          }
        }
        
        .stat-suggestions {
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

export default StatModal;
