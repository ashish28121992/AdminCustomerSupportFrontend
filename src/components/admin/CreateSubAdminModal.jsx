import React from 'react';

function CreateSubAdminModal({ open, onClose, onCreate, values, onChange, error, submitting }) {
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
            <span>Email</span>
            <input type="email" placeholder="email@example.com" value={values.email} onChange={(e) => onChange('email', e.target.value)} />
          </label>
          <label>
            <span>Password</span>
            <input type="password" placeholder="Strong password" value={values.password} onChange={(e) => onChange('password', e.target.value)} />
          </label>
          <label>
            <span>User ID</span>
            <input type="text" placeholder="SUB-1001" value={values.userId} onChange={(e) => onChange('userId', e.target.value)} />
          </label>
          <label>
            <span>Branch ID</span>
            <input type="text" placeholder="ROOT-BRANCH" value={values.branchId} onChange={(e) => onChange('branchId', e.target.value)} />
          </label>
        
          {error ? <div className="error-text" style={{ marginTop: 6 }}>{error}</div> : null}
          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="primary" disabled={submitting}>{submitting ? 'Creating…' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateSubAdminModal;


