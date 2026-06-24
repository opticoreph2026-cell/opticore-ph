import React from 'react';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { canAccessAdminEnergy } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';
import type { ProductInverter, ProductBattery, SolarPanel } from '@prisma/client';
import { InlinePriceEdit } from '@/components/admin/InlinePriceEdit';

export const runtime = 'nodejs';

export default async function AdminEnergyCatalog() {
  const user = await getCurrentUser();
  if (!user || !canAccessAdminEnergy(user)) {
    redirect('/crm');
  }

  const inverters = await db.productInverter.findMany({ orderBy: { modelName: 'asc' } });
  const batteries = await db.productBattery.findMany({ orderBy: { modelName: 'asc' } });
  const panels = await db.solarPanel.findMany({ orderBy: { modelName: 'asc' } });

  type ProductItem = (ProductInverter | ProductBattery | SolarPanel) & { _category: string; _spec: string };
  const products: ProductItem[] = [
    ...inverters.map((p: ProductInverter) => ({ ...p, _category: 'inverter', _spec: `${p.ratedAcKw}kW` })),
    ...batteries.map((p: ProductBattery) => ({ ...p, _category: 'battery', _spec: `${p.nominalKwh}kWh` })),
    ...panels.map((p: SolarPanel) => ({ ...p, _category: 'panel', _spec: `${p.wattage}W \u00B7 ${p.efficiencyPct}%` })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Energy Catalog</h1>
          <p className="text-gray-400">Manage components: Inverters, Batteries, and Solar Panels.</p>
        </div>
      </div>

      <div className="bg-surface-800 border border-border-subtle rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-900 border-b border-border-subtle text-white/60">
            <tr>
              <th className="px-6 py-4 font-medium">Model</th>
              <th className="px-6 py-4 font-medium">SKU</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Specs</th>
              <th className="px-6 py-4 font-medium">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-white/80">
            {products.map((p: any) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{p.modelName}</td>
                <td className="px-6 py-4 font-mono text-xs text-white/60">{p.sku}</td>
                <td className="px-6 py-4 uppercase text-xs tracking-wider text-accent-cyan">{p._category}</td>
                <td className="px-6 py-4 text-white/60 text-xs">{p._spec}</td>
                <td className="px-6 py-4">
                  <InlinePriceEdit
                    id={p.id}
                    category={p._category}
                    currentPriceCentavos={p.unitPriceCentavos}
                    isConfirmed={p.isPriceConfirmed}
                    apiPath={`/api/admin/products/${p.id}`}
                  />
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-white/40">
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
