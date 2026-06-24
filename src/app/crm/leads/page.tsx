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
      monthlyBillPhp: true,
      status: true,
      source: true,
      createdAt: true,
    },
  });

  const statusColors: Record<string, string> = {
    new: 'bg-accent-cyan/10 text-accent-cyan',
    contacted: 'bg-accent-cyan/10 text-accent-cyan',
    site_visit_scheduled: 'bg-purple-500/10 text-purple-400',
    qualified: 'bg-accent-emerald/10 text-accent-emerald',
    disqualified: 'bg-accent-rose/10 text-accent-rose',
    converted: 'bg-green-500/10 text-green-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Leads &amp; Prospects</h1>
          <p className="text-sm text-gray-400">Manage incoming solar inquiries and pipeline.</p>
        </div>
        <Link
          href="/crm/leads/new"
          className="px-4 py-2 bg-accent-blue text-white font-medium rounded-lg hover:bg-accent-blue/90 transition-colors text-sm"
        >
          + Add Lead
        </Link>
      </div>

      <div className="bg-[#16161D] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/5 text-xs uppercase text-gray-400">
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
            <tbody className="divide-y divide-white/5">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="font-medium text-gray-400">No leads found</p>
                      <p className="text-xs text-gray-600">Add your first solar prospect to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead: any) => (
                  <tr
                    key={lead.id}
                    onClick={() => window.location.href = `/crm/leads/${lead.id}`}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      <div>{lead.fullName}</div>
                      <div className="text-xs text-gray-500 capitalize">{lead.customerType.replace(/_/g, ' ')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{lead.email || '—'}</div>
                      <div className="text-xs text-gray-500">{lead.phone || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{lead.city || '—'}</td>
                    <td className="px-6 py-4">₱{(lead.monthlyBillPhp / 100).toLocaleString('en-PH', { minimumFractionDigits: 0 })}</td>
                    <td className="px-6 py-4 text-gray-400 capitalize">{lead.source.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[lead.status] ?? 'bg-white/5 text-gray-400'}`}>
                        {lead.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
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
