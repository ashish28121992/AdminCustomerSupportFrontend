import { AUTH_TOKEN_KEY } from '../config';

const AUTH_ROLE_KEY = 'authRole';
const AUTH_USER_KEY = 'authUser';
const SUBADMIN_PASSWORD_TRACKER_PREFIX = 'subadmin:pwd-reset:';

const getSubadminTrackerKey = (user) => {
  if (!user) return null;
  const identifier = user.id || user._id || user.username || user.userId;
  if (!identifier) return null;
  return `${SUBADMIN_PASSWORD_TRACKER_PREFIX}${identifier}`;
};

export function saveToken(token) {
  try { localStorage.setItem(AUTH_TOKEN_KEY, token); } catch {}
}

export function getToken() {
  try { return localStorage.getItem(AUTH_TOKEN_KEY); } catch { return null; }
}

export function clearToken() {
  try { localStorage.removeItem(AUTH_TOKEN_KEY); } catch {}
  try { localStorage.removeItem(AUTH_ROLE_KEY); } catch {}
  try { localStorage.removeItem(AUTH_USER_KEY); } catch {}
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function saveUserRole(role) {
  try { localStorage.setItem(AUTH_ROLE_KEY, role || ''); } catch {}
}

export function getUserRole() {
  try { return localStorage.getItem(AUTH_ROLE_KEY) || ''; } catch { return ''; }
}

export function saveUser(user) {
  try { localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user || {})); } catch {}
}

export function getUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function deriveSubadminPasswordResetRequirement(user) {
  if (!user || user.role !== 'sub') return false;
  if (typeof user.mustChangePassword === 'boolean') return user.mustChangePassword;
  if (typeof user.forcePasswordChange === 'boolean') return user.forcePasswordChange;
  if (typeof user.requirePasswordReset === 'boolean') return user.requirePasswordReset;
  if (typeof user.isDefaultPassword === 'boolean') return user.isDefaultPassword;
  if (typeof user.hasChangedPassword === 'boolean') return !user.hasChangedPassword;
  return false;
}

export function markSubadminPasswordResetPending(user, override = false) {
  const key = getSubadminTrackerKey(user);
  if (!key) return;
  try {
    const current = localStorage.getItem(key);
    if (override || current !== 'done') {
      localStorage.setItem(key, 'pending');
    }
  } catch {}
}

export function markSubadminPasswordResetComplete(user) {
  const key = getSubadminTrackerKey(user);
  if (!key) return;
  try { localStorage.setItem(key, 'done'); } catch {}
}

export function isSubadminPasswordResetPending(user) {
  if (!user || user.role !== 'sub') return false;
  if (deriveSubadminPasswordResetRequirement(user)) {
    return true;
  }
  const key = getSubadminTrackerKey(user);
  if (!key) return false;
  try { return localStorage.getItem(key) === 'pending'; } catch { return false; }
}

