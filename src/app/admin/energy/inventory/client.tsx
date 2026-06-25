'use client';

import React from 'react';
import { AdminTable, type Column, type FieldConfig } from '@/components/ui/AdminTable';

interface InventoryItem {
  id: string;
  serialNumber: string;
  inverter: { id: string; modelName: string; sku: string } | null;
  battery: { id: string; modelName: string; sku: string } | null;
  ownershipStatus: string;
  storageLocation: string | null;
  consignmentRemitStatus: string;
  receivedDate: string;
}

export function InventoryAdminClient({
  inventory, inverters, batteries,
}: {
  inventory: InventoryItem[];
  inverters: { id: string; modelName: string; sku: string }[];
  batteries: { id: string; modelName: string; sku: string }[];
}) {
  const columns: Column<InventoryItem>[] = [
    { key: 'serialNumber', label: 'Serial #', render: (i) => <span className="font-mono text-xs">{i.serialNumber}</span> },
    { key: 'inverter', label: 'Inverter', render: (i) => i.inverter?.modelName || '—' },
    { key: 'battery', label: 'Battery', render: (i) => i.battery?.modelName || '—' },
    {
      key: 'ownershipStatus', label: 'Ownership',
      render: (i) => <span className="capitalize">{i.ownershipStatus.replace(/_/g, ' ')}</span>,
    },
    { key: 'storageLocation', label: 'Location', render: (i) => i.storageLocation || '—' },
    {
      key: 'consignmentRemitStatus', label: 'Remit Status',
      render: (i) => <span className="capitalize">{i.consignmentRemitStatus.replace(/_/g, ' ')}</span>,
    },
  ];

  const fields: FieldConfig[] = [
    { key: 'serialNumber', label: 'Serial Number', type: 'text', required: true },
    {
      key: 'inverterId', label: 'Inverter', type: 'select',
      options: inverters.map((inv) => ({ value: inv.id, label: `${inv.modelName} (${inv.sku})` })),
    },
    {
      key: 'batteryId', label: 'Battery', type: 'select',
      options: batteries.map((bat) => ({ value: bat.id, label: `${bat.modelName} (${bat.sku})` })),
    },
    {
      key: 'ownershipStatus', label: 'Ownership', type: 'select',
      options: [
        { value: 'owned_opticore', label: 'Owned by OptiCore' },
        { value: 'consigned_bytewatt', label: 'Consigned by Bytewatt' },
        { value: 'partner_owned', label: 'Partner Owned' },
      ],
    },
    { key: 'storageLocation', label: 'Location', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ];

  const handleSave = async (data: Partial<InventoryItem>, id?: string) => {
    const url = id ? `/api/energy/inventory/${id}` : '/api/energy/inventory';
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
    const res = await fetch(`/api/energy/inventory/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
  };

  return (
    <AdminTable
      title="Inventory"
      description="Track inverter and battery inventory units"
      columns={columns}
      data={inventory}
      createFields={fields}
      editFields={fields}
      onSave={handleSave as any}
      onDelete={handleDelete}
      searchKeys={['serialNumber', 'storageLocation']}
    />
  );
}
