import { getAdminKPIs, listAllClients } from '@/lib/db';
import { Users, FileText, Bell, TrendingUp, Zap, DollarSign } from 'lucide-react';
import AdminKpiCharts from '@/components/admin/KpiCharts';

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
    <div className="space-y-6 animate-fade-up max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Admin Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Platform-wide KPIs and activity overview.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Clients',   value: stats.totalClients,   icon: Users,     color: 'text-brand-400',   bg: 'bg-brand-500/10' },
          { label: 'Est. MRR (PHP)',  value: `₱${stats.mrr.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Pro Plans',       value: stats.proClients,     icon: TrendingUp, color: 'text-purple-400',  bg: 'bg-purple-500/10' },
          { label: 'Biz Plans',       value: stats.businessClients, icon: Zap,       color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Active Alerts',   value: stats.activeAlerts,   icon: Bell,      color: 'text-orange-400',  bg: 'bg-orange-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xs text-text-muted mb-1">{label}</p>
            <p className="text-3xl font-bold text-text-primary">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <AdminKpiCharts planCounts={stats.planCounts} />

      {/* Recent clients */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text-primary">Recent Clients</h2>
          <a href="/admin/clients" className="text-xs text-brand-400 hover:underline">View all →</a>
        </div>
        {recentClients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Name', 'Email', 'Plan', 'Providers'].map(h => (
                    <th key={h} className="text-left text-xs text-text-muted font-medium pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {recentClients.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 pr-4 text-text-primary font-medium">{c.name ?? '—'}</td>
                    <td className="py-3 pr-4 text-text-muted">{c.email ?? '—'}</td>
                    <td className="py-3 pr-4">
                      <span className={`stat-badge ${
                        c.planTier === 'business' ? 'stat-badge-amber' :
                        c.planTier === 'pro'      ? 'stat-badge-blue'  :
                        'bg-surface-700 text-text-muted border border-white/[0.06]'
                      }`}>
                        {c.planTier ?? 'starter'}
                      </span>
                    </td>
                    <td className="py-3 text-text-muted text-xs">
                      {[c.electricityProviderId, c.waterProviderId]
                        .filter(Boolean).length || '—'} configured
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-text-muted py-6 text-center">No clients yet.</p>
        )}
      </div>
    </div>
  );
}
