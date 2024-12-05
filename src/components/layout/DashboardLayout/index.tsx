import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header/index';
import { Sidebar } from '../Sidebar/index';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-muted/50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
