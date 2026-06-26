'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface EditRateDialogProps {
  utilityId: string;
  utilityName: string;
  currentAllInRateRu: number;
  currentBgcRateRu: number;
}

export function EditRateDialog({ utilityId, utilityName, currentAllInRateRu, currentBgcRateRu }: EditRateDialogProps) {
  const [open, setOpen] = useState(false);
  const [allInRatePhp, setAllInRatePhp] = useState((currentAllInRateRu / 10000).toFixed(4));
  const [bgcRatePhp, setBgcRatePhp] = useState((currentBgcRateRu / 10000).toFixed(4));
  const [customerClass, setCustomerClass] = useState('residential');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSave = async () => {
    const allIn = parseFloat(allInRatePhp);
    const bgc = parseFloat(bgcRatePhp);
    if (isNaN(allIn) || allIn <= 0) { setError('All-in rate must be a positive number'); return; }
    if (isNaN(bgc) || bgc < 0) { setError('BGC rate must be a non-negative number'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/utilities/${utilityId}/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allInRateRu: Math.round(allIn * 10000),
          bgcRateRu: Math.round(bgc * 10000),
          customerClass,
          effectiveDate: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update rate');
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update rate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg text-white/40 hover:text-accent-cyan hover:bg-white/5 transition-colors"
        title="Edit rate"
      >
        <Pencil className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-border-subtle rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-1">Edit Rate — {utilityName}</h3>
            <p className="text-xs text-white/40 mb-6">Creates a new rate schedule effective today. Previous rates are preserved.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">All-in Rate (₱/kWh)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={allInRatePhp}
                  onChange={(e) => setAllInRatePhp(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-800 border border-border-subtle text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">BGC Rate (₱/kWh)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={bgcRatePhp}
                  onChange={(e) => setBgcRatePhp(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-800 border border-border-subtle text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Customer Class</label>
                <select
                  value={customerClass}
                  onChange={(e) => setCustomerClass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-800 border border-border-subtle text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="text-sm text-accent-rose bg-accent-rose/10 border border-accent-rose/20 rounded-xl px-4 py-3 mt-4">{error}</p>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => { setOpen(false); setError(''); }}
                disabled={loading}
                className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-accent-cyan rounded-xl hover:bg-accent-cyan/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <><Spinner className="w-4 h-4" /> Saving...</> : 'Save Rate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
