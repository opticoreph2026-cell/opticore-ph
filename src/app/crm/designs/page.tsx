import React from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';

export const runtime = 'nodejs';

export default async function DesignsPage() {
  const designs = await db.systemDesign.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      pvArrayKwp: true,
      pvPanelCount: true,
      totalUsableStorageKwh: true,
      designPathway: true,
      status: true,
      createdAt: true,
      site: {
        select: {
          customer: {
            select: { fullName: true },
          },
        },
      },
      inverter: {
        select: { modelName: true },
      },
    },
  });

  const statusColors: Record<string, string> = {
    draft: 'bg-white/5 text-gray-400',
    finalized: 'bg-accent-cyan/10 text-accent-cyan',
    approved_by_customer: 'bg-accent-emerald/10 text-accent-emerald',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Sizing &amp; ROI Designs</h1>
          <p className="text-sm text-gray-400">Manage engineered solar + ESS system designs.</p>
        </div>
        <Link
          href="/crm/designs/new"
          className="px-4 py-2 bg-[#F5A524] text-[#08080B] font-medium rounded-lg hover:bg-[#e0961f] transition-colors text-sm"
        >
          New Design
        </Link>
      </div>

      <div className="bg-[#16161D] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/5 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">PV Array</th>
                <th className="px-6 py-4 font-medium">Storage</th>
                <th className="px-6 py-4 font-medium">Inverter</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {designs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No designs yet. Create your first design to get started.
                  </td>
                </tr>
              ) : (
                designs.map((design: any) => (
                  <tr key={design.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-medium text-white">
                      {design.site?.customer?.fullName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">{design.pvArrayKwp} kWp ({design.pvPanelCount} panels)</td>
                    <td className="px-6 py-4">{design.totalUsableStorageKwh} kWh</td>
                    <td className="px-6 py-4 text-gray-400">{design.inverter?.modelName || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[design.status] ?? 'bg-white/5 text-gray-400'}`}>
                        {design.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(design.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/crm/roi/${design.id}`}
                        className="text-accent-amber hover:text-accent-amber/80 text-xs font-medium"
                      >
                        View ROI →
                      </Link>
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
