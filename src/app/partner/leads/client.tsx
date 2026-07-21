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

export function PartnerLeadsClient({ leads }: { leads: Lead[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground-950 mb-1">Assigned Leads</h1>
        <p className="text-sm text-foreground-950/40">Solar leads assigned to your organization.</p>
      </div>

      <div className="bg-background-800 border border-foreground-950/10 rounded-xl overflow-hidden">
        {leads.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-8 h-8 text-foreground-950/60 mx-auto mb-3" />
            <p className="text-foreground-950/40 font-medium">No leads assigned yet</p>
            <p className="text-xs text-foreground-950/60 mt-1">Leads assigned by OptiCore will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-foreground-950/10">
            {leads.map((lead) => (
              <Link
                key={lead.id}
                href={`/partner/leads/${lead.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-foreground-950/5 transition-colors"
              >
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                  <div className="md:col-span-2">
                    <p className="font-medium text-foreground-950">{lead.fullName}</p>
                    <p className="text-xs text-foreground-950/50 capitalize">{lead.customerType.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="text-sm text-foreground-950/40">{lead.email || '—'}</div>
                  <div className="text-sm text-foreground-950/40">{[lead.city, lead.province].filter(Boolean).join(', ') || '—'}</div>
                  <div>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[lead.status] ?? 'bg-foreground-950/5 text-foreground-950/40'}`}>
                      {lead.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-foreground-950/50">
                    {new Date(lead.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-foreground-950/60 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
