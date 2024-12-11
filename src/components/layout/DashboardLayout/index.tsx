import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header/index';
import { Sidebar } from '../Sidebar/index';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-secondary/20">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Sidebar and main content */}
      <div className="flex w-full pt-16">
        {/* Fixed sidebar */}
        <div className="fixed left-0 top-16 bottom-0 w-[280px] p-4 overflow-y-auto">
          <Sidebar />
        </div>

        {/* Main content area */}
        <div className="flex-1 ml-[280px]">
          <main className="h-[calc(100vh-4rem)] relative">
            <div className="h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
