import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Settings,
  MessageSquarePlus,
  Upload,
  History
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const sidebarItems = [
  {
    icon: MessageSquarePlus,
    label: 'Ask a Question',
    path: '/dashboard/ask'
    },
  {
    icon: History,
    label: 'Study History',
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

  const isActive = (path: string) => {
    if (path === '/dashboard/ask') {
      return location.pathname === '/dashboard' || location.pathname === path;
    }
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <nav className="flex-1 space-y-1 px-2 py-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export { Sidebar };
