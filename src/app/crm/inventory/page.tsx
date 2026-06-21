import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const runtime = 'nodejs';

export default async function InventoryPage() {
  const session = await getSession();
  const role = session?.role as string;
  if (role !== 'opticore_owner') {
    redirect('/crm');
  }

  const inventory = await db.inventoryItem.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Inventory Management</h1>
          <p className="text-sm text-gray-400">Track stock levels and unit costs.</p>
        </div>
        <button className="px-4 py-2 bg-[#F5A524] text-[#08080B] font-medium rounded-lg hover:bg-[#e0961f] transition-colors text-sm">
          Add Item
        </button>
      </div>

      <div className="bg-[#16161D] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/5 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Model</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Unit Cost</th>
                <th className="px-6 py-4 font-medium">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                inventory.map((item: any) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-medium text-white">{item.modelId}</td>
                    <td className="px-6 py-4 capitalize">{item.category.replace('_', ' ')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.quantityOnHand > 0 ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-red-500/10 text-red-500'}`}>
                        {item.quantityOnHand} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4">₱{(item.costCentavos / 100).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(item.updatedAt).toLocaleDateString()}
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
