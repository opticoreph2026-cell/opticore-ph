import React from 'react';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { canAccessAdminEnergy } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';
import type { ProductInverter, ProductBattery, SolarPanel } from '@prisma/client';
import { CatalogTable } from '@/components/admin/CatalogTable';

export const runtime = 'nodejs';

export default async function AdminEnergyCatalog() {
  const user = await getCurrentUser();
  if (!user || !canAccessAdminEnergy(user)) {
    redirect('/crm');
  }

  const inverters = await db.productInverter.findMany({ orderBy: { modelName: 'asc' } });
  const batteries = await db.productBattery.findMany({ orderBy: { modelName: 'asc' } });
  const panels = await db.solarPanel.findMany({ orderBy: { modelName: 'asc' } });

  const products = [
    ...inverters.map((p: ProductInverter) => ({ ...p, _category: 'inverter' as const, _spec: `${p.ratedAcKw}kW` })),
    ...batteries.map((p: ProductBattery) => ({ ...p, _category: 'battery' as const, _spec: `${p.nominalKwh}kWh` })),
    ...panels.map((p: SolarPanel) => ({ ...p, _category: 'panel' as const, _spec: `${p.wattage}W \u00B7 ${p.efficiencyPct}%` })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground-950 mb-2">Energy Catalog</h1>
          <p className="text-foreground-400">Manage components: Inverters, Batteries, and Solar Panels.</p>
        </div>
      </div>

      <CatalogTable initialProducts={products} />
    </div>
  );
}
