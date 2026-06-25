import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessAdminEnergy } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';
import { PackageAdminClient } from './client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminPackagesPage() {
  const session = await getSession();
  if (!session || !canAccessAdminEnergy(session as any)) redirect('/crm');

  const [packages, inverters, batteries, panels] = await Promise.all([
    db.packageBundle.findMany({ orderBy: { createdAt: 'desc' } }),
    db.productInverter.findMany({ select: { id: true, modelName: true, sku: true }, where: { active: true } }),
    db.productBattery.findMany({ select: { id: true, modelName: true, sku: true }, where: { active: true } }),
    db.solarPanel.findMany({ select: { id: true, modelName: true, sku: true, wattage: true }, where: { active: true } }),
  ]);

  return (
    <PackageAdminClient
      packages={JSON.parse(JSON.stringify(packages))}
      inverters={JSON.parse(JSON.stringify(inverters))}
      batteries={JSON.parse(JSON.stringify(batteries))}
      panels={JSON.parse(JSON.stringify(panels))}
    />
  );
}
