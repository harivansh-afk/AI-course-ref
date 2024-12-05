import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header';

const AuthLayout: React.FC = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header />
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
