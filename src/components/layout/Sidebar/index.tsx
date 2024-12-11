import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Settings,
  MessageSquare,
  Upload,
  History,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useLatestChat } from '../../../hooks/useLatestChat';
import { useSidebar } from '../../../hooks/useSidebar';

const sidebarItems = [
  {
    icon: MessageSquare,
    label: 'Chat',
    path: '/dashboard/ask?new=true'
  },
  {
    icon: History,
    label: 'Chat History',
    path: '/dashboard/history'
  },
  {
    icon: Upload,
    label: 'Upload Materials',
    path: '/dashboard/upload'
  },
  {
    icon: Settings,
    label: 'Settings',
    path: '/dashboard/settings'
  },
];

const Sidebar = () => {
  const location = useLocation();
  const { navigateToChat } = useLatestChat();
  const { isHidden, setIsHidden } = useSidebar();

  const isActive = (path: string) => {
    if (path.startsWith('/dashboard/ask')) {
      return location.pathname.startsWith('/dashboard/ask') || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  return (
    <div 
      className={cn(
        "fixed left-0 top-16 bottom-0 w-[280px] bg-background border-r transition-all duration-300 z-50",
        isHidden ? "-translate-x-[280px]" : "translate-x-0"
      )}
    >
      <div className="flex flex-col h-full p-4">
        {/* Navigation Links */}
        <nav className="flex-1 space-y-1">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            if (index === 0) {
              // Special handling for Chat button
              return (
                <button
                  key={item.path}
                  onClick={navigateToChat}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                    active
                      ? 'bg-purple-50/50 text-purple-500'
                      : 'text-muted-foreground'
                  )}
                >
                  <Icon className={cn(
                    'h-5 w-5',
                    active
                      ? 'text-purple-500'
                      : 'text-muted-foreground'
                  )} />
                  {item.label}
                </button>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                  active
                    ? 'bg-purple-50/50 text-purple-500'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5',
                  active
                    ? 'text-purple-500'
                    : 'text-muted-foreground'
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setIsHidden(!isHidden)}
          className="flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium rounded-xl transition-all duration-200 text-muted-foreground"
        >
          {isHidden ? (
            <>
              <PanelLeft className="h-5 w-5" />
              Show Sidebar
            </>
          ) : (
            <>
              <PanelLeftClose className="h-5 w-5" />
              Hide Sidebar
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export { Sidebar };
