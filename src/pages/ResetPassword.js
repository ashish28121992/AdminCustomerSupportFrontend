import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { postJson } from '../utils/api';
import toast from 'react-hot-toast';
import './Login.css';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token', {
        duration: 3000,
        style: {
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white',
          fontWeight: '600'
        }
      });
      setTimeout(() => navigate('/'), 2000);
    }
  }, [token, navigate]);

  function validate() {
    const nextErrors = {};
    
    if (!newPassword) {
      nextErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      nextErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    setApiError('');
    
    try {
      const res = await postJson('/auth/reset-password', {
        token,
        newPassword
      });

      if (res?.success) {
        toast.success('Password reset successful! 🎉', {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            fontWeight: '600',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
          }
        });
        
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } else {
        const msg = res?.message || 'Failed to reset password';
        setApiError(msg);
        toast.error(msg, {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            fontWeight: '600'
          }
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const msg = error?.message || 'Network error. Please try again.';
      setApiError(msg);
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
  }

  return (
    <div className="login-page">
      <div className="login-gradient" />
      <div className="login-stack">
        <img
          src={process.env.PUBLIC_URL + '/logo.png'}
          alt="Admin Support"
          className="logo-badge"
        />
        <div className="login-card" role="main">
          <div className="brand">
            <div className="brand-text">
              <h1>🔐 Reset Password</h1>
              <p>Enter your new password</p>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className={`field ${errors.newPassword ? 'has-error' : ''}`}>
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  aria-invalid={Boolean(errors.newPassword)}
                  aria-describedby={errors.newPassword ? 'newPassword-error' : undefined}
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.newPassword ? (
                <div id="newPassword-error" className="error-text">{errors.newPassword}</div>
              ) : null}
            </div>

            <div className={`field ${errors.confirmPassword ? 'has-error' : ''}`}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="password-input">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.confirmPassword ? (
                <div id="confirmPassword-error" className="error-text">{errors.confirmPassword}</div>
              ) : null}
            </div>

            {apiError && (
              <div className="error-banner animate-shake">
                <div className="error-icon">⚠️</div>
                <div className="error-content">
                  <div className="error-title">Reset Failed</div>
                  <div className="error-message">{apiError}</div>
                </div>
              </div>
            )}

            <button className="submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  <span>Resetting Password…</span>
                </>
              ) : (
                'Reset Password'
              )}
            </button>

            <div className="form-row" style={{ justifyContent: 'center', marginTop: '16px' }}>
              <button 
                type="button" 
                className="link" 
                onClick={() => navigate('/')}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
              >
                ← Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;

