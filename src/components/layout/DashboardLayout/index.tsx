import React, { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { PanelLeft } from 'lucide-react';
import { Header } from '../Header/index';
import { Sidebar } from '../Sidebar/index';
import { cn } from '../../../lib/utils';

type SidebarContextType = {
  isHidden: boolean;
  setIsHidden: (hidden: boolean) => void;
};

export const SidebarContext = createContext<SidebarContextType>({
  isHidden: false,
  setIsHidden: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

const DashboardLayout = () => {
  const [isHidden, setIsHidden] = useState(false);

  return (
    <SidebarContext.Provider value={{ isHidden, setIsHidden }}>
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
          <div className={cn(
            "flex-1 transition-all duration-300",
            isHidden ? "ml-0" : "ml-[280px]"
          )}>
            <main className="h-[calc(100vh-4rem)] relative">
              <div className="h-full">
                <Outlet />
              </div>
            </main>
          </div>
        </div>

        {/* Fixed Show Sidebar Button - Only visible when sidebar is hidden */}
        {isHidden && (
          <button
            onClick={() => setIsHidden(false)}
            className="fixed left-4 bottom-4 z-50 flex items-center gap-2 px-4 py-2 bg-background border rounded-xl shadow-lg transition-all duration-200 text-sm font-medium text-muted-foreground hover:bg-accent"
          >
            <PanelLeft className="h-5 w-5" />
            <span>Show Sidebar</span>
          </button>
        )}
      </div>
    </SidebarContext.Provider>
  );
};

export default DashboardLayout;
