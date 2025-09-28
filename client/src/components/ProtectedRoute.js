import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow access to all users (authenticated or guest)
  return children;
};

export default ProtectedRoute;