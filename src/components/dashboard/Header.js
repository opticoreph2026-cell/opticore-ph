'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Search, User, LogOut, Settings, CreditCard, ChevronDown, Zap, Menu, Building2 } from 'lucide-react';
import { clsx } from 'clsx';
import Logo from '@/components/ui/Logo';
import PropertySwitcher from './PropertySwitcher';

/**
 * DashboardHeader - Facebook-style top navigation for OptiCore.
 * Provides a persistent search, notifications, and user profile at the top right.
 */
export default function DashboardHeader({ user, onMenuClick }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="h-16 border-b border-white/[0.04] bg-surface-950/80 backdrop-blur-xl sticky top-0 z-[60] px-4 sm:px-8 flex items-center justify-between gap-4">
      
      {/* ── Mobile Menu Trigger ── */}
      <button 
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-text-muted transition-all"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── Left: Logo (Mobile) or Search (Desktop) ── */}
      <div className="flex items-center gap-3 lg:hidden">
        <Logo className="w-6 h-6" />
        <span className="font-bold text-sm tracking-tight text-white uppercase italic">OptiCore</span>
      </div>

      <div className="hidden lg:flex items-center flex-1 max-w-md">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search dashboard..." 
            className="w-full bg-white/[0.03] border border-white/5 rounded-full pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-500/30 focus:bg-white/[0.05] transition-all"
          />
        </div>
      </div>

      <div className="flex-1 md:hidden" />

      {/* ── Right: User Controls ── */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl hover:bg-white/5 text-text-muted hover:text-white transition-all relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full border-2 border-surface-950" />
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-3 w-80 bg-surface-900 border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[70] animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] text-brand-500 font-bold cursor-pointer hover:underline">Mark all as read</span>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-brand-500" />
                  </div>
                  <div>
                    <p className="text-xs text-text-primary font-semibold">New Energy Insight</p>
                    <p className="text-[10px] text-text-muted">Your AC usage is 12% higher than average this month.</p>
                  </div>
                </div>
                <div className="flex gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer opacity-50">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-text-primary font-semibold">Weekly Report Ready</p>
                    <p className="text-[10px] text-text-muted">Your energy efficiency report is available for download.</p>
                  </div>
                </div>
              </div>
              <Link href="/dashboard/alerts" className="block text-center mt-4 pt-4 border-t border-white/5 text-[10px] uppercase font-black tracking-widest text-text-muted hover:text-brand-500 transition-colors">
                View All Alerts
              </Link>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={clsx(
              "flex items-center gap-3 pl-1.5 pr-3 py-1.5 rounded-full border transition-all duration-300",
              showProfileMenu 
                ? "bg-white/10 border-white/20 shadow-lg shadow-black/40" 
                : "bg-white/[0.03] border-white/5 hover:border-white/10 hover:bg-white/[0.05]"
            )}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-amber-600 flex items-center justify-center text-[11px] font-black text-surface-950 border border-white/10 shadow-sm">
              {user?.name?.charAt(0) ?? user?.email?.charAt(0) ?? 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[11px] font-bold text-white leading-tight truncate max-w-[100px]">{user?.name ?? 'User'}</p>
              <p className="text-[9px] text-brand-400 font-bold uppercase tracking-tighter opacity-70">
                {user?.plan ?? 'Starter'}
              </p>
            </div>
            <ChevronDown className={clsx("w-3.5 h-3.5 text-text-muted transition-transform", showProfileMenu && "rotate-180")} />
          </button>

          {showProfileMenu && (
            <div className="absolute top-full right-0 mt-3 w-64 bg-surface-900 border border-white/10 rounded-2xl p-2 shadow-[0_30px_60px_rgba(0,0,0,0.9)] z-[70] animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-white/5">
              <div className="px-4 py-3 mb-2 border-b border-white/5 flex flex-col gap-0.5">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
              </div>

              {/* Property Management Section */}
              <div className="px-2 py-2">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] px-2 mb-2">Switch Property</p>
                <PropertySwitcher />
              </div>

              <div className="h-px bg-white/5 my-2 mx-2" />

              <Link 
                href="/dashboard/settings" 
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-text-primary hover:bg-white/5 rounded-xl transition-all"
                onClick={() => setShowProfileMenu(false)}
              >
                <Settings className="w-4 h-4 text-brand-400" />
                Account Settings
              </Link>
              <Link 
                href="/dashboard/settings?tab=billing" 
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-text-primary hover:bg-white/5 rounded-xl transition-all"
                onClick={() => setShowProfileMenu(false)}
              >
                <CreditCard className="w-4 h-4 text-blue-400" />
                Subscription & Billing
              </Link>
              <div className="h-px bg-white/5 my-2 mx-2" />
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/5 rounded-xl transition-all w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
