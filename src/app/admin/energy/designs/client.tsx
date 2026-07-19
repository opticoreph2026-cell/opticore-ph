'use client';

import React from 'react';
import { AdminTable, type Column, type FieldConfig } from '@/components/ui/AdminTable';

interface Design {
  id: string;
  site: { customer: { fullName: string } } | null;
  designPathway: string;
  pvArrayKwp: number;
  pvPanelCount: number;
  inverter: { modelName: string } | null;
  battery: { modelName: string; usableKwh: number } | null;
  status: string;
  _count: { bomItems: number; quotations: number };
  createdAt: string;
}

export function DesignAdminClient({ designs }: { designs: Design[] }) {
  const columns: Column<Design>[] = [
    { key: 'customer', label: 'Customer', render: (d) => d.site?.customer?.fullName || '—' },
    { key: 'designPathway', label: 'Pathway', render: (d) => <span className="capitalize">{d.designPathway.replace(/_/g, ' ')}</span> },
    { key: 'pvArrayKwp', label: 'System Size', render: (d) => `${d.pvArrayKwp.toFixed(2)} kWp` },
    { key: 'pvPanelCount', label: 'Panels' },
    { key: 'inverter', label: 'Inverter', render: (d) => d.inverter?.modelName || '—' },
    { key: 'battery', label: 'Battery', render: (d) => d.battery ? `${d.battery.modelName} (${d.battery.usableKwh}kWh)` : '—' },
    {
      key: 'status', label: 'Status',
      render: (d) => {
        const colors: Record<string, string> = {
          draft: 'bg-foreground-950/10 text-foreground-950/60',
          finalized: 'bg-accent-emerald/10 text-accent-emerald',
          approved_by_customer: 'bg-accent-cyan/10 text-accent-cyan',
        };
        return (
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${colors[d.status] ?? 'bg-foreground-950/5 text-foreground-950/60'}`}>
            {d.status.replace(/_/g, ' ')}
          </span>
        );
      },
    },
    { key: 'bom', label: 'BOM Items', render: (d) => d._count.bomItems },
  ];

  const fields: FieldConfig[] = [
    {
      key: 'status', label: 'Status', type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'finalized', label: 'Finalized' },
        { value: 'approved_by_customer', label: 'Approved by Customer' },
      ],
    },
  ];

  const handleSave = async (data: Partial<Design>, id?: string) => {
    if (!id) throw new Error('Cannot create designs from admin page');
    const res = await fetch(`/api/energy/designs/${id}`, {
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
    const res = await fetch(`/api/energy/designs/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
  };

  return (
    <AdminTable
      title="System Designs"
      description="All solar system designs"
      columns={columns}
      data={designs}
      editFields={fields}
      onSave={handleSave as any}
      onDelete={handleDelete}
      searchKeys={[]}
    />
  );
}
