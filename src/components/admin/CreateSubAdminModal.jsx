import React from 'react';

function CreateSubAdminModal({ open, onClose, onCreate, values, onChange, error, submitting }) {
  const [showPassword, setShowPassword] = React.useState(false);
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
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Strong password" 
                value={values.password} 
                onChange={(e) => onChange('password', e.target.value)} 
                style={{ paddingRight: 36 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9aa3b2'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </label>
          <label>
            <span>Sub-Admin ID</span>
            <input type="text" placeholder="SUB-1001" value={values.userId} onChange={(e) => onChange('userId', e.target.value)} />
          </label>
          <label>
            <span>WhatsApp Link</span>
            <input type="url" placeholder="https://wa.link/your-subadmin" value={values.waLink || ''} onChange={(e) => onChange('waLink', e.target.value)} />
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


