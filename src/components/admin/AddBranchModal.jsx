import React from 'react';

function AddBranchModal({ open, onClose, onCreate, values, onChange, error }) {
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
            <span>Branch Name</span>
            <input type="text" placeholder="e.g., Mumbai Branch" value={values.name} onChange={(e) => onChange('name', e.target.value)} />
          </label>
          <label>
            <span>Location</span>
            <input type="text" placeholder="e.g., Andheri, Mumbai" value={values.location} onChange={(e) => onChange('location', e.target.value)} />
          </label>
          <label>
            <span>Contact Person</span>
            <input type="text" placeholder="Branch Manager Name" value={values.contactPerson} onChange={(e) => onChange('contactPerson', e.target.value)} />
          </label>
          <label>
            <span>Phone</span>
            <input type="tel" placeholder="+91 xxxxxxxxxx" value={values.phone} onChange={(e) => onChange('phone', e.target.value)} />
          </label>
          <label>
            <span>WhatsApp Link</span>
            <input type="url" placeholder="https://wa.me/91xxxxxxxxxx" value={values.waLink || ''} onChange={(e) => onChange('waLink', e.target.value)} />
          </label>
          <label>
            <span>Email</span>
            <input type="email" placeholder="branch@company.com" value={values.email} onChange={(e) => onChange('email', e.target.value)} />
          </label>
          <label>
            <span>Address</span>
            <textarea placeholder="Full branch address" value={values.address} onChange={(e) => onChange('address', e.target.value)} rows="3" />
          </label>
          {error ? <div className="error-text" style={{ marginTop: 6 }}>{error}</div> : null}
          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary">Add Branch</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBranchModal;
