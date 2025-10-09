import React from 'react';

function EditClientModal({ open, onClose, onUpdate, values, onChange, error, submitting }) {
  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal edit-client-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="gradient-text">Edit Client</h3>
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
            <span>Phone Number</span>
            <input 
              type="tel" 
              placeholder="+1 234 567 8900" 
              value={values.phone} 
              onChange={(e) => onChange('phone', e.target.value)}
              required
            />
          </label>

          <label className="checkbox-field">
            <input 
              type="checkbox" 
              checked={values.isActive} 
              onChange={(e) => onChange('isActive', e.target.checked)}
            />
            <span>Is Active</span>
          </label>

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditClientModal;
