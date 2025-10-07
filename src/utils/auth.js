import { AUTH_TOKEN_KEY } from '../config';

const AUTH_ROLE_KEY = 'authRole';

export function saveToken(token) {
  try { localStorage.setItem(AUTH_TOKEN_KEY, token); } catch {}
}

export function getToken() {
  try { return localStorage.getItem(AUTH_TOKEN_KEY); } catch { return null; }
}

export function clearToken() {
  try { localStorage.removeItem(AUTH_TOKEN_KEY); } catch {}
  try { localStorage.removeItem(AUTH_ROLE_KEY); } catch {}
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


