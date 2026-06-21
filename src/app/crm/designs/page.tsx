import React from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import { PlusCircle, Search, FileText, ChevronRight, Calculator } from 'lucide-react';

export const runtime = 'nodejs';

export default async function DesignsPage() {
  const designs = await db.systemDesign.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      pvArrayKwp: true,
      pvPanelCount: true,
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
      battery: {
        select: { usableKwh: true, modelName: true },
      },
    },
  });

  const statusColors: Record<string, string> = {
    draft: 'bg-white/5 text-white/40',
    finalized: 'bg-[#06B6D4]/15 text-[#06B6D4]',
    approved_by_customer: 'bg-[#10B981]/15 text-[#10B981]',
  };

  const statusLabel: Record<string, string> = {
    draft: 'Draft',
    finalized: 'Finalized',
    approved_by_customer: 'Approved',
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white mb-1">
            Sizing & ROI Designs
          </h1>
          <p className="text-sm text-white/40">
            Manage engineered solar + ESS system designs and financial models.
          </p>
        </div>
        <Link
          href="/crm/designs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F5A524] text-[#08080B] text-sm font-semibold hover:bg-[#F5A524]/90 transition-colors shadow-lg shadow-[#F5A524]/20"
        >
          <PlusCircle className="w-4 h-4" />
          New Design
        </Link>
      </div>

      <div className="bg-[#0F0F14] border border-white/5 rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center px-6 py-4 border-b border-white/5 gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-white/20 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search designs or customers..."
              className="w-full bg-[#16161D] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F5A524]/50 focus:ring-1 focus:ring-[#F5A524]/50 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#16161D] text-xs uppercase text-white/30 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Customer</th>
                <th className="px-6 py-4 font-medium tracking-wider">System Size</th>
                <th className="px-6 py-4 font-medium tracking-wider">Components</th>
                <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                <th className="px-6 py-4 font-medium tracking-wider">Date</th>
                <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/70">
              {designs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Calculator className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-sm text-white/30">No designs created yet</p>
                    <Link
                      href="/crm/designs/new"
                      className="mt-4 inline-flex items-center gap-2 text-sm text-[#F5A524] hover:text-[#F5A524]/80 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" /> Start a new design
                    </Link>
                  </td>
                </tr>
              ) : (
                designs.map((design: any) => (
                  <tr key={design.id} className="hover:bg-white/3 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#F5A524]/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-[#F5A524]" />
                        </div>
                        <div>
                          <p className="font-medium text-white group-hover:text-[#F5A524] transition-colors">
                            {design.site?.customer?.fullName || 'Unknown Customer'}
                          </p>
                          <p className="text-xs text-white/30">
                            {design.designPathway.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{design.pvArrayKwp} kWp</p>
                      <p className="text-xs text-white/30">{design.pvPanelCount} Panels</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white/80">{design.inverter?.modelName || '—'}</p>
                      <p className="text-xs text-[#06B6D4]">
                        {design.battery ? `${design.battery.usableKwh} kWh Storage` : 'No Storage'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide ${
                          statusColors[design.status] ?? 'bg-white/5 text-white/40'
                        }`}
                      >
                        {statusLabel[design.status] ?? design.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/40">
                      {new Date(design.createdAt).toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/crm/roi/${design.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-all"
                      >
                        View ROI
                        <ChevronRight className="w-3.5 h-3.5" />
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
