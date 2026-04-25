'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, LogOut, User, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import NotificationPopover from './NotificationPopover';

/**
 * DashboardHeader - Optimized for professional looks and zero redundancy.
 * Integrates system status and profile management into a clean obsidian hub.
 */
export default function DashboardHeader({ user, onMenuClick }) {
  const router = useRouter();
  const pathname = usePathname();
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
    <header className="h-20 px-6 lg:px-12 flex items-center justify-between gap-8 z-50 sticky top-0 bg-surface-1000/60 backdrop-blur-xl border-b border-white/[0.04]">
      
      <div className="flex items-center gap-6">
        <button 
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ── Right: Integrated Hub ── */}
      <div className="flex items-center gap-4">

        {/* Notifications */}
        <NotificationPopover />
        
        {/* Divider */}
        <div className="w-px h-6 bg-white/[0.08]" />

        {/* User Hub */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={clsx(
              "flex items-center gap-3 p-1 rounded-full transition-all duration-300",
              showUserMenu ? "bg-white/[0.1] ring-1 ring-white/20" : "hover:bg-white/5"
            )}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 relative shadow-2xl">
              <Image 
                src={user?.avatar || user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Opti'}`} 
                alt="Avatar" 
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <ChevronDown className={clsx("w-4 h-4 text-slate-500 mr-2 transition-transform", showUserMenu && "rotate-180")} />
          </button>

          {/* User Dropdown */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                className="absolute right-0 mt-3 w-64 bg-surface-950/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[100] ring-1 ring-white/10"
              >
                <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Your Account</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-surface-900 border border-white/10 overflow-hidden relative shadow-lg">
                      <Image 
                        src={user?.avatar || user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Opti'}`} 
                        alt="Avatar" 
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-white truncate">{user?.name ?? 'Valued User'}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.plan ?? 'Free'} Plan</p>
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
                    <span className="text-sm font-bold">Profile Info</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all group"
                  >
                    <LogOut className="w-4 h-4 text-rose-500 group-hover:text-rose-400" />
                    <span className="text-sm font-bold">Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
