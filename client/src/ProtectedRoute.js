import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        color: '#333333',
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return isAdmin ? children : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;
