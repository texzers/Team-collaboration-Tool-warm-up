import React from 'react';
import { useAuthStore } from '../../../store/auth';
import { useLogout } from '../../auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Bell, Search, LayoutDashboard, CheckSquare, MessageSquare, Inbox, Settings } from 'lucide-react';
import { CommandPalette } from './CommandPalette';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  const { logout } = useLogout();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <CommandPalette />
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white">
            <div className="h-8 w-8 bg-primary rounded flex items-center justify-center font-bold">TF</div>
            <span className="font-bold text-lg tracking-tight">TeamFlow</span>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-1">
            <a href="/" className="flex items-center gap-3 px-3 py-2 bg-slate-800 text-white rounded-md">
              <LayoutDashboard size={18} />
              <span className="font-medium">Dashboard</span>
            </a>
            <a href="/projects" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800/50 hover:text-white rounded-md transition-colors">
              <CheckSquare size={18} />
              <span className="font-medium">Projects</span>
            </a>
            <a href="/inbox" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800/50 hover:text-white rounded-md transition-colors">
              <Inbox size={18} />
              <span className="font-medium">Inbox</span>
              <span className="ml-auto bg-primary text-white text-xs py-0.5 px-2 rounded-full">5</span>
            </a>
            <a href="/messages" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800/50 hover:text-white rounded-md transition-colors">
              <MessageSquare size={18} />
              <span className="font-medium">Messages</span>
            </a>
          </div>

          <div className="mt-8">
            <h4 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Projects</h4>
            <div className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-1.5 hover:bg-slate-800/50 hover:text-white rounded-md text-sm transition-colors">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                Website Redesign
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-1.5 hover:bg-slate-800/50 hover:text-white rounded-md text-sm transition-colors">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                Q3 Marketing
              </a>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <img 
              src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=random`} 
              alt="Avatar" 
              className="h-9 w-9 rounded-full object-cover border border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 mt-2 h-8" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 z-10">
          <div className="flex items-center flex-1">
            <button className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 md:hidden mr-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden md:flex items-center text-sm text-slate-500 dark:text-slate-400">
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium mr-2 border border-slate-200 dark:border-slate-600">Cmd+K</span>
              <span>to search or jump to...</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
