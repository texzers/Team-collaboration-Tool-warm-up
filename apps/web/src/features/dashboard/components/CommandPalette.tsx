import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { Search, Folder, CheckSquare, MessageSquare, Settings, User } from 'lucide-react';
import { useAuthStore } from '../../../store/auth';

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.clearAuth);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <Command 
        className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95"
        shouldFilter={true}
        loop
      >
        <div className="flex items-center border-b border-slate-200 dark:border-slate-700 px-4">
          <Search className="w-5 h-5 text-slate-400 mr-2" />
          <Command.Input 
            autoFocus 
            placeholder="What do you need? (e.g., 'tasks', 'settings')" 
            className="flex-1 h-14 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-500"
          />
          <button 
            onClick={() => setOpen(false)}
            className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600"
          >
            ESC
          </button>
        </div>

        <Command.List className="max-h-[300px] overflow-y-auto p-2">
          <Command.Empty className="p-6 text-center text-sm text-slate-500">
            No results found.
          </Command.Empty>

          <Command.Group heading="Navigation" className="px-2 text-xs font-medium text-slate-500 mb-2 mt-2">
            <Command.Item 
              onSelect={() => runCommand(() => navigate('/'))}
              className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer aria-selected:bg-slate-100 dark:aria-selected:bg-slate-700 text-slate-700 dark:text-slate-200 mt-1"
            >
              <CheckSquare className="w-4 h-4 mr-3 text-slate-400" />
              Dashboard & Tasks
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => navigate('/projects'))}
              className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer aria-selected:bg-slate-100 dark:aria-selected:bg-slate-700 text-slate-700 dark:text-slate-200 mt-1"
            >
              <Folder className="w-4 h-4 mr-3 text-slate-400" />
              Projects
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => navigate('/messages'))}
              className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer aria-selected:bg-slate-100 dark:aria-selected:bg-slate-700 text-slate-700 dark:text-slate-200 mt-1"
            >
              <MessageSquare className="w-4 h-4 mr-3 text-slate-400" />
              Messages & Channels
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Settings" className="px-2 text-xs font-medium text-slate-500 mb-2 mt-4 border-t border-slate-100 dark:border-slate-700 pt-4">
            <Command.Item 
              onSelect={() => runCommand(() => navigate('/settings/profile'))}
              className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer aria-selected:bg-slate-100 dark:aria-selected:bg-slate-700 text-slate-700 dark:text-slate-200 mt-1"
            >
              <User className="w-4 h-4 mr-3 text-slate-400" />
              Profile Settings
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => navigate('/settings/workspace'))}
              className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer aria-selected:bg-slate-100 dark:aria-selected:bg-slate-700 text-slate-700 dark:text-slate-200 mt-1"
            >
              <Settings className="w-4 h-4 mr-3 text-slate-400" />
              Workspace Preferences
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => { logout(); navigate('/login'); })}
              className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer aria-selected:bg-red-50 dark:aria-selected:bg-red-900/30 text-red-600 dark:text-red-400 mt-1"
            >
              Log out
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
};
