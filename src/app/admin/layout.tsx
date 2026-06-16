import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';
import { LayoutDashboard, Users, Zap, FileText, Bell, LogOut, ShieldCheck } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Strict Admin Authorization
  if (!user || (user.role !== 'admin' && user.email !== 'opticoreph2026@gmail.com')) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#08080B] text-white flex">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-border-subtle bg-surface-900 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-border-subtle flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-accent-rose" />
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">OptiCore Admin</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Command Center</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-white/80 hover:text-white">
            <LayoutDashboard className="w-5 h-5 text-white/60" /> System Overview
          </Link>
          <Link href="/admin/clients" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-white/80 hover:text-white">
            <Users className="w-5 h-5 text-white/60" /> Households (Clients)
          </Link>
          <Link href="/admin/providers" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-white/80 hover:text-white">
            <Zap className="w-5 h-5 text-white/60" /> Utility Providers
          </Link>
          <Link href="/admin/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-white/80 hover:text-white">
            <FileText className="w-5 h-5 text-white/60" /> Telemetry Reports
          </Link>
          <Link href="/admin/alerts" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-white/80 hover:text-white">
            <Bell className="w-5 h-5 text-white/60" /> Global Alerts
          </Link>
        </nav>

        <div className="p-4 border-t border-border-subtle">
          <Link href="/dashboard" className="flex items-center justify-center gap-2 px-4 py-3 bg-surface-800 hover:bg-surface-800/80 rounded-xl transition-colors text-sm font-medium border border-border-subtle">
            <LogOut className="w-4 h-4" /> Exit to Client Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border-subtle bg-surface-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-accent-rose" />
            <h1 className="font-display font-bold text-lg">OptiCore Admin</h1>
          </div>
          <Link href="/dashboard" className="text-white/60 hover:text-white p-2">
            <LogOut className="w-5 h-5" />
          </Link>
        </header>
        
        <div className="p-6 md:p-10 max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
