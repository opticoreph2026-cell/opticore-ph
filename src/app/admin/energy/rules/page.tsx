import React from 'react';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export const runtime = 'nodejs';

export default async function AdminEnergyRules() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'admin' && user.email !== 'opticoreph2026@gmail.com')) {
    redirect('/dashboard');
  }

  const rates = await db.utilityRate.findMany({
    orderBy: { duCode: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Utility Rates & Rules</h1>
          <p className="text-gray-400">Manage distribution utility settings and blended rates.</p>
        </div>
        <button className="px-4 py-2 bg-accent-rose text-white font-medium rounded-lg hover:opacity-90 transition-opacity">
          Add Utility
        </button>
      </div>

      <div className="bg-surface-800 border border-border-subtle rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-900 border-b border-border-subtle text-white/60">
            <tr>
              <th className="px-6 py-4 font-medium">DU Code</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Res. Rate (₱/kWh)</th>
              <th className="px-6 py-4 font-medium">Net Metering Support</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-white/80">
            {rates.map((r: any) => (
              <tr key={r.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-bold text-accent-cyan">{r.duCode}</td>
                <td className="px-6 py-4">{r.duName}</td>
                <td className="px-6 py-4">₱{(r.blendedRateRes / 10000).toFixed(4)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 rounded text-xs ${
                    r.isSupported 
                      ? r.bestEffortOnly ? 'bg-amber-500/20 text-amber-500' : 'bg-green-500/20 text-green-500' 
                      : 'bg-red-500/20 text-red-500'
                  }`}>
                    {r.isSupported ? (r.bestEffortOnly ? 'Beta' : 'Supported') : 'Coming Soon'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
