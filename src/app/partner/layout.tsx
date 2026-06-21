import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { canAccessPartnerPortal } from '@/lib/energy-auth';

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || !canAccessPartnerPortal(session as any)) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-[#08080B] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F0F14] border-r border-white/5 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link href="/partner" className="font-display font-bold text-xl tracking-tight text-white flex items-center">
            <svg className="w-6 h-6 mr-2 text-[#10B981]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            Partner <span className="text-[#10B981] ml-1">Portal</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 text-sm font-medium">
          <Link href="/partner" className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            My Projects
          </Link>
          <Link href="/partner/commissions" className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            Commissions & Payouts
          </Link>
          <Link href="/partner/resources" className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            Marketing Resources
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981] font-bold">
              {session.email?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white truncate max-w-[150px]">{session.email}</p>
              <p className="text-xs text-[#10B981]">Partner Agent</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
