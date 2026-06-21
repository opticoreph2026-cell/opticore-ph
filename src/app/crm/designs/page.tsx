import React from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';

export const runtime = 'nodejs';

export default async function DesignsPage() {
  const designs = await db.systemDesign.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      lead: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Sizing & ROI Designs</h1>
          <p className="text-sm text-gray-400">Manage engineered solar + ESS system designs.</p>
        </div>
        <Link href="/crm/designs/new" className="px-4 py-2 bg-[#F5A524] text-[#08080B] font-medium rounded-lg hover:bg-[#e0961f] transition-colors text-sm">
          New Design
        </Link>
      </div>

      <div className="bg-[#16161D] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/5 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Inverter</th>
                <th className="px-6 py-4 font-medium">Battery Cap.</th>
                <th className="px-6 py-4 font-medium">Total Cost</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {designs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No designs found.
                  </td>
                </tr>
              ) : (
                designs.map((design: any) => (
                  <tr key={design.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-medium text-white">{design.lead?.name || 'Unknown'}</td>
                    <td className="px-6 py-4">{design.inverterModel}</td>
                    <td className="px-6 py-4">{design.batteryCapacityKwh} kWh</td>
                    <td className="px-6 py-4">₱{(design.totalSystemCostCentavos / 100).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(design.createdAt).toLocaleDateString()}
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
