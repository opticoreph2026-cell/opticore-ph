import React from 'react';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { canAccessAdminEnergy } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';
import type { EnergyUtilityCompany } from '@prisma/client';
import { AddUtilityDialog } from '@/components/admin/AddUtilityDialog';

export const runtime = 'nodejs';

export default async function AdminEnergyRules() {
  const user = await getCurrentUser();
  if (!user || !canAccessAdminEnergy(user)) {
    redirect('/crm');
  }

  const utilities = await db.energyUtilityCompany.findMany({
    orderBy: { code: 'asc' },
    include: {
      rateSchedules: {
        orderBy: { effectiveDate: 'desc' },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Utility Rates & Rules</h1>
          <p className="text-gray-400">Manage distribution utility settings and blended rates.</p>
        </div>
        <AddUtilityDialog />
      </div>

      <div className="bg-surface-800 border border-border-subtle rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-900 border-b border-border-subtle text-white/60">
            <tr>
              <th className="px-6 py-4 font-medium">Code</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Res. Rate (₱/kWh)</th>
              <th className="px-6 py-4 font-medium">Net Metering</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-white/80">
            {utilities.map((u: EnergyUtilityCompany & { rateSchedules: { allInRateRu: number }[] }) => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-bold text-accent-cyan">{u.code}</td>
                <td className="px-6 py-4">{u.name}</td>
                <td className="px-6 py-4">
                  {u.rateSchedules[0]
                    ? `₱${(u.rateSchedules[0].allInRateRu / 10000).toFixed(4)}`
                    : '—'}
                </td>
                <td className="px-6 py-4">
                  {u.netMeteringApplicationUrl ? (
                    <span className="inline-flex px-2 py-1 rounded text-xs bg-green-500/20 text-green-500">
                      Supported
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 rounded text-xs bg-red-500/20 text-red-500">
                      Coming Soon
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
