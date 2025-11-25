import React from 'react';

function UpdateSubAdminModal({ open, onClose, onUpdate, subAdmin, error, submitting }) {
  const [waLink, setWaLink] = React.useState('');

  React.useEffect(() => {
    if (subAdmin) {
      setWaLink(subAdmin.branchWaLink || '');
    }
  }, [subAdmin]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(waLink);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Update Sub-Admin</h3>
          <button className="ghost" onClick={onClose}>Close</button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <label>
            <span>WhatsApp Link</span>
            <input 
              type="url" 
              placeholder="https://wa.me/919999999999?text=Hello%20Client" 
              value={waLink} 
              onChange={(e) => setWaLink(e.target.value)} 
            />
          </label>
          {error ? <div className="error-text" style={{ marginTop: 6 }}>{error}</div> : null}
          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="primary" disabled={submitting}>{submitting ? 'Updating…' : 'Update'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateSubAdminModal;

