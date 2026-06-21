import React from 'react';
import { getSession } from '@/lib/auth';
import { canAccessCrm } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';
import CrmSidebarWrapper from '@/components/crm/CrmSidebar';
import { NotificationBell } from '@/components/ui/NotificationBell';

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
  const email = session.email as string;
  const name = (session as any).name as string | undefined;

  return (
    <div className="flex min-h-screen bg-[#08080B] text-white">
      {/* Sidebar (desktop) + mobile topbar */}
      <CrmSidebarWrapper role={role} email={email} name={name} />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop top header */}
        <header className="hidden md:flex h-14 items-center justify-between px-8 bg-[#0F0F14]/60 backdrop-blur border-b border-white/5 flex-shrink-0">
          <div className="text-sm text-white/40 font-medium">
            OptiCore Energy Solutions — Internal CRM
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-6 md:p-8 pt-20 md:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
