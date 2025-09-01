import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Safe destructuring with fallback values
  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;
  const token = authContext?.token || null;
  
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
