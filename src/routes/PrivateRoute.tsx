import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { routes } from './routes';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to={routes.public.login} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
