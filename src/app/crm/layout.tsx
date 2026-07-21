import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
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

  const userRecord = await db.client.findUnique({
    where: { id: session.sub },
    select: { suspended: true, lastSignedInAt: true },
  });
  if (userRecord?.suspended) {
    redirect('/login');
  }

  const role = session.role as string;
  const email = session.email as string;
  const name = (session as any).name as string | undefined;

  return (
    <div className="flex min-h-screen bg-background-50 text-foreground-950">
      {/* Sidebar (desktop) + mobile topbar */}
      <CrmSidebarWrapper role={role} email={email} name={name} />

      {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0">
        {/* Desktop top header */}
        <header className="hidden md:flex h-14 items-center justify-between px-8 bg-background-100/60 backdrop-blur border-b border-foreground-950/10 flex-shrink-0 relative z-10">
          <div className="text-sm text-foreground-950/40 font-medium">
            OptiCore Energy Solutions — Internal CRM
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto relative">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-accent-blue/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-accent-cyan/5 blur-3xl pointer-events-none" />
          <div className="relative p-6 md:p-8 pt-20 md:pt-6 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
