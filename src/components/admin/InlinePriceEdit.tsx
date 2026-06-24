'use client';

import React, { useState } from 'react';

interface InlinePriceEditProps {
  id: string;
  category: 'inverter' | 'battery' | 'panel';
  currentPriceCentavos: number;
  isConfirmed: boolean;
  apiPath: string;
}

export function InlinePriceEdit({ id, category, currentPriceCentavos, isConfirmed, apiPath }: InlinePriceEditProps) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(String(currentPriceCentavos / 100));
  const [confirmed, setConfirmed] = useState(isConfirmed);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const newCentavos = Math.round(parseFloat(price) * 100);
      const res = await fetch(apiPath, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, unitPriceCentavos: newCentavos, isPriceConfirmed: true }),
      });
      if (!res.ok) throw new Error('Failed');
      setConfirmed(true);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/40">\u20B1</span>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-24 bg-surface-1000 border border-border-subtle rounded px-2 py-1 text-sm text-white font-mono"
          step="0.01"
          min="0"
        />
        <button onClick={handleSave} disabled={saving} className="text-xs text-accent-emerald hover:opacity-70 disabled:opacity-40">
          {saving ? '...' : 'Save'}
        </button>
        <button onClick={() => setEditing(false)} className="text-xs text-white/40 hover:text-white">
          Cancel
        </button>
      </div>
    );
  }

  if (saved) {
    return <span className="text-xs text-accent-emerald">Saved!</span>;
  }

  return (
    <button
      type="button"
      onClick={() => { setEditing(true); setPrice(String(currentPriceCentavos / 100)); }}
      className="text-sm text-white font-mono hover:text-accent-cyan transition-colors"
      title="Click to edit price"
    >
      \u20B1{(currentPriceCentavos / 100).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
      {!confirmed && <span className="ml-1 text-[10px] text-accent-amber">(est.)</span>}
    </button>
  );
}
