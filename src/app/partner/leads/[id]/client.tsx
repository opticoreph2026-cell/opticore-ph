'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Mail, MapPin, Zap, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { formatPHP } from '@/lib/money';

interface Lead {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  addressLine: string | null;
  city: string | null;
  province: string | null;
  customerType: string;
  monthlyBill: number;
  status: string;
  source: string;
  notes: string | null;
  createdAt: string;
  utilityCompany: { name: string; code: string } | null;
  assignedOrg: { id: string; name: string } | null;
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

export function PartnerLeadDetailClient({ lead, userId }: { lead: Lead; userId?: string }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await fetch(`/api/energy/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedUserId: userId, status: 'contacted' }),
      });
      if (!res.ok) throw new Error('Failed to claim lead');
      success('Lead claimed. Update the status as you progress.');
      router.refresh();
    } catch (err) {
      error(err instanceof Error ? err.message : 'Claim failed');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <button
        onClick={() => router.push('/partner/leads')}
        className="flex items-center gap-2 text-sm text-foreground-950/50 hover:text-foreground-950 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Leads
      </button>

      <div className="bg-background-200 border border-foreground-950/10 rounded-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground-950">{lead.fullName}</h1>
              <p className="text-sm text-foreground-950/50 mt-1 capitalize">{lead.customerType.replace(/_/g, ' ')} prospect</p>
            </div>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[lead.status] ?? 'bg-foreground-950/5 text-foreground-950/40'}`}>
              {lead.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-display font-semibold text-foreground-950/60 uppercase tracking-wider">Contact</h3>
              {lead.email && (
                <div className="flex items-center gap-3 text-sm text-foreground-950/70">
                  <Mail className="w-4 h-4 text-accent-cyan" />
                  {lead.email}
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-3 text-sm text-foreground-950/70">
                  <Phone className="w-4 h-4 text-accent-emerald" />
                  {lead.phone}
                </div>
              )}
              {lead.addressLine && (
                <div className="flex items-start gap-3 text-sm text-foreground-950/70">
                  <MapPin className="w-4 h-4 text-accent-cyan mt-0.5" />
                  <span>{[lead.addressLine, lead.city, lead.province].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-display font-semibold text-foreground-950/60 uppercase tracking-wider">Details</h3>
              <div className="flex items-center gap-3 text-sm text-foreground-950/70">
                <Zap className="w-4 h-4 text-accent-rose" />
                Est. bill: {formatPHP(lead.monthlyBill)}/mo
              </div>
              {lead.utilityCompany && (
                <div className="flex items-center gap-3 text-sm text-foreground-950/70">
                  <Zap className="w-4 h-4 text-accent-cyan" />
                  {lead.utilityCompany.name} ({lead.utilityCompany.code})
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-foreground-950/70">
                <Calendar className="w-4 h-4 text-foreground-950/40" />
                {new Date(lead.createdAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          {lead.notes && (
            <div className="mt-6 pt-6 border-t border-foreground-950/10">
              <h3 className="text-sm font-display font-semibold text-foreground-950/60 uppercase tracking-wider mb-2">Notes</h3>
              <p className="text-sm text-foreground-950/70">{lead.notes}</p>
            </div>
          )}

          {lead.assignedOrg && (
            <div className="mt-6 pt-6 border-t border-foreground-950/10">
              <h3 className="text-sm font-display font-semibold text-foreground-950/60 uppercase tracking-wider mb-2">Assigned Partner</h3>
              <p className="text-sm text-foreground-950/70">{lead.assignedOrg.name}</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-foreground-950/10 flex gap-3">
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="px-6 py-2.5 bg-primary-500 text-background-50 font-semibold rounded-lg hover:bg-primary-600 shadow-lg shadow-primary-500/20 disabled:opacity-50 transition-colors text-sm"
            >
              {claiming ? 'Claiming...' : 'Claim & Start Contacting'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
