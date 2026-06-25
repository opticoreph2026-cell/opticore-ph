'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Users } from 'lucide-react';

interface Lead {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  province: string | null;
  customerType: string;
  monthlyBill: number;
  status: string;
  source: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-accent-cyan/10 text-accent-cyan',
  contacted: 'bg-accent-cyan/10 text-accent-cyan',
  site_visit_scheduled: 'bg-purple-500/10 text-purple-400',
  site_visit_done: 'bg-purple-500/25 text-purple-300',
  qualified: 'bg-accent-emerald/10 text-accent-emerald',
  quote_sent: 'bg-blue-500/15 text-blue-400',
  negotiating: 'bg-amber-500/15 text-amber-400',
  won: 'bg-accent-emerald/20 text-accent-emerald font-semibold',
  lost: 'bg-accent-rose/15 text-accent-rose',
  disqualified: 'bg-accent-rose/10 text-accent-rose',
  converted: 'bg-green-500/10 text-green-400',
};

export function PartnerLeadsClient({ leads }: { leads: Lead[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Assigned Leads</h1>
        <p className="text-sm text-gray-400">Solar leads assigned to your organization.</p>
      </div>

      <div className="bg-[#16161D] border border-white/5 rounded-xl overflow-hidden">
        {leads.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No leads assigned yet</p>
            <p className="text-xs text-gray-600 mt-1">Leads assigned by OptiCore will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {leads.map((lead) => (
              <Link
                key={lead.id}
                href={`/partner/leads/${lead.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                  <div className="md:col-span-2">
                    <p className="font-medium text-white">{lead.fullName}</p>
                    <p className="text-xs text-gray-500 capitalize">{lead.customerType.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="text-sm text-gray-400">{lead.email || '—'}</div>
                  <div className="text-sm text-gray-400">{[lead.city, lead.province].filter(Boolean).join(', ') || '—'}</div>
                  <div>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[lead.status] ?? 'bg-white/5 text-gray-400'}`}>
                      {lead.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
