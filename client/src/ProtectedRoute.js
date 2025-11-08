import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAdmin, loading, currentUser } = useAuth();

  console.log('ProtectedRoute - isAdmin:', isAdmin, 'loading:', loading, 'currentUser:', currentUser?.email);

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

  if (!isAdmin) {
    console.log('ProtectedRoute - Not admin, redirecting to login');
    return <Navigate to="/admin/login" replace />;
  }

  console.log('ProtectedRoute - Admin access granted');
  return children;
};

export default ProtectedRoute;
