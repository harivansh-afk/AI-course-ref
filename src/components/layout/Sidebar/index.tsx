import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Settings,
  MessageSquarePlus,
  Upload,
  BookOpen,
  GraduationCap,
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
    icon: Upload,
    label: 'Upload Materials',
    path: '/dashboard/upload'
  },
  {
    icon: BookOpen,
    label: 'Study Resources',
    path: '/dashboard/resources'
  },
  {
    icon: History,
    label: 'Study History',
    path: '/dashboard/history'
  },
  {
    icon: Settings,
    label: 'Settings',
    path: '/dashboard/settings'
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <GraduationCap className="h-6 w-6" />
        <span className="ml-2 font-semibold">Study Dashboard</span>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
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
}
