'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, MapPin, Building, Activity, Users, FileText, ChevronDown, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'text-accent-cyan' },
  { value: 'contacted', label: 'Contacted', color: 'text-accent-cyan' },
  { value: 'site_visit_scheduled', label: 'Site Visit Scheduled', color: 'text-purple-400' },
  { value: 'site_visit_done', label: 'Site Visit Done', color: 'text-purple-300' },
  { value: 'qualified', label: 'Qualified', color: 'text-accent-emerald' },
  { value: 'quote_sent', label: 'Quote Sent', color: 'text-blue-400' },
  { value: 'negotiating', label: 'Negotiating', color: 'text-amber-400' },
  { value: 'won', label: 'Won', color: 'text-accent-emerald' },
  { value: 'lost', label: 'Lost', color: 'text-accent-rose' },
  { value: 'disqualified', label: 'Disqualified', color: 'text-accent-rose' },
  { value: 'converted', label: 'Converted', color: 'text-green-400' },
];

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

const LEAD_STATUS_TRANSITIONS: Record<string, string[]> = {
  new: ['contacted', 'disqualified'],
  contacted: ['site_visit_scheduled', 'disqualified'],
  site_visit_scheduled: ['site_visit_done', 'disqualified'],
  site_visit_done: ['qualified', 'disqualified'],
  qualified: ['quote_sent', 'disqualified'],
  quote_sent: ['negotiating', 'won', 'lost', 'disqualified'],
  negotiating: ['won', 'lost', 'disqualified'],
  won: [],
  lost: [],
  disqualified: [],
  converted: [],
};

const ACTION_LABELS: Record<string, string> = {
  created: 'Lead created',
  status_changed: 'Status changed',
  assigned: 'Assignment changed',
  note_added: 'Note added',
  converted: 'Converted to customer',
};

