import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header/index';
import { Sidebar } from '../Sidebar/index';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-secondary/20">
      <Header />
      <div className="flex flex-1 overflow-hidden gap-6 p-6 pt-24">
        <Sidebar />
        <main className="flex-1 overflow-y-auto rounded-2xl bg-background shadow-sm border">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
