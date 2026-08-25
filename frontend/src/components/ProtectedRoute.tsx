import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * A wrapper component that checks for authentication.
 * If the user is not logged in, they are redirected to the login page.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const userInfo = localStorage.getItem('userInfo');
  
  if (!userInfo) {
    // No token found? Kick them back to login.
    return <Navigate to="/login" replace />;
  }

  // If token exists, let them through!
  return children;
};

export default ProtectedRoute;