import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postJson } from '../utils/api';
import { saveToken, saveUserRole, saveUser, deriveSubadminPasswordResetRequirement, markSubadminPasswordResetPending } from '../utils/auth';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import toast from 'react-hot-toast';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  function validate() {
    const nextErrors = {};
    if (!identifier) {
      nextErrors.identifier = 'Username or email is required';
    }
    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
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
      const res = await postJson('/auth/login', { identifier, password });
      if (res?.success && res?.data?.accessToken) {
        saveToken(res.data.accessToken);
        const user = res?.data?.user || {};
        const role = user?.role || '';
        saveUserRole(role);
        saveUser(user);
        toast.success('Login successful! 🎉', {
          duration: 2000,
          style: {
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            fontWeight: '600',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
          }
        });
        if (role === 'sub') {
          const requiresReset = deriveSubadminPasswordResetRequirement(user);
          markSubadminPasswordResetPending(user, requiresReset);
          navigate('/subadmin', { replace: true });
        } else {
          navigate('/admin', { replace: true });
        }
      } else {
        const msg = res?.message || 'Login failed';
        setApiError('⚠️ Please fill correct credentials. Check your username/email and password.');
        toast.error('Invalid credentials!', {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            fontWeight: '600',
            boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)'
          }
        });
      }
    } catch (error) {
      setApiError('⚠️ Please fill correct credentials. Username/Email or password is incorrect.');
      toast.error('Login failed! Check your credentials.', {
        duration: 3000,
        style: {
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white',
          fontWeight: '600',
          boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)'
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
              <h1>Admin Support</h1>
              <p>Sign in to continue</p>
            </div>
          </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className={`field ${errors.identifier ? 'has-error' : ''}`}>
            <label htmlFor="identifier">Username or Email</label>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              placeholder="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              aria-invalid={Boolean(errors.identifier)}
              aria-describedby={errors.identifier ? 'identifier-error' : undefined}
            />
            {errors.identifier ? (
              <div id="identifier-error" className="error-text">{errors.identifier}</div>
            ) : null}
          </div>

          <div className={`field ${errors.password ? 'has-error' : ''}`}>
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
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
            {errors.password ? (
              <div id="password-error" className="error-text">{errors.password}</div>
            ) : null}
          </div>

          <div className="form-row">
            <label className="remember">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <button 
              type="button" 
              className="link forgot-link" 
              onClick={() => setIsForgotPasswordOpen(true)}
            >
              Forgot password?
            </button>
          </div>

          {apiError && (
            <div className="error-banner animate-shake">
              <div className="error-icon">🔒</div>
              <div className="error-content">
                <div className="error-title">Authentication Failed</div>
                <div className="error-message">{apiError}</div>
              </div>
            </div>
          )}

          <button className="submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner-small"></span>
                <span>Signing in…</span>
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

          <div className="footer-text">
            <span>By continuing, you agree to our</span>
            <a className="link" href="#terms"> Terms</a>
            <span> and</span>
            <a className="link" href="#privacy"> Privacy Policy</a>
            <span>.</span>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        open={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
}

export default Login;


