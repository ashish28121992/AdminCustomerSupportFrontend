import React from 'react';

function AddUserModal({ open, onClose, onCreate, values, onChange, error, submitting }) {
  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal add-user-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="gradient-text">Add New User</h3>
          <button className="ghost" onClick={onClose}>Close</button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <label>
            <span>Name</span>
            <input 
              type="text" 
              placeholder="e.g., John Doe" 
              value={values.name} 
              onChange={(e) => onChange('name', e.target.value)}
              required
            />
          </label>

          <label>
            <span>Email</span>
            <input 
              type="email" 
              placeholder="user@example.com" 
              value={values.email} 
              onChange={(e) => onChange('email', e.target.value)}
              required
            />
          </label>

          <label>
            <span>Phone Number</span>
            <input 
              type="tel" 
              placeholder="+1 234 567 8900" 
              value={values.phone} 
              onChange={(e) => onChange('phone', e.target.value)}
              required
            />
          </label>

          <label>
            <span>User ID</span>
            <input 
              type="text" 
              placeholder="e.g., USER-1001" 
              value={values.userId} 
              onChange={(e) => onChange('userId', e.target.value)}
              required
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUserModal;
