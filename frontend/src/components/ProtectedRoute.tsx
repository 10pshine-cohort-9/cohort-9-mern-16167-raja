import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthResponse } from '../pages/Login';

/**
 * Helper function to safely parse and validate the user session.
 */
export const getValidSession = (): AuthResponse | null => {
  try {
    const userInfoString = localStorage.getItem('userInfo');
    if (!userInfoString) return null;
    
    const userInfo: AuthResponse = JSON.parse(userInfoString);
    
    // Ensure the parsed object actually contains the required token
    if (!userInfo || !userInfo.token) return null;
    
    return userInfo;
  } catch (error) {
    // If JSON.parse fails (corrupted data), catch it safely
    return null;
  }
};

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * A wrapper component that checks for authentication.
 * If the user is not logged in or data is invalid, they are redirected to the login page.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const userInfo = getValidSession();
  
  if (!userInfo) {
    // Clear any broken/invalid storage so it doesn't cause future issues
    localStorage.removeItem('userInfo');
    return <Navigate to="/login" replace />;
  }

  // If token exists and is valid, let them through!
  return children;
};

export default ProtectedRoute;