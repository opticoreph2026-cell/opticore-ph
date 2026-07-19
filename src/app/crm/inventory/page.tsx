import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessAdminEnergy } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';
import type { InventoryUnit } from '@prisma/client';
import { AddUnitDialog } from '@/components/crm/AddUnitDialog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const session = await getSession();
  if (!session || !canAccessAdminEnergy(session)) {
    redirect('/crm');
  }

  const inventory = (await db.inventoryUnit.findMany({
    orderBy: { receivedDate: 'desc' },
    include: {
      inverter: { select: { modelName: true, sku: true } },
      battery: { select: { modelName: true, sku: true } },
    },
  })) as (InventoryUnit & {
    inverter: { modelName: string; sku: string } | null;
    battery: { modelName: string; sku: string } | null;
  })[];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Inventory Management</h1>
          <p className="text-sm text-gray-400">Track consigned and owned hardware units by serial number.</p>
        </div>
        <AddUnitDialog />
      </div>

      <div className="bg-[#16161D] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/5 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Serial / Model</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Remit Status</th>
                <th className="px-6 py-4 font-medium">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No inventory units found.
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{item.serialNumber}</div>
                      <div className="text-xs text-gray-500">
                        {item.inverter?.modelName || item.battery?.modelName || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {item.inverterId ? 'Inverter' : item.batteryId ? 'Battery' : 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        item.ownershipStatus === 'sold_installed'
                          ? 'bg-accent-emerald/10 text-accent-emerald'
                          : item.ownershipStatus === 'reserved'
                          ? 'bg-accent-cyan/10 text-accent-cyan'
                          : 'bg-white/5 text-gray-400'
                      }`}>
                        {item.ownershipStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {item.consignmentRemitStatus.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.receivedDate.toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
