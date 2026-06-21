import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { canAccessCustomerPortal } from '@/lib/energy-auth';

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || !canAccessCustomerPortal(session as any)) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-[#08080B] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F0F14] border-r border-white/5 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link href="/customer" className="font-display font-bold text-xl tracking-tight text-white flex items-center">
            <svg className="w-6 h-6 mr-2 text-[#06B6D4]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            My <span className="text-[#06B6D4] ml-1">OptiCore</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 text-sm font-medium">
          <Link href="/customer" className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            My System
          </Link>
          <Link href="/customer/documents" className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            Documents & Manuals
          </Link>
          <Link href="/customer/support" className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            Support & Maintenance
          </Link>
          {/* Link back to old bill analytics if they want it */}
          <Link href="/dashboard" className="flex items-center px-3 py-2 rounded-lg text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors mt-8">
            Legacy Bill Analytics
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#06B6D4]/20 flex items-center justify-center text-[#06B6D4] font-bold">
              {session.email?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white truncate max-w-[150px]">{session.email}</p>
              <p className="text-xs text-[#06B6D4]">Customer</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-[#0F0F14] border-b border-white/5 md:hidden">
          <Link href="/customer" className="font-display font-bold text-xl text-white">My OptiCore</Link>
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
