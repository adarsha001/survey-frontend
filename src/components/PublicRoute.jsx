import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/Auth'; // adjust path if different

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // If user is logged in, redirect to homepage
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
