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
              placeholder="+91 1234567890" 
              value={values.phone} 
              onChange={(e) => {
                let phoneValue = e.target.value;
                // If user starts typing without +91, add it automatically
                if (phoneValue && !phoneValue.startsWith('+91')) {
                  // Remove any existing +91 if user pasted something with it
                  phoneValue = phoneValue.replace(/^\+91\s*/, '');
                  phoneValue = '+91' + phoneValue;
                }
                onChange('phone', phoneValue);
              }}
              onFocus={(e) => {
                // If field is empty or doesn't start with +91, set default to +91
                if (!e.target.value || !e.target.value.startsWith('+91')) {
                  const currentValue = e.target.value.replace(/^\+91\s*/, '');
                  onChange('phone', '+91' + currentValue);
                }
              }}
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
