'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ScanLine, Calculator, Server, Settings, Zap, Home
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

const navigation = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/scan', label: 'Scan Bill', icon: ScanLine },
  { href: '/dashboard/simulator', label: 'Sulit Mode', icon: Calculator },
  { href: '/dashboard/appliances', label: 'Appliances', icon: Home },
  { href: '/dashboard/insights', label: 'Insights', icon: Zap },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardSidebar({ user, isOpen, onClose }: { user: any, isOpen: boolean, onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-surface-1000/90 backdrop-blur-xl border-t border-white/[0.05] z-50 px-2 py-2 flex justify-around items-center safe-area-pb">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-col items-center p-2 rounded-xl transition-all",
                active ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Icon className={clsx("w-5 h-5 mb-1", active && "scale-110")} />
              <span className="text-[9px] font-bold tracking-wider uppercase">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop Sidebar */}
      <aside
        className={clsx(
          "hidden lg:flex w-[280px] shrink-0 flex-col fixed top-6 left-6 z-40 transition-all duration-500",
          "h-[calc(100vh-48px)] rounded-[32px] bg-surface-1000/40 backdrop-blur-2xl border border-white/[0.05] shadow-2xl"
        )}
      >
        {/* Logo Section */}
        <div className="px-8 py-10">
          <Link href="/dashboard" className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-white/[0.03] border border-white/10 rounded-[16px] flex items-center justify-center shadow-2xl group-hover:border-cyan-500/30 transition-all duration-500">
              <Logo className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tighter leading-none">
                OptiCore <span className="text-cyan-500">PH</span>
              </h1>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-10 custom-scrollbar">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);

            return (
              <motion.div
                key={href}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={href}
                  className={clsx(
                    'group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative',
                    active
                      ? 'text-white font-bold bg-white/[0.08] shadow-2xl ring-1 ring-white/20'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]'
                  )}
                >
                  <Icon className={clsx(
                    'w-5 h-5 transition-all duration-300',
                    active ? 'text-cyan-400' : 'text-slate-600 group-hover:text-slate-400'
                  )} />
                  <span className="flex-1 text-sm tracking-tight">{label}</span>
                  {active && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
