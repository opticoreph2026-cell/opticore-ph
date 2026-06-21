import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { canAccessCrm } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || !canAccessCrm(session as any)) {
    redirect('/login');
  }

  const role = session.role as string;
  const isOwner = role === 'opticore_owner';

  return (
    <div className="flex min-h-screen bg-[#08080B] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F0F14] border-r border-white/5 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link href="/crm" className="font-display font-bold text-xl tracking-tight text-white flex items-center">
            <svg className="w-6 h-6 mr-2 text-[#F5A524]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            OptiCore <span className="text-[#F5A524] ml-1">CRM</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 text-sm font-medium">
          <Link href="/crm" className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/crm/leads" className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            Leads & Prospects
          </Link>
          <Link href="/crm/designs" className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            Sizing & ROI Engine
          </Link>
          <Link href="/crm/projects" className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            Active Projects
          </Link>
          {isOwner && (
            <>
              <Link href="/crm/inventory" className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                Inventory Management
              </Link>
              <Link href="/crm/commissions" className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                Partner Commissions
              </Link>
              <Link href="/crm/settings" className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors mt-8">
                System Settings
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#F5A524] to-[#06B6D4] flex items-center justify-center text-[#08080B] font-bold">
              {session.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white truncate max-w-[150px]">{session.email}</p>
              <p className="text-xs text-gray-500 capitalize">{role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-[#0F0F14] border-b border-white/5 md:hidden">
          <Link href="/crm" className="font-display font-bold text-xl text-white">OptiCore CRM</Link>
          <button className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>
        
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
