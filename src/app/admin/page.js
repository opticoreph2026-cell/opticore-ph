import { getAdminKPIs, listAllClients } from '@/lib/db';
import { Users, FileText, Bell, TrendingUp, Zap, DollarSign, ArrowRight } from 'lucide-react';
import AdminKpiCharts from '@/components/admin/KpiCharts';
import Link from 'next/link';
import { clsx } from 'clsx';

export const metadata = { title: 'Admin KPIs — OptiCore PH' };

export default async function AdminDashboard() {
  let kpis = null, recentClients = [];
  try {
    [kpis, recentClients] = await Promise.all([
      getAdminKPIs(),
      listAllClients({ maxRecords: 5 }),
    ]);
  } catch { /* degrade */ }

  const stats = kpis ?? {
    totalClients: 0, proClients: 0, businessClients: 0,
    activeAlerts: 0, totalReports: 0, mrr: 0,
    planCounts: { starter: 0, pro: 0, business: 0 },
  };

  return (
    <div className="space-y-8 animate-fade-up max-w-7xl pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System <span className="text-brand-400">Intelligence</span></h1>
          <p className="text-white/50 text-sm mt-1.5 font-medium">Real-time platform performance and user analytics.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Live System Status</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {[
          { label: 'Total Clients',   value: stats.totalClients,   icon: Users,     color: 'text-blue-400',   bg: 'from-blue-500/20 to-transparent' },
          { label: 'Est. MRR (PHP)',  value: `₱${stats.mrr.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-transparent' },
          { label: 'Pro Members',     value: stats.proClients,     icon: TrendingUp, color: 'text-purple-400',  bg: 'from-purple-500/20 to-transparent' },
          { label: 'Enterprise',      value: stats.businessClients, icon: Zap,       color: 'text-amber-400',   bg: 'from-amber-500/20 to-transparent' },
          { label: 'Active Alerts',   value: stats.activeAlerts,   icon: Bell,      color: 'text-red-400',     bg: 'from-red-500/20 to-transparent' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="group relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] transition-all duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${bg} opacity-30 rounded-2xl`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </div>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">{label}</p>
              <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <AdminKpiCharts planCounts={stats.planCounts} />
        </div>
      </div>

      {/* Recent activity section */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Recent User Activity</h2>
            <p className="text-white/40 text-xs mt-0.5">Latest registrations and provider configurations.</p>
          </div>
          <Link 
            href="/admin/clients" 
            className="flex items-center gap-2 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors bg-brand-500/10 px-4 py-2 rounded-full border border-brand-500/20 group"
          >
            Manage All Clients
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {recentClients.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02]">
                  {['Client Identity', 'Account Tier', 'E-Infrastructure', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {recentClients.map((c) => (
                  <tr key={c.id} className="group hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">{c.name || 'Anonymous User'}</span>
                        <span className="text-xs text-white/40">{c.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex">
                        <span className={clsx(
                          'px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border',
                          c.planTier === 'business' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          c.planTier === 'pro'      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-white/5 text-white/50 border-white/10'
                        )}>
                          {c.planTier || 'Starter'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[1, 2].map(i => (
                            <div key={i} className={clsx(
                              'w-6 h-6 rounded-full border-2 border-surface-950 flex items-center justify-center text-[8px] font-bold',
                              i === 1 ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'
                            )}>
                              {i === 1 ? 'E' : 'W'}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-white/40 font-medium">
                          {[c.electricityProviderId, c.waterProviderId].filter(Boolean).length} / 2 active
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/clients/${c.id}`} className="text-white/30 hover:text-white transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-white/10" />
              </div>
              <p className="text-white/30 font-medium">No user records detected in Turso Cloud.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
