'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

export function AddUnitDialog() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    serialNumber: '',
    type: 'inverter',
    inverterId: '',
    batteryId: '',
    ownershipStatus: 'consigned_bytewatt',
    storageLocation: '',
    receivedDate: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serialNumber.trim()) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        serialNumber: form.serialNumber.trim(),
        ownershipStatus: form.ownershipStatus,
        storageLocation: form.storageLocation || null,
        receivedDate: form.receivedDate,
        notes: form.notes || null,
      };
      if (form.type === 'inverter' && form.inverterId) body.inverterId = form.inverterId;
      if (form.type === 'battery' && form.batteryId) body.batteryId = form.batteryId;

      const res = await fetch('/api/energy/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to add unit');
      setOpen(false);
      setForm({
        serialNumber: '',
        type: 'inverter',
        inverterId: '',
        batteryId: '',
        ownershipStatus: 'consigned_bytewatt',
        storageLocation: '',
        receivedDate: new Date().toISOString().slice(0, 10),
        notes: '',
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-accent-blue text-white font-medium rounded-lg hover:bg-accent-blue/90 transition-colors text-sm"
      >
        Add Unit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-surface-900 border border-border-subtle rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Add Inventory Unit</h2>
              <button onClick={() => setOpen(false)} className="p-1 text-white/40 hover:text-white rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Serial Number *</label>
                <input
                  type="text"
                  required
                  value={form.serialNumber}
                  onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-800 border border-border-subtle rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-800 border border-border-subtle rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                  <option value="inverter">Inverter</option>
                  <option value="battery">Battery</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Ownership Status</label>
                <select
                  value={form.ownershipStatus}
                  onChange={(e) => setForm({ ...form, ownershipStatus: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-800 border border-border-subtle rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                  <option value="consigned_bytewatt">Consigned (Bytewatt)</option>
                  <option value="consigned_partner">Consigned (Partner)</option>
                  <option value="owned_by_opticore">Owned by OptiCore</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold_installed">Sold & Installed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Storage Location</label>
                <input
                  type="text"
                  value={form.storageLocation}
                  onChange={(e) => setForm({ ...form, storageLocation: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-800 border border-border-subtle rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="e.g. Cebu Warehouse"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Received Date</label>
                <input
                  type="date"
                  value={form.receivedDate}
                  onChange={(e) => setForm({ ...form, receivedDate: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-800 border border-border-subtle rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-surface-800 border border-border-subtle rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.serialNumber.trim()}
                  className="px-4 py-2 text-sm font-medium bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Add Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
