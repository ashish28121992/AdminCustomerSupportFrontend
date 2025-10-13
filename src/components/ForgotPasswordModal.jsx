import React, { useState } from 'react';
import { postJson } from '../utils/api';
import toast from 'react-hot-toast';
import './ForgotPasswordModal.css';

function ForgotPasswordModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Call backend API to send password reset email
      const res = await postJson('/auth/forgot-password', { email });

      if (res?.success) {
        setSuccess(true);
        toast.success('Password reset link sent to your email! 📧', {
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            fontWeight: '600',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
          }
        });
        
        // Close modal after 2 seconds
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        const msg = res?.message || 'Failed to send reset email';
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
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
    setEmail('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="forgot-password-backdrop" onClick={handleClose}>
      <div className="forgot-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="forgot-password-header">
          <h2>🔐 Forgot Password</h2>
          <button className="close-btn" onClick={handleClose} type="button">
            ✕
          </button>
        </div>

        {!success ? (
          <form className="forgot-password-form" onSubmit={handleSubmit}>
            <p className="forgot-password-description">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <div className="form-field">
              <label htmlFor="forgot-email">Email Address</label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            {error && (
              <div className="forgot-password-error">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="forgot-password-actions">
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
                    Sending...
                  </>
                ) : (
                  '📧 Send Reset Link'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="forgot-password-success">
            <div className="success-icon">✅</div>
            <h3>Email Sent!</h3>
            <p>
              We've sent a password reset link to <strong>{email}</strong>.
            </p>
            <p className="success-note">
              Please check your inbox and spam folder. The link will expire in 1 hour.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordModal;

