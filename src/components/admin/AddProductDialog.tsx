'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus } from 'lucide-react';

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    category: 'inverter',
    modelName: '',
    sku: '',
    ratedAcKw: '',
    nominalKwh: '',
    usableKwh: '',
    wattage: '',
    efficiencyPct: '',
    unitPrice: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.modelName.trim() || !form.sku.trim()) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        category: form.category,
        modelName: form.modelName.trim(),
        sku: form.sku.trim(),
        unitPrice: parseFloat(form.unitPrice || '0'),
      };

      if (form.category === 'inverter') {
        body.ratedAcKw = parseFloat(form.ratedAcKw || '0');
      } else if (form.category === 'battery') {
        body.nominalKwh = parseFloat(form.nominalKwh || '0');
        body.usableKwh = parseFloat(form.usableKwh || '0');
      } else if (form.category === 'panel') {
        body.wattage = parseInt(form.wattage || '0');
        body.efficiencyPct = parseFloat(form.efficiencyPct || '0');
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to create product');
      setOpen(false);
      setForm({
        category: 'inverter', modelName: '', sku: '', ratedAcKw: '',
        nominalKwh: '', usableKwh: '', wattage: '', efficiencyPct: '', unitPrice: '',
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
        className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white font-medium rounded-lg hover:bg-accent-blue/90 transition-colors text-sm"
      >
        <Plus className="w-4 h-4" />
        Add Product
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-background-800 border border-foreground-950/10 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Add Product</h2>
              <button onClick={() => setOpen(false)} className="p-1 text-white/40 hover:text-white rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 bg-background-900 border border-foreground-950/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                  <option value="inverter">Inverter</option>
                  <option value="battery">Battery</option>
                  <option value="panel">Solar Panel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Model Name *</label>
                <input
                  type="text"
                  required
                  value={form.modelName}
                  onChange={(e) => setForm({ ...form, modelName: e.target.value })}
                  className="w-full px-3 py-2 bg-background-900 border border-foreground-950/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">SKU *</label>
                <input
                  type="text"
                  required
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full px-3 py-2 bg-background-900 border border-foreground-950/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              {form.category === 'inverter' && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Rated AC (kW)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.ratedAcKw}
                    onChange={(e) => setForm({ ...form, ratedAcKw: e.target.value })}
                    className="w-full px-3 py-2 bg-background-900 border border-foreground-950/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
              )}

              {form.category === 'battery' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">Nominal (kWh)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.nominalKwh}
                      onChange={(e) => setForm({ ...form, nominalKwh: e.target.value })}
                      className="w-full px-3 py-2 bg-background-900 border border-foreground-950/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">Usable (kWh)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.usableKwh}
                      onChange={(e) => setForm({ ...form, usableKwh: e.target.value })}
                      className="w-full px-3 py-2 bg-background-900 border border-foreground-950/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    />
                  </div>
                </>
              )}

              {form.category === 'panel' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">Wattage (W)</label>
                    <input
                      type="number"
                      value={form.wattage}
                      onChange={(e) => setForm({ ...form, wattage: e.target.value })}
                      className="w-full px-3 py-2 bg-background-900 border border-foreground-950/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">Efficiency (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.efficiencyPct}
                      onChange={(e) => setForm({ ...form, efficiencyPct: e.target.value })}
                      className="w-full px-3 py-2 bg-background-900 border border-foreground-950/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Price (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.unitPrice}
                  onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                  className="w-full px-3 py-2 bg-background-900 border border-foreground-950/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.modelName.trim() || !form.sku.trim()}
                  className="px-4 py-2 text-sm font-medium bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
