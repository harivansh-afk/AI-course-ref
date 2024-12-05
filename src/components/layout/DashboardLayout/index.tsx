import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-muted/50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
