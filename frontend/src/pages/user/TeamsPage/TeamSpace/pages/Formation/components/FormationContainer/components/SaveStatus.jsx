import React from 'react';

const SaveStatus = ({ 
  loading, 
  saved, 
  saveError, 
  pendingChanges, 
  onRetry, 
  onManualSave, 
  isManager 
}) => {
  const getSaveStatus = () => {
    if (loading) return { text: 'Saving...', icon: '⟲', className: 'saving' };
    if (saveError) return { text: 'Save Failed', icon: '✗', className: 'error' };
    if (!saved && pendingChanges) return { text: 'Unsaved Changes', icon: '⚠️', className: 'unsaved' };
    return { text: 'Saved', icon: '✓', className: 'saved' };
  };

  const status = getSaveStatus();

  return (
    <div className={`save-status-bar ${status.className}`}>
      <span className="save-status-icon">{status.icon}</span>
      <span className="save-status-text">{status.text}</span>
      
      {saveError && (
        <button 
          className="retry-button"
          onClick={onRetry}
          title="Retry save"
        >
          Retry
        </button>
      )}
      
      {isManager && (
        <button 
          className="manual-save-button"
          onClick={onManualSave}
          disabled={loading}
          title="Force save"
        >
          {loading ? 'Saving...' : 'Save Now'}
        </button>
      )}
    </div>
  );
};

export default SaveStatus;