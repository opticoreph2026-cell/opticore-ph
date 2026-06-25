'use client';

import React from 'react';
import { AdminTable, type Column, type FieldConfig } from '@/components/ui/AdminTable';
import { formatPHP } from '@/lib/money';

interface Commission {
  id: string;
  organization: { name: string };
  project: { id: string; status: string };
  roleInProject: string;
  amountCentavos: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export function CommissionAdminClient({
  commissions, orgs,
}: {
  commissions: Commission[];
  orgs: { id: string; name: string }[];
}) {
  const columns: Column<Commission>[] = [
    { key: 'organization', label: 'Partner', render: (c) => c.organization?.name || '—' },
    { key: 'roleInProject', label: 'Role', render: (c) => <span className="capitalize">{c.roleInProject.replace(/_/g, ' ')}</span> },
    { key: 'amountCentavos', label: 'Amount', render: (c) => formatPHP(c.amountCentavos) },
    {
      key: 'status', label: 'Status',
      render: (c) => {
        const colors: Record<string, string> = {
          pending: 'bg-accent-amber/10 text-accent-amber',
          paid: 'bg-accent-emerald/10 text-accent-emerald',
        };
        return (
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${colors[c.status] ?? 'bg-white/5 text-white/60'}`}>
            {c.status}
          </span>
        );
      },
    },
    { key: 'paidAt', label: 'Paid Date', render: (c) => c.paidAt ? new Date(c.paidAt).toLocaleDateString() : '—' },
  ];

  const fields: FieldConfig[] = [
    {
      key: 'organizationId', label: 'Partner Organization', type: 'select', required: true,
      options: orgs.map((o) => ({ value: o.id, label: o.name })),
    },
    {
      key: 'roleInProject', label: 'Role', type: 'select',
      options: [
        { value: 'hardware_margin', label: 'Hardware Margin' },
        { value: 'installation_fee', label: 'Installation Fee' },
        { value: 'design_fee', label: 'Design Fee' },
        { value: 'referral_fee', label: 'Referral Fee' },
      ],
    },
    { key: 'amount', label: 'Amount (₱)', type: 'number', required: true },
    {
      key: 'status', label: 'Status', type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
      ],
    },
    { key: 'paidAt', label: 'Paid At (ISO date)', type: 'date' },
  ];

  const handleSave = async (data: Partial<Commission>, id?: string) => {
    const url = id ? `/api/energy/commissions/${id}` : '/api/energy/commissions';
    const method = id ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(typeof err.error === 'string' ? err.error : 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/energy/commissions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
  };

  return (
    <AdminTable
      title="Commissions"
      description="Manage partner commissions and payouts"
      columns={columns}
      data={commissions}
      createFields={fields}
      editFields={fields}
      onSave={handleSave as any}
      onDelete={handleDelete}
      searchKeys={[]}
    />
  );
}
