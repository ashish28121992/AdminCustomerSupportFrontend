import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { postJson } from '../../utils/api';
import { getToken } from '../../utils/auth';
import './ChangePasswordModal.css';

function ChangePasswordModal({ open, onClose, onSuccess, forced = false }) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showField, setShowField] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetState = () => {
    setForm({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setShowField({
      currentPassword: false,
      newPassword: false,
      confirmNewPassword: false,
    });
    setError('');
  };

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);

  const strengthScore = useMemo(() => {
    const password = form.newPassword || '';
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [form.newPassword]);

  const strengthMeta = useMemo(() => {
    const map = [
      { label: 'Too weak', color: '#f87171' },
      { label: 'Could be stronger', color: '#fbbf24' },
      { label: 'Almost there', color: '#34d399' },
      { label: 'Rock solid', color: '#22d3ee' },
    ];
    return map[Math.max(0, Math.min(strengthScore - 1, map.length - 1))];
  }, [strengthScore]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    if (forced) return;
    setError('');
    resetState();
    onClose?.();
  };

  const validate = () => {
    if (!form.currentPassword) return 'Current password is required';
    if (!form.newPassword) return 'New password is required';
    if (form.newPassword.length < 8) return 'New password must be at least 8 characters';
    if (form.newPassword === form.currentPassword) return 'New password must be different from current password';
    if (form.newPassword !== form.confirmNewPassword) return 'New password and confirmation do not match';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getToken();
      if (!token) {
        throw new Error('Session expired. Please login again.');
      }

      const response = await postJson(
        '/auth/change-password/self',
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmNewPassword: form.confirmNewPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response?.message || 'Password updated successfully!', {
        duration: 3500,
        style: {
          background: 'linear-gradient(135deg, #10b981, #14b8a6)',
          color: '#ecfeff',
          fontWeight: 600,
        },
        icon: '🛡️',
      });

      resetState();
      onSuccess?.();
    } catch (err) {
      const msg = err?.message || 'Failed to update password';
      setError(msg);
      toast.error(msg, {
        duration: 3500,
        style: {
          background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
          color: '#fee2e2',
          fontWeight: 600,
        },
        icon: '⚠️',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="sa-change-password-backdrop"
      onClick={() => {
        if (!forced) {
          handleClose();
        }
      }}
    >
      <div className="sa-change-password-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="sa-modal-hero">
          <div className="sa-hero-icon">🔐</div>
          <div>
            <h2>Update your password</h2>
            <p>Keep your account secure with a strong password that only you know.</p>
          </div>
        </div>

        {forced ? (
          <div className="sa-lock-banner">
            <span className="sa-lock-icon">⚠️</span>
            <p>Please update your password to continue.</p>
          </div>
        ) : null}

        <form className="sa-change-password-form" onSubmit={handleSubmit}>
          <div className="sa-form-grid">
            <div className="sa-form-field">
              <label htmlFor="currentPassword">Current password</label>
              <div className="sa-input-wrapper">
                <input
                  id="currentPassword"
                  type={showField.currentPassword ? 'text' : 'password'}
                  value={form.currentPassword}
                  onChange={(e) => handleChange('currentPassword', e.target.value)}
                  placeholder="Enter existing password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="sa-visibility-toggle"
                  onClick={() => setShowField(prev => ({ ...prev, currentPassword: !prev.currentPassword }))}
                  aria-label={showField.currentPassword ? 'Hide password' : 'Show password'}
                >
                  {showField.currentPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="sa-form-field">
              <label htmlFor="newPassword">New password</label>
              <div className="sa-input-wrapper">
                <input
                  id="newPassword"
                  type={showField.newPassword ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={(e) => handleChange('newPassword', e.target.value)}
                  placeholder="Create a strong password"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="sa-visibility-toggle"
                  onClick={() => setShowField(prev => ({ ...prev, newPassword: !prev.newPassword }))}
                  aria-label={showField.newPassword ? 'Hide password' : 'Show password'}
                >
                  {showField.newPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <div className="sa-strength-meter">
                <div className="sa-strength-bars">
                  {[0, 1, 2, 3].map((bar) => (
                    <span
                      key={bar}
                      className={`sa-strength-bar ${strengthScore > bar ? 'filled' : ''}`}
                      style={{ background: strengthScore > bar ? strengthMeta.color : 'rgba(148,163,184,0.35)' }}
                    />
                  ))}
                </div>
                {form.newPassword ? (
                  <span className="sa-strength-label" style={{ color: strengthMeta.color }}>
                    {strengthMeta.label}
                  </span>
                ) : (
                  <span className="sa-strength-label muted">Start typing to see strength</span>
                )}
              </div>
            </div>

            <div className="sa-form-field">
              <label htmlFor="confirmNewPassword">Confirm new password</label>
              <div className="sa-input-wrapper">
                <input
                  id="confirmNewPassword"
                  type={showField.confirmNewPassword ? 'text' : 'password'}
                  value={form.confirmNewPassword}
                  onChange={(e) => handleChange('confirmNewPassword', e.target.value)}
                  placeholder="Repeat new password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="sa-visibility-toggle"
                  onClick={() => setShowField(prev => ({ ...prev, confirmNewPassword: !prev.confirmNewPassword }))}
                  aria-label={showField.confirmNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showField.confirmNewPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="sa-error-banner">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <div className="sa-password-tips">
            <h4>Pro tips for an unbreakable password</h4>
            <ul>
              <li>Use at least 8 characters with uppercase, lowercase, numbers, and symbols.</li>
              <li>Avoid personal information or old passwords.</li>
              <li>Change your password frequently to stay secure.</li>
            </ul>
          </div>

          <div className="sa-modal-actions">
            {!forced ? (
              <button type="button" className="sa-btn ghost" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </button>
            ) : (
              <div />
            )}
            <button type="submit" className="sa-btn primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="sa-spinner" />
                  Securing...
                </>
              ) : (
                <>
                  <span className="sa-btn-icon">🛡️</span>
                  Change password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;


