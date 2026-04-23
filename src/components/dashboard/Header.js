'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Bell, Search, Menu, Search as SearchIcon, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export default function DashboardHeader({ user, onMenuClick }) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="h-24 px-4 sm:px-12 flex items-center justify-between gap-8 z-50 sticky top-0 bg-surface-950/40 backdrop-blur-md border-b border-white/[0.04]">
      
      {/* ── Left: Search (Moved to center-left for premium look) ── */}
      <div className="flex items-center gap-8 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center w-full max-w-md h-12 bg-white/[0.03] border border-white/10 rounded-2xl px-4 group focus-within:border-cyan-500/30 transition-all focus-within:bg-white/[0.05]">
          <SearchIcon className="w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search across assets..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder-slate-600 px-3"
          />
        </div>
      </div>

      {/* ── Right: User Hub (Facebook Style) ── */}
      <div className="flex items-center gap-4">
        
        {/* Notification Bell */}
        <button className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all relative group">
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-surface-950 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
        </button>
        
        {/* User Profile Hub */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={clsx(
              "flex items-center gap-3 p-1.5 pl-1.5 pr-4 rounded-full border transition-all",
              showUserMenu 
                ? "bg-white/[0.08] border-cyan-500/30 ring-4 ring-cyan-500/10" 
                : "bg-white/[0.03] border-white/10 hover:border-white/20"
            )}
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 relative">
              <Image 
                src={user?.avatar ?? "https://i.pravatar.cc/150?u=sarah"} 
                alt="Avatar" 
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-black text-white leading-tight">{user?.name?.split(' ')[0] ?? 'User'}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">Admin</p>
            </div>
            <ChevronDown className={clsx("w-4 h-4 text-slate-500 transition-transform", showUserMenu && "rotate-180")} />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 mt-3 w-64 bg-surface-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden z-[100] ring-1 ring-white/10"
            >
              <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Account Hub</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 p-[1px]">
                    <div className="w-full h-full rounded-2xl bg-surface-900 overflow-hidden relative">
                      <Image 
                        src={user?.avatar ?? "https://i.pravatar.cc/150?u=sarah"} 
                        alt="Avatar" 
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user?.name ?? 'User'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email ?? 'admin@opticore.ph'}</p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <Link 
                  href="/dashboard/settings" 
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-300 hover:text-white hover:bg-white/5 transition-all group"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
                  <span className="text-sm font-medium">Profile Settings</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all group"
                >
                  <LogOut className="w-4 h-4 text-rose-500 group-hover:text-rose-400" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
