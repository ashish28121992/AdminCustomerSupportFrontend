import React, { useState, useEffect } from 'react';
import { postJson } from '../../utils/api';
import { getToken } from '../../utils/auth';
import toast from 'react-hot-toast';
import './ChangePasswordModal.css';

function ChangePasswordModal({ open, onClose, subAdmin }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!newPassword) {
      setError('New password is required');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getToken();
      
      // Call backend API to reset password
      const res = await postJson(
        `/admins/${subAdmin.id}/reset-password`,
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res?.success) {
        toast.success('Password reset successfully! 🔐', {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            fontWeight: '600',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
          }
        });
        
        setTimeout(() => {
          handleClose();
        }, 1000);
      } else {
        const msg = res?.message || 'Failed to reset password';
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      const msg = err?.message || 'Network error. Please try again.';
      setError(msg);
      toast.error(msg, {
        duration: 3000,
        style: {
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white',
          fontWeight: '600'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  if (!open || !subAdmin) return null;

  return (
    <div className="change-password-backdrop" onClick={handleClose}>
      <div className="change-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="change-password-header">
          <h2>🔐 Change Password</h2>
          <button className="close-btn" onClick={handleClose} type="button">
            ✕
          </button>
        </div>

        <form className="change-password-form" onSubmit={handleSubmit}>
          {/* Sub-Admin Details */}
          <div className="subadmin-details">
            <h3>Sub-Admin Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Branch Name:</span>
                <span className="detail-value">{subAdmin.branchName || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{subAdmin.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">User ID:</span>
                <span className="detail-value">{subAdmin.userId || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className={`status-badge ${subAdmin.isActive ? 'active' : 'inactive'}`}>
                  {subAdmin.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Password Fields */}
          <div className="password-section">
            <div className="form-field">
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="form-field">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {error && (
            <div className="change-password-error">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="change-password-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Changing...
                </>
              ) : (
                '🔑 Change Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;

