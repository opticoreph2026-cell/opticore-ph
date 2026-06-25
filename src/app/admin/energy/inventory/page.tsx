import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessAdminEnergy } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';
import { InventoryAdminClient } from './client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage() {
  const session = await getSession();
  if (!session || !canAccessAdminEnergy(session as any)) redirect('/crm');

  const [inventory, inverters, batteries] = await Promise.all([
    db.inventoryUnit.findMany({
      orderBy: { receivedDate: 'desc' },
      include: {
        inverter: { select: { id: true, modelName: true, sku: true } },
        battery: { select: { id: true, modelName: true, sku: true } },
      },
    }),
    db.productInverter.findMany({ select: { id: true, modelName: true, sku: true }, where: { active: true } }),
    db.productBattery.findMany({ select: { id: true, modelName: true, sku: true }, where: { active: true } }),
  ]);

  return (
    <InventoryAdminClient
      inventory={JSON.parse(JSON.stringify(inventory))}
      inverters={JSON.parse(JSON.stringify(inverters))}
      batteries={JSON.parse(JSON.stringify(batteries))}
    />
  );
}
