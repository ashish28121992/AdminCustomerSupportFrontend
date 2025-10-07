import React from 'react';

function CreateSubAdminModal({ open, onClose, onCreate, values, onChange, error }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Sub-Admin</h3>
          <button className="ghost" onClick={onClose}>Close</button>
        </div>
        <form className="modal-body" onSubmit={onCreate}>
          <label>
            <span>Name</span>
            <input type="text" placeholder="Full name" value={values.name} onChange={(e) => onChange('name', e.target.value)} />
          </label>
          <label>
            <span>Email</span>
            <input type="email" placeholder="email@example.com" value={values.email} onChange={(e) => onChange('email', e.target.value)} />
          </label>
          <label>
            <span>WA Link (optional)</span>
            <input type="url" placeholder="https://wa.me/91xxxxxxxxxx" value={values.waLink || ''} onChange={(e) => onChange('waLink', e.target.value)} />
          </label>
          <label>
            <span>Created By</span>
            <input type="text" value={values.createdBy} onChange={(e) => onChange('createdBy', e.target.value)} />
          </label>
          {error ? <div className="error-text" style={{ marginTop: 6 }}>{error}</div> : null}
          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateSubAdminModal;


