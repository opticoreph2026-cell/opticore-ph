'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/Header';
import MeshGradient from '@/components/ui/MeshGradient';

export default function DashboardShell({ children, user }: { children: React.ReactNode, user: any }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-surface-1000 text-white overflow-x-hidden selection:bg-cyan-500/30 pb-20 lg:pb-0">
      <MeshGradient />

      <DashboardSidebar 
        user={user} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main content — offset by sidebar width on desktop */}
      <div className="lg:pl-[328px] lg:pr-8 flex flex-col min-h-screen relative z-10 w-full transition-all duration-500">
        <DashboardHeader 
          user={user} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        
        <main className="flex-1 w-full max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
