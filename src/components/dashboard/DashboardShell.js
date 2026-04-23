'use client';

import { useState } from 'react';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/Header';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

/**
 * DashboardShell - Client-side wrapper for the dashboard layout.
 * Manages responsive sidebar state.
 */
export default function DashboardShell({ children, user }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-950 text-text-primary selection:bg-brand-500/30 selection:text-brand-200">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <DashboardSidebar 
        user={user} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main content — offset by sidebar width (260px) + left margin (24px) = 284px */}
      <div className="lg:ml-[284px] flex flex-col min-h-screen relative z-10 w-full">
        <DashboardHeader 
          user={user} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        
        <main className="flex-1 p-6 md:p-8 lg:p-12 w-full max-w-7xl mx-auto">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
