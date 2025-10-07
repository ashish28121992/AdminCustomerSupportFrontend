import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

function ProtectedRoute({ children }) {
  const location = useLocation();
  // Re-check auth on each render (new tab, manual URL)
  const authed = isAuthenticated();
  if (!authed) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
}

export default ProtectedRoute;


