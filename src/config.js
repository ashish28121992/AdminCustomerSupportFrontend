// Centralized app configuration
// Prefer environment variable if provided, else fallback to local dev API
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:4000';

// Auth token storage key (override via .env if needed)
export const AUTH_TOKEN_KEY = process.env.REACT_APP_AUTH_TOKEN_KEY || 'accessToken';


