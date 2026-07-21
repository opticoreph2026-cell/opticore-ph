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
  draft: 'bg-foreground-950/5 text-foreground-950/40',
  sent: 'bg-accent-cyan/10 text-accent-cyan',
  accepted: 'bg-accent-emerald/10 text-accent-emerald',
  rejected: 'bg-accent-rose/10 text-accent-rose',
  expired: 'bg-gray-500/10 text-foreground-950/40',
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
      grandTotal: true,
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
          <h1 className="text-2xl font-display font-bold text-foreground-950 mb-1">Quotations</h1>
          <p className="text-sm text-foreground-950/40">Manage customer proposals and pricing.</p>
        </div>
        <Link
          href="/crm/designs"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-500 text-background-50 text-sm font-semibold hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          New Quotation
        </Link>
      </div>

      <div className="bg-background-100 border border-foreground-950/10 rounded-2xl overflow-hidden">
        <div className="flex items-center px-6 py-4 border-b border-foreground-950/10 gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-foreground-950/20 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search quotations..."
              className="w-full bg-background-100/40 border border-foreground-950/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background-200 text-xs uppercase text-foreground-950/30 border-b border-foreground-950/10">
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
            <tbody className="divide-y divide-foreground-950/10 text-foreground-950/70">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <FileText className="w-10 h-10 text-foreground-950/10 mx-auto mb-3" />
                    <p className="text-sm text-foreground-950/30">No quotations created yet</p>
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
                  <tr key={q.id} className="hover:bg-foreground-950/3 transition-colors group">
                    <td className="px-6 py-4 font-medium text-foreground-950 font-mono text-xs">
                      <Link href={`/crm/quotations/${q.id}`} className="hover:text-accent-blue transition-colors">
                        {q.quoteNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/crm/quotations/${q.id}`} className="text-foreground-950 hover:text-accent-blue transition-colors">
                        {q.customer?.fullName || 'Unknown'}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{q.design?.pvArrayKwp ? `${q.design.pvArrayKwp} kWp` : '—'}</td>
                    <td className="px-6 py-4 text-foreground-950 font-medium">
                      ₱{Number(q.grandTotal).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide ${
                          statusColors[q.status] ?? 'bg-foreground-950/5 text-foreground-950/40'
                        }`}
                      >
                        {statusLabel[q.status] ?? q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground-950/50">
                      {new Date(q.issueDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-foreground-950/50">
                      {new Date(q.validUntil).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`/api/energy/quotations/${q.id}/pdf`}
                        download
                        className="p-2 rounded-lg hover:bg-foreground-950/5 text-foreground-950/30 hover:text-accent-blue transition-colors opacity-0 group-hover:opacity-100"
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
