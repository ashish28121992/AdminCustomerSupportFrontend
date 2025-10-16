// Centralized app configuration
// Prefer environment variable if provided, else fallback to local dev API
// Normalize base URL and enforce HTTPS when app runs on HTTPS
const RAW_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://44.221.30.127:4000';

function normalizeApiBaseUrl(rawUrl) {
  try {
    // If rawUrl is missing protocol, default to https
    const hasProtocol = /^https?:\/\//i.test(rawUrl);
    const url = new URL(hasProtocol ? rawUrl : `https://${rawUrl}`);
    if (typeof window !== 'undefined' && window.location?.protocol === 'https:') {
      url.protocol = 'https:'; // avoid mixed content
    }
    return url.origin; // ensure we only keep origin part
  } catch (_) {
    return rawUrl; // fallback without altering
  }
}

export const API_BASE_URL = normalizeApiBaseUrl(RAW_API_BASE_URL);

// Auth token storage key (override via .env if needed)
export const AUTH_TOKEN_KEY = process.env.REACT_APP_AUTH_TOKEN_KEY || 'accessToken';


