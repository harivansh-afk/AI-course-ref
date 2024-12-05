import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { routes } from './routes';

// TODO: Replace with your actual auth hook
const useAuth = () => {
  return {
    isAuthenticated: true, // Temporarily set to true for development
  };
};

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={routes.public.login} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