interface LeadData {
  id: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  addressLine?: string | null;
  barangay?: string | null;
  city?: string | null;
  province?: string | null;
  customerType: string;
  monthlyBill: number;
  status: string;
  source: string;
  notes?: string | null;
  assignedOrgId?: string | null;
  assignedOrg?: { id: string; name: string } | null;
  utilityCompany?: { id: string; name: string; code: string } | null;
  customers: Array<{ id: string; fullName: string; contactPhone?: string | null; contactEmail?: string | null; customerType: string; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
}

interface ActivityData {
  id: string;
  action: string;
  description: string;
  actorId?: string | null;
  createdAt: string;
}

interface OrgData {
  id: string;
  name: string;
}

export default function LeadDetailClient({
  lead: initialLead,
  activities: initialActivities,
  organizations,
  currentUserId,
}: {
  lead: LeadData;
  activities: ActivityData[];
  organizations: OrgData[];
  currentUserId: string | null;
}) {
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [lead, setLead] = useState(initialLead);
  const [activities, setActivities] = useState(initialActivities);
  const [tab, setTab] = useState<'overview' | 'activity' | 'customers'>('overview');
  const [saving, setSaving] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === lead.status) return;
    setSaving('status');
    try {
      const res = await fetch(`/api/energy/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const json = await res.json();
      setLead((prev) => ({ ...prev, status: json.data.status }));
      showSuccess(`Status updated to "${json.data.status.replace(/_/g, ' ')}"`);
      refreshActivity();
    } catch (err) {
      showError('Failed to update status');
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const handleAssignOrg = async (orgId: string) => {
    setSaving('org');
    try {
      const res = await fetch(`/api/energy/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedOrgId: orgId || null }),
      });
      if (!res.ok) throw new Error('Failed to assign');
      const json = await res.json();
      setLead((prev) => ({ ...prev, assignedOrgId: json.data.assignedOrgId }));
      showSuccess(orgId ? 'Lead assigned to organization' : 'Lead unassigned');
      refreshActivity();
    } catch (err) {
      showError('Failed to assign organization');
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/energy/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: noteInput.trim() }),
      });
      if (!res.ok) throw new Error('Failed to save note');
      const json = await res.json();
      setLead((prev) => ({ ...prev, notes: json.data.notes }));
      setNoteInput('');
      showSuccess('Note added');
      refreshActivity();
    } catch (err) {
      showError('Failed to save note');
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  const refreshActivity = async () => {
    try {
      const res = await fetch(`/api/energy/leads/${lead.id}/activity`);
      const json = await res.json();
      if (json.data) setActivities(json.data);
    } catch {
      // silent
    }
  };

  const formatMoney = (v: number) =>
    `₱${Number(v).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: FileText },
    { key: 'activity' as const, label: 'Activity', icon: Activity },
    { key: 'customers' as const, label: 'Customers', icon: Users },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/crm/leads"
            className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{lead.fullName}</h1>
            <p className="text-sm text-gray-400 capitalize">{lead.customerType.replace(/_/g, ' ')} Prospect</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[lead.status] ?? 'bg-white/5 text-gray-400'}`}>
          {lead.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Quick Info Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {lead.email && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Mail className="w-4 h-4 text-accent-cyan" />
            <span>{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Phone className="w-4 h-4 text-accent-emerald" />
            <span>{lead.phone}</span>
          </div>
        )}
        {lead.city && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="w-4 h-4 text-accent-cyan" />
            <span>{lead.city}{lead.province ? `, ${lead.province}` : ''}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Building className="w-4 h-4 text-purple-400" />
          <span>{formatMoney(lead.monthlyBill)}/mo est.</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'text-accent-cyan border-accent-cyan'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-background-800 border border-white/5 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Lead Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Source</span>
                  <p className="text-white capitalize mt-0.5">{lead.source.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Created</span>
                  <p className="text-white mt-0.5">{formatDate(lead.createdAt)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Address</span>
                  <p className="text-white mt-0.5">{[lead.addressLine, lead.barangay, lead.city, lead.province].filter(Boolean).join(', ') || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Utility</span>
                  <p className="text-white mt-0.5">{lead.utilityCompany?.name || '—'}</p>
                </div>
              </div>
            </div>

            {/* Pipeline Status */}
            <div className="bg-background-800 border border-white/5 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Pipeline Status</h3>
              <div className="space-y-3">
                {/* Current status badge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Current</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize border ${
                    statusColors[lead.status] ?? 'bg-white/5 text-gray-400 border-white/5'
                  }`}>
                    {STATUS_OPTIONS.find((s) => s.value === lead.status)?.label || lead.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Valid next steps */}
                {(() => {
                  const validNext = LEAD_STATUS_TRANSITIONS[lead.status] ?? [];
                  if (validNext.length === 0) {
                    return <p className="text-xs text-gray-500">This lead has reached a terminal stage.</p>;
                  }
                  return (
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Next Step</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {validNext.map((value) => {
                          const opt = STATUS_OPTIONS.find((s) => s.value === value);
                          if (!opt) return null;
                          return (
                            <button
                              key={value}
                              disabled={saving === 'status'}
                              onClick={() => handleStatusChange(value)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                saving === 'status'
                                  ? 'opacity-50 cursor-not-allowed border-white/5 text-gray-500'
                                  : 'border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10 hover:border-accent-cyan'
                              }`}
                            >
                              {opt.label}
                              <span className="ml-1.5 text-[10px] opacity-60">→</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Assignment */}
            <div className="bg-background-800 border border-white/5 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Assignment</h3>
              <div className="flex items-center gap-3">
                <select
                  value={lead.assignedOrgId || ''}
                  onChange={(e) => handleAssignOrg(e.target.value)}
                  disabled={saving === 'org'}
                  className="bg-background-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-blue/50"
                >
                  <option value="">Unassigned</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
                {lead.assignedOrg && (
                  <span className="text-xs text-gray-400">Currently: {lead.assignedOrg.name}</span>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-background-800 border border-white/5 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Notes</h3>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{lead.notes || 'No notes yet.'}</p>
              <div className="flex gap-2">
                <input
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 bg-background-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent-blue/50"
                />
                <button
                  onClick={handleAddNote}
                  disabled={savingNote || !noteInput.trim()}
                  className="px-4 py-2 rounded-lg bg-accent-blue text-white text-sm font-semibold hover:bg-accent-blue/90 transition-colors disabled:opacity-50"
                >
                  {savingNote ? <><Loader2 className="w-4 h-4 animate-spin inline mr-1" />Saving...</> : 'Save'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="space-y-4">
            <div className="bg-background-800 border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Actions</h3>
              <div className="space-y-2">
                <Link
                  href={`/crm/roi/${lead.id}`}
                  className="block w-full text-center px-4 py-2 rounded-lg bg-accent-blue/10 text-accent-blue text-sm font-medium hover:bg-accent-blue/20 transition-colors"
                >
                  Create Design
                </Link>
                {lead.customers.length > 0 && (
                  <Link
                    href={`/crm/projects`}
                    className="block w-full text-center px-4 py-2 rounded-lg bg-accent-emerald/10 text-accent-emerald text-sm font-medium hover:bg-accent-emerald/20 transition-colors"
                  >
                    View Projects ({lead.customers.length})
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="bg-background-800 border border-white/5 rounded-xl p-6">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-sm">No activity recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {activities.map((act, i) => (
                <div key={act.id} className="flex gap-4 pb-4 border-l-2 border-white/5 ml-2 pl-4 relative">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-background-800 border-2 border-accent-cyan" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {ACTION_LABELS[act.action] || act.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{act.description}</p>
                    <p className="text-xs text-gray-600 mt-1">{formatDate(act.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'customers' && (
        <div className="bg-background-800 border border-white/5 rounded-xl p-6">
          {lead.customers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-sm">No customers converted from this lead yet.</p>
              {lead.status === 'qualified' && (
                <p className="text-xs text-gray-600 mt-1">Change status to "Converted" to create a customer record.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {lead.customers.map((c) => (
                <div key={c.id} className="p-4 bg-background-900 rounded-xl border border-white/5">
                  <p className="font-medium text-white">{c.fullName}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-400">
                    <span>{c.contactPhone || '—'}</span>
                    <span>{c.contactEmail || '—'}</span>
                    <span className="capitalize">{c.customerType.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
