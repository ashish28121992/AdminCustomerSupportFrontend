import React from 'react';

function AddBranchModal({ open, onClose, onCreate, values, onChange, error, submitting }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Branch</h3>
          <button className="ghost" onClick={onClose}>Close</button>
        </div>
        <form className="modal-body" onSubmit={onCreate}>
          <label>
            <span>Branch ID</span>
            <input type="text" placeholder="dummy06" value={values.branchId} onChange={(e) => onChange('branchId', e.target.value)} />
          </label>
          <label>
            <span>Branch Name</span>
            <input type="text" placeholder="copper" value={values.branchName} onChange={(e) => onChange('branchName', e.target.value)} />
          </label>
          <label>
            <span>WhatsApp Link</span>
            <input type="url" placeholder="https://wa.link/yourbranch" value={values.waLink || ''} onChange={(e) => onChange('waLink', e.target.value)} />
          </label>
          {error ? <div className="error-text" style={{ marginTop: 6 }}>{error}</div> : null}
          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="primary" disabled={submitting}>{submitting ? 'Adding…' : 'Add Branch'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBranchModal;
