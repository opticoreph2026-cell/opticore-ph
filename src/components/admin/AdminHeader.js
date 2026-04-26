'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, LogOut, User, ChevronDown, Shield, Search } from 'lucide-react';
import { clsx } from 'clsx';
import Logo from '@/components/ui/Logo';
import AdminNotificationBell from '@/components/admin/AdminNotificationBell';

const TAGLINE = "Intelligent to the CORE";

export default function AdminHeader({ user, onMenuClick }) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    <header className="h-20 px-6 lg:px-8 flex items-center justify-between gap-8 z-50 sticky top-0 bg-surface-1000/60 backdrop-blur-xl border-b border-white/[0.04]">
      
      <div className="flex items-center gap-6">
        <button 
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) router.push(`/admin/clients?q=${encodeURIComponent(searchQuery.trim())}`);
          }}
          className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 w-80 group focus-within:border-brand-500/50 transition-all"
        >
          <Search className="w-4 h-4 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search clients, providers, or logs..."
            className="bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-600 w-full font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="flex items-center gap-4">
        
        {/* Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{TAGLINE}</span>
        </div>

        <AdminNotificationBell />

        <div className="w-px h-6 bg-white/[0.08]" />

        {/* User Hub */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1.5 pl-3 rounded-2xl hover:bg-white/[0.05] transition-all group border border-transparent hover:border-white/10"
          >
            <div className="flex flex-col items-end text-right">
              <span className="text-xs font-black text-white tracking-tight">{user?.name || 'Administrator'}</span>
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-tighter">Master Access</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-600 p-[1px] shadow-lg group-hover:shadow-brand-500/20 transition-all">
              <div className="w-full h-full rounded-[11px] bg-surface-1000 flex items-center justify-center overflow-hidden relative">
                {user?.avatar ? (
                  <Image src={user.avatar} alt="Avatar" fill className="object-cover" />
                ) : (
                  <Shield className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
            <ChevronDown className={clsx("w-3.5 h-3.5 text-slate-500 transition-transform duration-300", showUserMenu && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-surface-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-2 space-y-1">
                  <Link 
                    href="/admin/settings"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-500/20 group-hover:text-brand-400 transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    Profile Settings
                  </Link>
                  
                  <div className="h-px bg-white/5 mx-2 my-1" />
                  
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-rose-400/20 transition-colors">
                      <LogOut className="w-4 h-4" />
                    </div>
                    Sign Out
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
