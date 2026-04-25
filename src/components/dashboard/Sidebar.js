'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Users, Zap, CreditCard, BarChart3, Settings, Bell, LogOut, ChevronRight
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

const navigation = [
  {
    title: 'Analytics',
    items: [
      { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
      { href: '/dashboard/reports', label: 'Insight Reports', icon: BarChart3 },
    ]
  },
  {
    title: 'Engineering',
    items: [
      { href: '/dashboard/appliances', label: 'Asset Inventory', icon: Users },
      { href: '/dashboard/certification', label: 'Certificates', icon: Zap },
      { href: '/dashboard/roi-simulator', label: 'ROI Engine', icon: CreditCard },
    ]
  },
  {
    title: 'Administration',
    items: [
      { href: '/dashboard/alerts', label: 'System Alerts', icon: Bell },
      { href: '/dashboard/settings', label: 'Configuration', icon: Settings },
    ]
  }
];

export default function DashboardSidebar({ user, isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] lg:hidden animate-in fade-in" 
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "w-[300px] shrink-0 flex flex-col fixed top-0 lg:top-6 left-0 lg:left-6 z-[110] lg:z-40 transition-all duration-500 cubic-bezier",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "h-full lg:h-[calc(100vh-48px)] rounded-none lg:rounded-[40px] bg-surface-1000/40 backdrop-blur-2xl border-r lg:border border-white/[0.05] shadow-2xl"
        )}
      >
        {/* Logo Section */}
        <div className="px-10 py-12">
          <Link href="/dashboard" className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-white/[0.03] border border-white/10 rounded-[20px] flex items-center justify-center shadow-2xl group-hover:border-cyan-500/30 transition-all duration-500">
              <Logo className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter leading-none">
                OptiCore
              </h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1.5">
                Intelligence
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 space-y-10 overflow-y-auto pb-10 custom-scrollbar">
          {navigation.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.25em]">
                {section.title}
              </h3>
              <div className="space-y-1.5">
                {section.items.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => { if(window.innerWidth < 1024) onClose(); }}
                      className={clsx(
                        'group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 relative',
                        active
                          ? 'text-white font-bold bg-white/[0.06] shadow-xl ring-1 ring-white/10'
                          : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'
                      )}
                    >
                      <Icon className={clsx(
                        'w-5 h-5 transition-all duration-300',
                        active ? 'text-cyan-400 scale-110' : 'text-slate-600 group-hover:text-slate-400'
                      )} />
                      <span className="flex-1 text-sm tracking-tight">{label}</span>
                      {active && (
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="p-8 border-t border-white/[0.05]">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
