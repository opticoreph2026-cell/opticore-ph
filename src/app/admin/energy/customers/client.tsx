'use client';

import React from 'react';
import { AdminTable, type Column, type FieldConfig } from '@/components/ui/AdminTable';

interface Customer {
  id: string;
  fullName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  customerType: string;
  billingAddress: string | null;
  sites: { id: string; address: string | null }[];
  _count: { quotations: number };
  createdAt: string;
}

export function CustomerAdminClient({ customers }: { customers: Customer[] }) {
  const columns: Column<Customer>[] = [
    { key: 'fullName', label: 'Customer' },
    { key: 'contactEmail', label: 'Email', render: (c) => <span className="text-foreground-950/60">{c.contactEmail || '—'}</span> },
    { key: 'contactPhone', label: 'Phone', render: (c) => <span className="text-foreground-950/60">{c.contactPhone || '—'}</span> },
    { key: 'customerType', label: 'Type', render: (c) => <span className="capitalize">{c.customerType.replace(/_/g, ' ')}</span> },
    { key: 'billingAddress', label: 'Address', render: (c) => <span className="text-foreground-950/60 truncate max-w-[200px] inline-block">{c.billingAddress || '—'}</span> },
    { key: 'quotations', label: 'Quotations', render: (c) => c._count.quotations },
    { key: 'sites', label: 'Sites', render: (c) => c.sites.length },
  ];

  const fields: FieldConfig[] = [
    { key: 'fullName', label: 'Full Name', type: 'text', required: true },
    { key: 'contactEmail', label: 'Email', type: 'email' },
    { key: 'contactPhone', label: 'Phone', type: 'text' },
    {
      key: 'customerType', label: 'Customer Type', type: 'select',
      options: [
        { value: 'residential', label: 'Residential' },
        { value: 'small_commercial', label: 'Small Commercial' },
        { value: 'medium_commercial', label: 'Medium Commercial' },
        { value: 'developer', label: 'Developer' },
      ],
    },
    { key: 'billingAddress', label: 'Billing Address', type: 'text' },
    { key: 'siteAddress', label: 'Site Address', type: 'text' },
    { key: 'utilityAccountNo', label: 'Utility Account No.', type: 'text' },
  ];

  const handleSave = async (data: Partial<Customer>, id?: string) => {
    const url = id ? `/api/energy/customers/${id}` : '/api/energy/customers';
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
    const res = await fetch(`/api/energy/customers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
  };

  return (
    <AdminTable
      title="Customers"
      description="Manage energy customers and their sites"
      columns={columns}
      data={customers}
      createFields={fields}
      editFields={fields}
      onSave={handleSave as any}
      onDelete={handleDelete}
      searchKeys={['fullName', 'contactEmail', 'contactPhone']}
    />
  );
}
