import React from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import { PlusCircle, Search, FileText, ChevronRight, Calculator } from 'lucide-react';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    draft: 'bg-foreground-950/5 text-foreground-950/40',
    finalized: 'bg-accent-cyan/15 text-accent-cyan',
    approved_by_customer: 'bg-accent-emerald/15 text-accent-emerald',
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
          <h1 className="text-2xl font-display font-bold text-foreground-950 mb-1">
            Sizing & ROI Designs
          </h1>
          <p className="text-sm text-foreground-950/40">
            Manage engineered solar + ESS system designs and financial models.
          </p>
        </div>
        <Link
          href="/crm/designs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-500 text-background-50 text-sm font-semibold hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          New Design
        </Link>
      </div>

      <div className="bg-background-100 border border-foreground-950/10 rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center px-6 py-4 border-b border-foreground-950/10 gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-foreground-950/20 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search designs or customers..."
              className="w-full bg-background-100/40 border border-foreground-950/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background-200 text-xs uppercase text-foreground-950/30 border-b border-foreground-950/10">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Customer</th>
                <th className="px-6 py-4 font-medium tracking-wider">System Size</th>
                <th className="px-6 py-4 font-medium tracking-wider">Components</th>
                <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                <th className="px-6 py-4 font-medium tracking-wider">Date</th>
                <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground-950/10 text-foreground-950/70">
              {designs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Calculator className="w-10 h-10 text-foreground-950/10 mx-auto mb-3" />
                    <p className="text-sm text-foreground-950/30">No designs created yet</p>
                    <Link
                      href="/crm/designs/new"
                      className="mt-4 inline-flex items-center gap-2 text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" /> Start a new design
                    </Link>
                  </td>
                </tr>
              ) : (
                designs.map((design: any) => (
                  <tr key={design.id} className="hover:bg-foreground-950/3 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-accent-cyan" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground-950 group-hover:text-accent-cyan transition-colors">
                            {design.site?.customer?.fullName || 'Unknown Customer'}
                          </p>
                          <p className="text-xs text-foreground-950/30">
                            {design.designPathway.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-foreground-950 font-medium">{design.pvArrayKwp} kWp</p>
                      <p className="text-xs text-foreground-950/30">{design.pvPanelCount} Panels</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-foreground-950/80">{design.inverter?.modelName || '—'}</p>
                      <p className="text-xs text-accent-cyan">
                        {design.battery ? `${design.battery.usableKwh} kWh Storage` : 'No Storage'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide ${
                          statusColors[design.status] ?? 'bg-foreground-950/5 text-foreground-950/40'
                        }`}
                      >
                        {statusLabel[design.status] ?? design.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground-950/40">
                      {new Date(design.createdAt).toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/crm/roi/${design.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground-950/5 hover:bg-foreground-950/10 text-foreground-950/70 hover:text-foreground-950 text-xs font-medium transition-all"
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
