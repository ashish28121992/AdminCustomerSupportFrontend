import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, clearToken } from '../utils/auth';
import { postJson } from '../utils/api';
import toast from 'react-hot-toast';
import './Admin.css';

function SubAdmin() {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleConfirmLogout() {
    try {
      setIsLoggingOut(true);
      const token = getToken();
      if (token) {
        await postJson('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
      }
      clearToken();
      setConfirmOpen(false);
      toast.success('Logged out', { icon: '🚪', style: { background: 'linear-gradient(135deg, #22d3ee, #a78bfa)', color: '#0b1220', border: '1px solid rgba(99,102,241,0.55)', boxShadow: '0 10px 30px rgba(0,0,0,0.35)' } });
      navigate('/', { replace: true });
    } catch (e) {
      clearToken();
      setConfirmOpen(false);
      toast.error('Logout failed on server, cleared locally');
      navigate('/', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-gradient" />
      <header className="admin-header">
        <div className="brand">
          <img
            src={process.env.PUBLIC_URL + '/logo.png'}
            alt="Sub Admin"
            className="brand-logo"
          />
          <h1>SubAdmin View</h1>
        </div>
        <div className="header-actions">
          <button className="logout-btn" onClick={() => setConfirmOpen(true)}>Logout</button>
        </div>
      </header>
      <main className="admin-content">
        {/* Placeholder content area for future sub-admin features */}
      </main>

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
    </div>
  );
}

export default SubAdmin;


