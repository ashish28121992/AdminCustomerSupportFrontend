import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postJson } from '../utils/api';
import { saveToken, saveUserRole, saveUser } from '../utils/auth';
import toast from 'react-hot-toast';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  function validate() {
    const nextErrors = {};
    if (!email) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address';
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
      const res = await postJson('/auth/login', { email, password });
      if (res?.success && res?.data?.accessToken) {
        saveToken(res.data.accessToken);
        const user = res?.data?.user || {};
        const role = user?.role || '';
        saveUserRole(role);
        saveUser(user);
        toast.success('Login successful');
        if (role === 'sub') {
          navigate('/subadmin', { replace: true });
        } else {
          navigate('/admin', { replace: true });
        }
      } else {
        const msg = res?.message || 'Login failed';
        setApiError(msg);
        toast.error(msg);
      }
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
          <div className={`field ${errors.email ? 'has-error' : ''}`}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email ? (
              <div id="email-error" className="error-text">{errors.email}</div>
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
            <a className="link" href="#forgot">Forgot password?</a>
          </div>

          <button className="submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        {apiError ? <div className="error-text" style={{ marginTop: 8 }}>{apiError}</div> : null}
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
    </div>
  );
}

export default Login;


