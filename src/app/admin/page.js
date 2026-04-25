import { 
  Users, FileText, Bell, TrendingUp, Zap, Wallet, ArrowRight, 
  CreditCard, ShieldCheck, History, Edit2, ShieldAlert, Cpu 
} from 'lucide-react';
import AdminKpiCharts from '@/components/admin/KpiCharts';
import Link from 'next/link';
import { clsx } from 'clsx';
import { getAdminKPIs, listAllClients, listAllTransactions, getSystemTelemetry } from '@/lib/db';

import AdminClientTable from '@/components/admin/AdminClientTable';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin Command — OptiCore PH' };

export default async function AdminDashboard() {
  let kpis = null, recentClients = [], transactions = [], telemetry = null;
  try {
    [kpis, recentClients, transactions, telemetry] = await Promise.all([
      getAdminKPIs(),
      listAllClients({ maxRecords: 10 }),
      listAllTransactions({ maxRecords: 10 }),
      getSystemTelemetry(),
    ]);
  } catch (error) {
    console.error('[Admin DB Error]:', error);
  }

  const statCards = [
    { label: 'Total Customers', value: kpis?.totalClients ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Pro Subscriptions', value: kpis?.proClients ?? 0, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Business Tier', value: kpis?.businessClients ?? 0, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Monthly Earnings', value: `₱${(kpis?.mrr ?? 0).toLocaleString()}`, icon: Wallet, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  return (
    <div className="space-y-8 animate-fade-up max-w-7xl pb-10">
      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bento-card p-6 flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-6 h-6 ${s.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-text-faint uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-text-primary tracking-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ── Main Activity ── */}
        <div className="lg:col-span-2 space-y-8">
          {/* User Management */}
          <section className="bento-card overflow-hidden">
            <div className="px-6 py-5 border-b border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <h2 className="font-bold text-text-primary">User Management</h2>
              </div>
              <span className="text-[10px] font-bold text-text-faint bg-white/5 px-2 py-1 rounded uppercase tracking-tighter">
                Latest {recentClients.length}
              </span>
            </div>
            
            <AdminClientTable clients={recentClients} />
          </section>

          {/* Financial Inventory */}
          <section className="bento-card overflow-hidden">
            <div className="px-6 py-5 border-b border-white/[0.04] flex items-center gap-3">
              <History className="w-5 h-5 text-brand-400" />
              <h2 className="font-bold text-text-primary">Financial Inventory</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-white/[0.02] text-[10px] font-black text-text-faint uppercase tracking-widest border-b border-white/[0.04]">
                    <th className="px-6 py-4">Transaction</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.01]">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-text-primary capitalize">{t.planTier} Tier</span>
                          <span className="text-[11px] text-text-faint">{t.client?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-text-primary">₱{t.amount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "px-2 py-0.5 rounded text-[9px] font-black uppercase",
                          t.type === 'manual_override' ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                        )}>
                          {t.type === 'manual_override' ? 'Admin Gift' : 'PayMongo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-text-faint text-[11px]">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr><td colSpan="4" className="px-6 py-10 text-center text-text-faint italic">No transactions recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ── Sidebar Analytics ── */}
        <div className="space-y-8">
          {/* System Pulse */}
          <section className="bento-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Cpu className="w-5 h-5 text-brand-400" />
              <h2 className="font-bold text-text-primary text-sm uppercase tracking-wider">System Pulse</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  <span>AI Engine Load</span>
                  <span className="text-cyan-400">
                    {((telemetry?.totalTokens / (telemetry?.geminiLimit || 1)) * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.4)] transition-all duration-1000"
                    style={{ width: `${Math.min(100, (telemetry?.totalTokens / (telemetry?.geminiLimit || 1)) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-600 mt-2 font-bold uppercase">
                  {telemetry?.totalTokens?.toLocaleString()} / 1M Request Units
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-black text-text-faint uppercase tracking-widest mb-1">Google Logins</p>
                  <p className="text-xl font-bold text-text-primary">{telemetry?.googleLogins || 0}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-text-faint uppercase tracking-widest mb-1">Total AI Scans</p>
                  <p className="text-xl font-bold text-text-primary">{telemetry?.totalScans || 0}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bento-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-5 h-5 text-brand-400" />
              <h2 className="font-bold text-text-primary text-sm uppercase tracking-wider">Revenue Pulse</h2>
            </div>
            <AdminKpiCharts planCounts={kpis?.planCounts} />
          </section>

          <section className="bento-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-red-400" />
              <h2 className="font-bold text-text-primary text-sm uppercase tracking-wider">System Alerts</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-red-300 mb-1">Production Shield Active</p>
                  <p className="text-[10px] text-red-400/70 leading-relaxed">External database sync is restricted to authorized agents.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
