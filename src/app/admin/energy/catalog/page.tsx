import React from 'react';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export const runtime = 'nodejs';

export default async function AdminEnergyCatalog() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'admin' && user.email !== 'opticoreph2026@gmail.com')) {
    redirect('/dashboard');
  }

  const products = await db.productCatalog.findMany({
    orderBy: { category: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Energy Catalog</h1>
          <p className="text-gray-400">Manage components: Panels, Inverters, Batteries.</p>
        </div>
        <button className="px-4 py-2 bg-accent-rose text-white font-medium rounded-lg hover:opacity-90 transition-opacity">
          Add Component
        </button>
      </div>

      <div className="bg-surface-800 border border-border-subtle rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-900 border-b border-border-subtle text-white/60">
            <tr>
              <th className="px-6 py-4 font-medium">Model</th>
              <th className="px-6 py-4 font-medium">Brand</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Specs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-white/80">
            {products.map((p: any) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{p.modelId}</td>
                <td className="px-6 py-4">{p.brand}</td>
                <td className="px-6 py-4 uppercase text-xs tracking-wider text-accent-cyan">{p.category}</td>
                <td className="px-6 py-4 text-white/60 text-xs">
                  {p.capacityWatts ? `${p.capacityWatts}W` : ''}
                  {p.capacityKwh ? `${p.capacityKwh}kWh` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
