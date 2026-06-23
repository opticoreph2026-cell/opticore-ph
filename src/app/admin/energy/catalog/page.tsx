import React from 'react';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { canAccessAdminEnergy } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';
import type { ProductInverter, ProductBattery, SolarPanel } from '@prisma/client';

export const runtime = 'nodejs';

export default async function AdminEnergyCatalog() {
  const user = await getCurrentUser();
  if (!user || !canAccessAdminEnergy(user)) {
    redirect('/crm');
  }

  const inverters = await db.productInverter.findMany({ orderBy: { modelName: 'asc' } });
  const batteries = await db.productBattery.findMany({ orderBy: { modelName: 'asc' } });
  const panels = await db.solarPanel.findMany({ orderBy: { modelName: 'asc' } });

  const products: (ProductInverter & { category: string; spec: string })[] = inverters.map((p: ProductInverter) => ({ ...p, category: 'inverter', spec: `${p.ratedAcKw}kW` }));
  const batteryItems: (ProductBattery & { category: string; spec: string })[] = batteries.map((p: ProductBattery) => ({ ...p, category: 'battery', spec: `${p.nominalKwh}kWh` }));
  const panelItems: (SolarPanel & { category: string; spec: string })[] = panels.map((p: SolarPanel) => ({ ...p, category: 'panel', spec: `${p.wattage}W · ${p.efficiencyPct}%` }));
  const allItems = [...products, ...batteryItems, ...panelItems];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Energy Catalog</h1>
          <p className="text-gray-400">Manage components: Inverters, Batteries, and Solar Panels.</p>
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
              <th className="px-6 py-4 font-medium">SKU</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Specs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-white/80">
            {allItems.map((p: any) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{p.modelName}</td>
                <td className="px-6 py-4 font-mono text-xs text-white/60">{p.sku}</td>
                <td className="px-6 py-4 uppercase text-xs tracking-wider text-accent-cyan">{p.category}</td>
                <td className="px-6 py-4 text-white/60 text-xs">{p.spec}</td>
              </tr>
            ))}
            {allItems.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-white/40">
                  No products in catalog.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
