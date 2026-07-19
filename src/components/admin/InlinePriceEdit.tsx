'use client';

import React, { useState } from 'react';

interface InlinePriceEditProps {
  id: string;
  category: 'inverter' | 'battery' | 'panel';
  currentPrice: number;
  isConfirmed: boolean;
  apiPath: string;
}

export function InlinePriceEdit({ id, category, currentPrice, isConfirmed, apiPath }: InlinePriceEditProps) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(String(currentPrice));
  const [confirmed, setConfirmed] = useState(isConfirmed);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const newPrice = parseFloat(price);
      const res = await fetch(apiPath, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, unitPrice: newPrice, isPriceConfirmed: true }),
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
        <span className="text-xs text-foreground-950/40">\u20B1</span>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-24 bg-surface-1000 border border-border-subtle rounded px-2 py-1 text-sm text-foreground-950 font-mono"
          step="0.01"
          min="0"
        />
        <button onClick={handleSave} disabled={saving} className="text-xs text-accent-emerald hover:opacity-70 disabled:opacity-40">
          {saving ? '...' : 'Save'}
        </button>
        <button onClick={() => setEditing(false)} className="text-xs text-foreground-950/40 hover:text-foreground-950">
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
      onClick={() => { setEditing(true); setPrice(String(currentPrice)); }}
      className="text-sm text-foreground-950 font-mono hover:text-accent-cyan transition-colors"
      title="Click to edit price"
    >
      \u20B1{currentPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
      {!confirmed && <span className="ml-1 text-[10px] text-accent-cyan">(est.)</span>}
    </button>
  );
}
