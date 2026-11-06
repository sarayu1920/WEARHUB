import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-11 h-11 rounded-2xl bg-[#12372A] flex items-center justify-center text-white shadow-md animate-pulse">
          <span className="text-base font-extrabold text-emerald-300">W</span>
        </div>
        <p className="text-xs font-semibold text-neutral-500">Checking campus credentials...</p>
      </div>
    );
  }

  if (!currentUser) {
    // Preserve intended destination path + search query
    const destination = location.pathname + location.search;
    return (
      <Navigate
        to={`/auth?redirect=${encodeURIComponent(destination)}`}
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
};
