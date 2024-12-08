import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './routes';
import { PrivateRoute } from './PrivateRoute';

// Loading component
const Loading: React.FC = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="text-lg">Loading...</div>
  </div>
);

// Layouts
const DashboardLayout = React.lazy(() => import('../components/layout/DashboardLayout'));
const AuthLayout = React.lazy(() => import('../components/layout/AuthLayout'));

// Public Pages
const Home = React.lazy(() => import('../pages/Home'));
const Login = React.lazy(() => import('../pages/auth/Login'));
const Signup = React.lazy(() => import('../pages/auth/Signup'));

// Dashboard Pages
const AskQuestion = React.lazy(() => import('../pages/dashboard/ask'));
const UploadMaterials = React.lazy(() => import('../pages/dashboard/upload'));
const StudyHistory = React.lazy(() => import('../pages/dashboard/history'));
const Settings = React.lazy(() => import('../pages/dashboard/Settings'));

const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType<object>>) => {
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public Routes */}
        <Route path={routes.public.home} element={withSuspense(Home)} />

        {/* Auth Routes */}
        <Route path="/auth" element={withSuspense(AuthLayout)}>
          <Route path="login" element={withSuspense(Login)} />
          <Route path="signup" element={withSuspense(Signup)} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              {withSuspense(DashboardLayout)}
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="ask" replace />} />
          <Route path="ask" element={withSuspense(AskQuestion)} />
          <Route path="ask/:chatId" element={withSuspense(AskQuestion)} />
          <Route path="upload" element={withSuspense(UploadMaterials)} />
          <Route path="history" element={withSuspense(StudyHistory)} />
          <Route path="settings" element={withSuspense(Settings)} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
