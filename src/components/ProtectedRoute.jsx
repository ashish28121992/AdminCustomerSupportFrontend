import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../utils/auth';

function ProtectedRoute({ children }) {
  const location = useLocation();
  // Re-check auth on each render (new tab, manual URL)
  const authed = isAuthenticated();
  if (!authed) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  // Optional: if subadmin tries to access /admin, redirect to /subadmin
  const role = getUserRole();
  if (role === 'sub' && location.pathname.startsWith('/admin')) {
    return <Navigate to="/subadmin" replace />;
  }
  return children;
}

export default ProtectedRoute;


