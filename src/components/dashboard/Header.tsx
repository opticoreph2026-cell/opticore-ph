'use client';

import React from 'react';
import { useAuth } from '../ui/AuthProvider';

export function Header({ setSidebarOpen }: { setSidebarOpen: (open: boolean) => void }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface-1000/80 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden p-2 -ml-2 text-white/60 hover:text-white transition-colors"
      >
        <span className="sr-only">Open sidebar</span>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1 lg:flex-none"></div>

      <div className="flex items-center gap-4">
        {/* User Dropdown / Info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
            <p className="text-xs text-white/40 capitalize">{user?.role?.toLowerCase() || 'Free'} Plan</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-accent-cyan to-accent-emerald flex items-center justify-center text-sm font-bold text-white shadow-lg">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <button 
            onClick={() => logout()}
            className="ml-2 p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            title="Log out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
