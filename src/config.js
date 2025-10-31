// Centralized app configuration
// Set REACT_APP_API_BASE_URL in your environment to override the default

// Auto-detect protocol for production vs development
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // In production, use HTTPS if the current page is HTTPS
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    // Cloudflare Page Rule use karo '/api/*' routes ke liye
    // Backend EC2 ko already ja raha hai proper routing se
    return 'https://mydiamond99clientsupport.in/api';
  }
  
  // Development fallback
  return 'http://44.221.30.127:4000';
  // return 'http://localhost:4000';
};

export const API_BASE_URL = getApiBaseUrl();

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Development mode configuration for SSL certificate issues
export const DEV_CONFIG = {
  isDevelopment,
  // Allow self-signed certificates in development
  allowSelfSignedCerts: isDevelopment,
  // Add additional debugging info
  enableApiLogging: isDevelopment,
};

// Auth token storage key (override via .env if needed)
export const AUTH_TOKEN_KEY = process.env.REACT_APP_AUTH_TOKEN_KEY || 'accessToken';