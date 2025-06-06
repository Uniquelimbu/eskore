import React, { useState } from 'react';
import '../styles/AddMemberForm.css';

const AddMemberForm = ({ onSubmit, onCancel, isManager }) => {
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('athlete');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email: newMemberEmail, role: newMemberRole });
  };

  return (
    <div className="add-member-form">
      <h3>Add New Team Member</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="memberEmail">Email:</label>
          <input
            type="email"
            id="memberEmail"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="memberRole">Role:</label>
          <select
            id="memberRole"
            value={newMemberRole}
            onChange={(e) => setNewMemberRole(e.target.value)}
          >
            <option value="">Select Role</option>
            <option value="athlete">Player</option>
            <option value="assistant_manager">Assistant Manager</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">Add Member</button>
        </div>
      </form>
    </div>
  );
};

export default AddMemberForm;
