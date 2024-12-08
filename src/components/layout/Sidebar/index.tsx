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
      return location.pathname.startsWith('/dashboard/ask') || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  return (
    <div className="w-64 shrink-0">
      <div className="rounded-2xl bg-background border shadow-sm h-full p-4">
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                  active
                    ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-sm hover:from-purple-500 hover:to-purple-600'
                    : 'text-muted-foreground hover:bg-purple-50/50 hover:text-purple-500'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5',
                  active
                    ? 'text-white'
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
