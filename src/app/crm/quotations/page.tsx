import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessCrm } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, FileText, Search, Download } from 'lucide-react';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const statusColors: Record<string, string> = {
  draft: 'bg-white/5 text-white/40',
  sent: 'bg-accent-cyan/10 text-accent-cyan',
  accepted: 'bg-accent-emerald/10 text-accent-emerald',
  rejected: 'bg-accent-rose/10 text-accent-rose',
  expired: 'bg-gray-500/10 text-gray-400',
};

const statusLabel: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
};

export default async function QuotationsPage() {
  const session = await getSession();
  if (!session || !canAccessCrm(session as any)) {
    redirect('/login');
  }

  const quotations = await db.energyQuotation.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      quoteNumber: true,
      grandTotalCentavos: true,
      status: true,
      issueDate: true,
      validUntil: true,
      customer: { select: { fullName: true } },
      design: { select: { pvArrayKwp: true } },
    },
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white mb-1">Quotations</h1>
          <p className="text-sm text-white/40">Manage customer proposals and pricing.</p>
        </div>
        <Link
          href="/crm/designs"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-blue text-white text-sm font-semibold hover:bg-accent-blue/90 transition-colors shadow-lg shadow-accent-blue/20"
        >
          <PlusCircle className="w-4 h-4" />
          New Quotation
        </Link>
      </div>

      <div className="bg-[#0F0F14] border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center px-6 py-4 border-b border-white/5 gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-white/20 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search quotations..."
              className="w-full bg-[#16161D] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/50 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#16161D] text-xs uppercase text-white/30 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Quote #</th>
                <th className="px-6 py-4 font-medium tracking-wider">Customer</th>
                <th className="px-6 py-4 font-medium tracking-wider">System Size</th>
                <th className="px-6 py-4 font-medium tracking-wider">Total</th>
                <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                <th className="px-6 py-4 font-medium tracking-wider">Issue Date</th>
                <th className="px-6 py-4 font-medium tracking-wider">Valid Until</th>
                <th className="px-6 py-4 font-medium tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/70">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <FileText className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-sm text-white/30">No quotations created yet</p>
                    <Link
                      href="/crm/designs"
                      className="mt-4 inline-flex items-center gap-2 text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" /> Create a quotation from a design
                    </Link>
                  </td>
                </tr>
              ) : (
                quotations.map((q: any) => (
                  <tr key={q.id} className="hover:bg-white/3 transition-colors group">
                    <td className="px-6 py-4 font-medium text-white font-mono text-xs">
                      <Link href={`/crm/quotations/${q.id}`} className="hover:text-accent-blue transition-colors">
                        {q.quoteNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/crm/quotations/${q.id}`} className="text-white hover:text-accent-blue transition-colors">
                        {q.customer?.fullName || 'Unknown'}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{q.design?.pvArrayKwp ? `${q.design.pvArrayKwp} kWp` : '—'}</td>
                    <td className="px-6 py-4 text-white font-medium">
                      ₱{(q.grandTotalCentavos / 100).toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide ${
                          statusColors[q.status] ?? 'bg-white/5 text-white/40'
                        }`}
                      >
                        {statusLabel[q.status] ?? q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/40">
                      {new Date(q.issueDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-white/40">
                      {new Date(q.validUntil).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`/api/energy/quotations/${q.id}/pdf`}
                        download
                        className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-accent-blue transition-colors opacity-0 group-hover:opacity-100"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>
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
