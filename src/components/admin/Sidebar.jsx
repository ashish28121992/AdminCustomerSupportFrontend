import React from 'react';
import { clearToken, getToken } from '../../utils/auth';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { postJson } from '../../utils/api';

function Sidebar({ section, setSection, onCreateSubAdmin, onAddBranch, onLogout }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleConfirmLogout() {
    try {
      setIsLoggingOut(true);
      const token = getToken();
      if (token) {
        await postJson('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
      }
      // fallthrough to clear local state regardless of API result
      clearToken();
      setConfirmOpen(false);
      toast.success('Logged out', { icon: '🚪', style: { background: 'linear-gradient(135deg, #22d3ee, #a78bfa)', color: '#0b1220', border: '1px solid rgba(99,102,241,0.55)', boxShadow: '0 10px 30px rgba(0,0,0,0.35)' } });
      onLogout();
    } catch (e) {
      // Even if API fails, clear token locally
      clearToken();
      setConfirmOpen(false);
      toast.error('Logout failed on server, cleared locally');
      onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  }
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={process.env.PUBLIC_URL + '/logo.png'} alt="Admin" className="sidebar-logo" />
        <span>Admin Panel</span>
      </div>
      <nav className="sidebar-nav">
        <button className={`nav-item ${section === 'users' ? 'active' : ''}`} onClick={() => setSection('users')}>
          <span className="dot nav" /> Users
        </button>
        <button className={`nav-item ${section === 'subs' ? 'active' : ''}`} onClick={() => setSection('subs')}>
          <span className="dot nav" /> Sub-Admins
        </button>
        <button className={`nav-item ${section === 'branches' ? 'active' : ''}`} onClick={() => setSection('branches')}>
          <span className="dot nav" /> Branches
        </button>
        <button className="primary create-sub" onClick={onCreateSubAdmin}>Create Sub-Admin</button>
        <button className="primary create-branch" onClick={onAddBranch}>Add Branch</button>
        <button className="logout-btn" onClick={() => setConfirmOpen(true)}>Logout</button>
      </nav>
      {confirmOpen ? (
        <div className="modal-backdrop" onClick={() => setConfirmOpen(false)}>
          <div className="modal confirm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Logout</h3>
              <button className="ghost" onClick={() => setConfirmOpen(false)}>Close</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to logout?</p>
              <div className="modal-actions">
                <button className="ghost colorful-cancel" onClick={() => setConfirmOpen(false)} disabled={isLoggingOut}>Cancel</button>
                <button className="primary colorful-logout" onClick={handleConfirmLogout} disabled={isLoggingOut}>{isLoggingOut ? 'Logging out…' : 'Logout'}</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

export default Sidebar;


