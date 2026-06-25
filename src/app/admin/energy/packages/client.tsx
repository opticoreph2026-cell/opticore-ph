'use client';

import React from 'react';
import { AdminTable, type Column, type FieldConfig } from '@/components/ui/AdminTable';
import { formatCentavosToPHP } from '@/lib/money';

interface Package {
  id: string;
  name: string;
  description: string | null;
  category: string;
  status: string;
  panelSku: string;
  panelQuantity: number;
  inverterSku: string;
  inverterQuantity: number;
  batterySku: string;
  batteryQuantity: number;
  totalHardwareCentavos: number;
  installationFeeCentavos: number;
  designFeeCentavos: number;
  permitFeeCentavos: number;
  grandTotalCentavos: number;
  monthlyPaymentEstimateCentavos: number | null;
  createdAt: string;
}

export function PackageAdminClient({
  packages, inverters, batteries, panels,
}: {
  packages: Package[];
  inverters: { id: string; modelName: string; sku: string }[];
  batteries: { id: string; modelName: string; sku: string }[];
  panels: { id: string; modelName: string; sku: string; wattage: number }[];
}) {
  const columns: Column<Package>[] = [
    { key: 'name', label: 'Package' },
    { key: 'category', label: 'Category', render: (p) => <span className="capitalize">{p.category}</span> },
    { key: 'status', label: 'Status', render: (p) => <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${p.status === 'active' ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-white/10 text-white/60'}`}>{p.status}</span> },
    { key: 'panels', label: 'Panels', render: (p) => `${p.panelQuantity}× ${p.panelSku}` },
    { key: 'inverters', label: 'Inverter', render: (p) => `${p.inverterQuantity}× ${p.inverterSku}` },
    { key: 'batteries', label: 'Battery', render: (p) => `${p.batteryQuantity}× ${p.batterySku}` },
    { key: 'grandTotalCentavos', label: 'Total', render: (p) => formatCentavosToPHP(p.grandTotalCentavos) },
  ];

  const fields: FieldConfig[] = [
    { key: 'name', label: 'Package Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    {
      key: 'category', label: 'Category', type: 'select',
      options: [
        { value: 'starter', label: 'Starter' },
        { value: 'standard', label: 'Standard' },
        { value: 'premium', label: 'Premium' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      key: 'status', label: 'Status', type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
    {
      key: 'panelSku', label: 'Panel SKU', type: 'select', required: true,
      options: panels.map((p) => ({ value: p.sku, label: `${p.modelName} (${p.sku}) ${p.wattage}W` })),
    },
    { key: 'panelQuantity', label: 'Panel Quantity', type: 'number' },
    {
      key: 'inverterSku', label: 'Inverter SKU', type: 'select', required: true,
      options: inverters.map((i) => ({ value: i.sku, label: `${i.modelName} (${i.sku})` })),
    },
    { key: 'inverterQuantity', label: 'Inverter Quantity', type: 'number' },
    {
      key: 'batterySku', label: 'Battery SKU', type: 'select', required: true,
      options: batteries.map((b) => ({ value: b.sku, label: `${b.modelName} (${b.sku})` })),
    },
    { key: 'batteryQuantity', label: 'Battery Quantity', type: 'number' },
    { key: 'totalHardwareCentavos', label: 'Hardware Total (centavos)', type: 'number' },
    { key: 'installationFeeCentavos', label: 'Installation Fee (centavos)', type: 'number' },
    { key: 'designFeeCentavos', label: 'Design Fee (centavos)', type: 'number' },
    { key: 'permitFeeCentavos', label: 'Permit Fee (centavos)', type: 'number' },
    { key: 'grandTotalCentavos', label: 'Grand Total (centavos)', type: 'number' },
    { key: 'monthlyPaymentEstimateCentavos', label: 'Monthly Estimate (centavos)', type: 'number' },
  ];

  const handleSave = async (data: Partial<Package>, id?: string) => {
    const url = id ? `/api/energy/packages/${id}` : '/api/energy/packages';
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
    const res = await fetch(`/api/energy/packages/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
  };

  return (
    <AdminTable
      title="Package Bundles"
      description="Pre-configured solar package bundles for quick quoting"
      columns={columns}
      data={packages}
      createFields={fields}
      editFields={fields}
      onSave={handleSave as any}
      onDelete={handleDelete}
      searchKeys={['name', 'description']}
    />
  );
}
