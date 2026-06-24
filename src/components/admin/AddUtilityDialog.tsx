'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus } from 'lucide-react';

export function AddUtilityDialog() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    code: '',
    name: '',
    territory: '',
    netMeteringApplicationUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          territory: form.territory.trim() || null,
          netMeteringApplicationUrl: form.netMeteringApplicationUrl.trim() || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to create utility');
      setOpen(false);
      setForm({ code: '', name: '', territory: '', netMeteringApplicationUrl: '' });
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
        Add Utility
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-surface-900 border border-border-subtle rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Add Utility Company</h2>
              <button onClick={() => setOpen(false)} className="p-1 text-white/40 hover:text-white rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Code *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. VECO, CEBECO_I"
                  className="w-full px-3 py-2 bg-surface-800 border border-border-subtle rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Visayan Electric Company"
                  className="w-full px-3 py-2 bg-surface-800 border border-border-subtle rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Territory</label>
                <input
                  type="text"
                  value={form.territory}
                  onChange={(e) => setForm({ ...form, territory: e.target.value })}
                  placeholder="e.g. Cebu"
                  className="w-full px-3 py-2 bg-surface-800 border border-border-subtle rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Net Metering URL</label>
                <input
                  type="url"
                  value={form.netMeteringApplicationUrl}
                  onChange={(e) => setForm({ ...form, netMeteringApplicationUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-surface-800 border border-border-subtle rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.code.trim() || !form.name.trim()}
                  className="px-4 py-2 text-sm font-medium bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Add Utility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
