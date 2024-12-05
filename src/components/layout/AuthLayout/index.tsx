import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
