import React from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const leads = await db.energyLead.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      city: true,
      customerType: true,
      monthlyBill: true,
      status: true,
      source: true,
      createdAt: true,
    },
  });

  const statusColors: Record<string, string> = {
    new: 'bg-accent-cyan/10 text-accent-cyan',
    contacted: 'bg-accent-cyan/10 text-accent-cyan',
    site_visit_scheduled: 'bg-accent-cyan/10 text-accent-cyan',
    site_visit_done: 'bg-accent-cyan/25 text-accent-cyan/80',
    qualified: 'bg-accent-emerald/10 text-accent-emerald',
    quote_sent: 'bg-accent-blue/15 text-accent-blue',
    negotiating: 'bg-accent-amber/15 text-accent-amber',
    won: 'bg-accent-emerald/20 text-accent-emerald font-semibold',
    lost: 'bg-accent-rose/15 text-accent-rose',
    disqualified: 'bg-accent-rose/10 text-accent-rose',
    converted: 'bg-green-500/10 text-green-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground-950 mb-1">Leads &amp; Prospects</h1>
          <p className="text-sm text-foreground-950/40">Manage incoming solar inquiries and pipeline.</p>
        </div>
        <Link
          href="/crm/leads/new"
          className="px-4 py-2 bg-primary-500 text-background-50 font-semibold rounded-lg hover:bg-primary-600 shadow-lg shadow-primary-500/20 transition-colors text-sm"
        >
          + Add Lead
        </Link>
      </div>

      <div className="bg-background-200 border border-foreground-950/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground-950/70">
            <thead className="bg-foreground-950/5 text-xs uppercase text-foreground-950/40">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Est. Bill</th>
                <th className="px-6 py-4 font-medium">Source</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground-950/10">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-foreground-950/50">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-10 h-10 text-foreground-950/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="font-medium text-foreground-950/40">No leads found</p>
                      <p className="text-xs text-foreground-950/60">Add your first solar prospect to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead: any) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-foreground-950/5 transition-colors cursor-pointer"
                  >
                    <td colSpan={8} className="p-0">
                      <Link href={`/crm/leads/${lead.id}`} className="contents">
                        <div className="flex items-center px-6 py-4">
                          <div className="flex-1 min-w-0 grid grid-cols-7 gap-4 items-center">
                            <div className="font-medium text-foreground-950">
                              <div>{lead.fullName}</div>
                              <div className="text-xs text-foreground-950/50 capitalize">{lead.customerType.replace(/_/g, ' ')}</div>
                            </div>
                            <div>
                              <div>{lead.email || '—'}</div>
                              <div className="text-xs text-foreground-950/50">{lead.phone || '—'}</div>
                            </div>
                            <div className="text-foreground-950/40">{lead.city || '—'}</div>
                            <div>₱{Number(lead.monthlyBill).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                            <div className="text-foreground-950/40 capitalize">{lead.source.replace(/_/g, ' ')}</div>
                            <div>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[lead.status] ?? 'bg-foreground-950/5 text-foreground-950/40'}`}>
                                {lead.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div className="text-foreground-950/50">
                              {new Date(lead.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                            <ChevronRight className="w-4 h-4 text-foreground-950/60 ml-2 flex-shrink-0" />
                        </div>
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
