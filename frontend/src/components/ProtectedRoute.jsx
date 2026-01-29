import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const ProtectedRoute = ({ children }) => {
  
  const { currentUser } = useAuth(); 

  
  // If the context has no user, redirect to login.
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, show the protected content
  return children;
};

export default ProtectedRoute;