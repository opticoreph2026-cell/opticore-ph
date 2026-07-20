'use client';

import React from 'react';
import { AdminTable, type Column, type FieldConfig } from '@/components/ui/AdminTable';
import { formatPHP } from '@/lib/money';

interface Quotation {
  id: string;
  quoteNumber: string;
  customer: { fullName: string };
  design: { pvArrayKwp: number; designPathway: string } | null;
  roiScenario: { scenarioLabel: string } | null;
  grandTotal: number;
  status: string;
  createdAt: string;
}

export function QuotationAdminClient({ quotations }: { quotations: Quotation[] }) {
  const columns: Column<Quotation>[] = [
    { key: 'quoteNumber', label: 'Quote #', render: (q) => <span className="font-mono text-accent-cyan">{q.quoteNumber}</span> },
    { key: 'customer', label: 'Customer', render: (q) => q.customer?.fullName || '—' },
    { key: 'design', label: 'System', render: (q) => q.design ? `${q.design.pvArrayKwp.toFixed(2)} kWp` : '—' },
    {
      key: 'grandTotal', label: 'Total',
      render: (q) => formatPHP(q.grandTotal),
    },
    {
      key: 'status', label: 'Status',
      render: (q) => {
        const colors: Record<string, string> = {
          draft: 'bg-foreground-950/10 text-foreground-950/60',
          sent: 'bg-accent-cyan/10 text-accent-cyan',
          accepted: 'bg-accent-emerald/10 text-accent-emerald',
          rejected: 'bg-accent-rose/10 text-accent-rose',
          expired: 'bg-amber-500/10 text-amber-400',
        };
        return (
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${colors[q.status] ?? 'bg-foreground-950/5 text-foreground-950/60'}`}>
            {q.status}
          </span>
        );
      },
    },
  ];

  const fields: FieldConfig[] = [
    {
      key: 'status', label: 'Status', type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent' },
        { value: 'accepted', label: 'Accepted' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'expired', label: 'Expired' },
      ],
    },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ];

  const handleSave = async (data: Partial<Quotation>, id?: string) => {
    if (!id) throw new Error('Cannot create quotations from admin page');
    const res = await fetch(`/api/energy/quotations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(typeof err.error === 'string' ? err.error : 'Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/energy/quotations/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
  };

  return (
    <AdminTable
      title="Quotations"
      description="Manage customer quotations and proposals"
      columns={columns}
      data={quotations}
      editFields={fields}
      onSave={handleSave as any}
      onDelete={handleDelete}
      searchKeys={['quoteNumber']}
    />
  );
}
