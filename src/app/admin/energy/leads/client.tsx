'use client';

import React from 'react';
import { AdminTable, type Column, type FieldConfig } from '@/components/ui/AdminTable';
import { formatPHP } from '@/lib/money';

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
  assignedOrg: { id: string; name: string } | null;
  createdAt: string;
}

export function AdminPageClient({ leads, orgs }: { leads: Lead[]; orgs: { id: string; name: string }[] }) {
  const columns: Column<Lead>[] = [
    { key: 'fullName', label: 'Customer' },
    { key: 'email', label: 'Email', render: (l) => <span className="text-foreground-50/60">{l.email || '—'}</span> },
    { key: 'phone', label: 'Phone', render: (l) => <span className="text-foreground-50/60">{l.phone || '—'}</span> },
    { key: 'city', label: 'Location', render: (l) => <span>{[l.city, l.province].filter(Boolean).join(', ') || '—'}</span> },
    {
      key: 'monthlyBill', label: 'Est. Bill',
      render: (l) => formatPHP(l.monthlyBill),
    },
    { key: 'source', label: 'Source', render: (l) => <span className="capitalize">{l.source.replace(/_/g, ' ')}</span> },
    {
      key: 'status', label: 'Status',
      render: (l) => {
        const colors: Record<string, string> = {
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
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${colors[l.status] ?? 'bg-foreground-950/5 text-foreground-50/60'}`}>
            {l.status.replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      key: 'assignedOrg', label: 'Assigned Org',
      render: (l) => <span className="text-foreground-50/60">{l.assignedOrg?.name || '—'}</span>,
    },
  ];

  const fields: FieldConfig[] = [
    { key: 'fullName', label: 'Full Name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'city', label: 'City', type: 'text' },
    { key: 'province', label: 'Province', type: 'text' },
    {
      key: 'customerType', label: 'Customer Type', type: 'select',
      options: [
        { value: 'residential', label: 'Residential' },
        { value: 'small_commercial', label: 'Small Commercial' },
        { value: 'medium_commercial', label: 'Medium Commercial' },
        { value: 'developer', label: 'Developer' },
      ],
    },
    {
      key: 'status', label: 'Status', type: 'select',
      options: [
        { value: 'new', label: 'New' },
        { value: 'contacted', label: 'Contacted' },
        { value: 'site_visit_scheduled', label: 'Site Visit Scheduled' },
        { value: 'site_visit_done', label: 'Site Visit Done' },
        { value: 'qualified', label: 'Qualified' },
        { value: 'quote_sent', label: 'Quote Sent' },
        { value: 'negotiating', label: 'Negotiating' },
        { value: 'won', label: 'Won' },
        { value: 'lost', label: 'Lost' },
        { value: 'disqualified', label: 'Disqualified' },
        { value: 'converted', label: 'Converted' },
      ],
    },
    {
      key: 'source', label: 'Source', type: 'select',
      options: [
        { value: 'website_calc', label: 'Website Calculator' },
        { value: 'facebook', label: 'Facebook' },
        { value: 'referral', label: 'Referral' },
        { value: 'direct', label: 'Direct' },
        { value: 'developer_outreach', label: 'Developer Outreach' },
      ],
    },
    {
      key: 'assignedOrgId', label: 'Assigned Organization', type: 'select',
      options: orgs.map((o) => ({ value: o.id, label: o.name })),
    },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ];

  const handleSave = async (data: Partial<Lead>, id?: string) => {
    const url = id ? `/api/energy/leads/${id}` : '/api/energy/leads';
    const method = id ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/energy/leads/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
  };

  return (
    <AdminTable
      title="Leads"
      description="Manage all solar leads and prospects"
      columns={columns}
      data={leads}
      createFields={fields}
      editFields={fields}
      onSave={handleSave as any}
      onDelete={handleDelete}
      searchKeys={['fullName', 'email', 'phone', 'city', 'province']}
    />
  );
}
