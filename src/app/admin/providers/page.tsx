import React from 'react';
import { db } from '@/lib/db';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Zap, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminUtilityRatesPage() {
  const utilities = await db.energyUtilityCompany.findMany({
    orderBy: { name: 'asc' },
    include: {
      rateSchedules: {
        orderBy: { effectiveDate: 'desc' },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            <Zap className="w-8 h-8 text-accent-emerald" />
            Utility Companies
          </h1>
          <p className="text-white/60 mt-1">Manage DUs, co-ops, and their current rate schedules.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent-emerald/10 hover:bg-accent-emerald/20 border border-accent-emerald/20 text-accent-emerald rounded-xl transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" />
          Add Utility
        </button>
      </div>

      <SpotlightCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-white/[0.02]">
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Utility Company</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Code</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Territory</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider text-right">All-In Rate (₱/kWh)</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider text-right">Effective Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {utilities.map((utility: any) => {
                const latestRate = utility.rateSchedules[0];
                return (
                  <tr key={utility.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-1000 border border-border-subtle flex items-center justify-center text-xs font-bold text-accent-emerald">
                          {utility.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium text-white">{utility.name}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono text-accent-cyan">{utility.code}</span>
                    </td>
                    <td className="p-4 text-sm text-white/60">{utility.territory || '—'}</td>
                    <td className="p-4 text-right">
                      {latestRate ? (
                        <span className="text-sm font-medium text-white">
                          ₱{(latestRate.allInRateRu / 10000).toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-sm text-white/40">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right text-sm text-white/60">
                      {latestRate
                        ? new Date(latestRate.effectiveDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                );
              })}

              {utilities.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/60 text-sm">
                    No utility companies configured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SpotlightCard>
    </div>
  );
}
