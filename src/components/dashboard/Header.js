'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, Menu, Search as SearchIcon } from 'lucide-react';
import { clsx } from 'clsx';

export default function DashboardHeader({ user, onMenuClick }) {
  const router = useRouter();

  return (
    <header className="h-24 px-4 sm:px-12 flex items-center justify-between gap-8 z-50">
      
      {/* ── Left: Welcome Message ── */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Welcome back, {user?.name?.split(' ')[0] ?? 'Sarah'}! 👋
        </h1>
        <p className="text-xs text-slate-500 font-medium">admin name</p>
      </div>

      {/* ── Right: Search & Hub ── */}
      <div className="flex items-center gap-6">
        
        {/* Search Bar */}
        <div className="hidden md:flex items-center w-72 h-12 bg-white/[0.03] border border-white/10 rounded-2xl px-4 group focus-within:border-cyan-500/30 transition-all">
          <SearchIcon className="w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search" 
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder-slate-600 px-3"
          />
        </div>

        {/* Action Hub */}
        <div className="flex items-center gap-3">
          <button className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-surface-950" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/10 cursor-pointer hover:border-cyan-500/30 transition-all">
            <img 
              src={user?.avatar ?? "https://i.pravatar.cc/150?u=sarah"} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>

          <button 
            onClick={onMenuClick}
            className="lg:hidden w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
