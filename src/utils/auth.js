import { AUTH_TOKEN_KEY } from '../config';

const AUTH_ROLE_KEY = 'authRole';
const AUTH_USER_KEY = 'authUser';

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


