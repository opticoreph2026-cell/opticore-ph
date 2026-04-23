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
    <div className="flex min-h-screen bg-surface-950 text-text-primary overflow-x-hidden selection:bg-cyan-500/30">
      {/* Background Ambient Glows & Pattern */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-500/[0.03] blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/[0.03] blur-[150px]" />
      </div>

      <DashboardSidebar 
        user={user} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main content — offset by sidebar width (280px) + left/right gaps */}
      <div className="lg:pl-[296px] flex flex-col min-h-screen relative z-10 w-full transition-all duration-300">
        <DashboardHeader 
          user={user} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        
        <main className="flex-1 w-full max-w-[1600px] mx-auto transition-all duration-500">
          {children}
        </main>
      </div>
    </div>

  );
}
