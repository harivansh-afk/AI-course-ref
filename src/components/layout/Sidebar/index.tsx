import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Settings,
  MessageSquare,
  Upload,
  History
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useLatestChat } from '../../../hooks/useLatestChat';

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

  const isActive = (path: string) => {
    if (path.startsWith('/dashboard/ask')) {
      return location.pathname.startsWith('/dashboard/ask') || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  return (
    <div className="h-full">
      <div className="flex flex-col h-full space-y-4">
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
                      : 'text-muted-foreground hover:bg-purple-50/30 hover:text-purple-500'
                  )}
                >
                  <Icon className={cn(
                    'h-5 w-5',
                    active
                      ? 'text-purple-500'
                      : 'text-muted-foreground group-hover:text-purple-500'
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
                    : 'text-muted-foreground hover:bg-purple-50/30 hover:text-purple-500'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5',
                  active
                    ? 'text-purple-500'
                    : 'text-muted-foreground group-hover:text-purple-500'
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export { Sidebar };
