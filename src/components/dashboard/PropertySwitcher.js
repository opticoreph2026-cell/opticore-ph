'use client';

import { useState, useEffect, useRef } from 'react';
import { Building2, ChevronDown, Plus, Check, Trash2, X, Home } from 'lucide-react';

export default function PropertySwitcher() {
  const [properties, setProperties]   = useState([]);
  const [active, setActive]           = useState(null);
  const [open, setOpen]               = useState(false);
  const [showAdd, setShowAdd]         = useState(false);
  const [newName, setNewName]         = useState('');
  const [newAddress, setNewAddress]   = useState('');
  const [saving, setSaving]           = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetch('/api/dashboard/properties')
      .then(r => r.json())
      .then(d => {
        const props = d.properties ?? [];
        setProperties(props);
        setActive(props.find(p => p.isDefault) ?? props[0] ?? null);
      })
      .catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = async (prop) => {
    setActive(prop);
    setOpen(false);
    // Mark as default in DB (non-blocking)
    fetch(`/api/dashboard/properties/${prop.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    }).catch(() => {});
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/dashboard/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), address: newAddress.trim(), isDefault: properties.length === 0 }),
      });
      const data = await res.json();
      if (res.ok) {
        const updated = properties.length === 0
          ? [{ ...data.property }]
          : [...properties, data.property];
        setProperties(updated);
        if (updated.length === 1) setActive(updated[0]);
        setNewName('');
        setNewAddress('');
        setShowAdd(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (prop, e) => {
    e.stopPropagation();
    if (!confirm(`Delete "${prop.name}"? This cannot be undone.`)) return;
    await fetch(`/api/dashboard/properties/${prop.id}`, { method: 'DELETE' });
    const updated = properties.filter(p => p.id !== prop.id);
    setProperties(updated);
    if (active?.id === prop.id) setActive(updated[0] ?? null);
  };

  if (properties.length === 0 && !showAdd) {
    return (
      <button
        onClick={() => setShowAdd(true)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-700/50 border border-dashed border-white/10 text-text-muted hover:text-text-secondary hover:border-brand-500/30 transition-colors text-xs"
      >
        <Plus className="w-3.5 h-3.5" /> Add Property
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-surface-700/50 border border-white/[0.06] hover:border-brand-500/20 transition-colors text-left group"
      >
        <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
          <Home className="w-3.5 h-3.5 text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest leading-none mb-0.5">Property</p>
          <p className="text-xs font-medium text-text-primary truncate">{active?.name ?? 'Select…'}</p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface-800 border border-white/[0.08] rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
          <div className="py-1 max-h-48 overflow-y-auto">
            {properties.map(prop => (
              <button
                key={prop.id}
                onClick={() => handleSelect(prop)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-white/[0.04] transition-colors text-left group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{prop.name}</p>
                    {prop.address && <p className="text-[10px] text-text-muted truncate">{prop.address}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {active?.id === prop.id && <Check className="w-3.5 h-3.5 text-brand-400" />}
                  <button
                    onClick={(e) => handleDelete(prop, e)}
                    className="p-1 rounded text-text-muted hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-white/[0.06] p-2">
            {!showAdd ? (
              <button
                onClick={() => setShowAdd(true)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-text-muted hover:text-brand-400 hover:bg-brand-500/5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add new property
              </button>
            ) : (
              <form onSubmit={handleAdd} className="space-y-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Property name (e.g. Main Home)"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-surface-700 border border-white/[0.08] rounded-lg px-2.5 py-2 text-xs text-text-primary placeholder-text-muted outline-none focus:border-brand-500/40"
                />
                <input
                  type="text"
                  placeholder="Address (optional)"
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  className="w-full bg-surface-700 border border-white/[0.08] rounded-lg px-2.5 py-2 text-xs text-text-primary placeholder-text-muted outline-none focus:border-brand-500/40"
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={saving || !newName.trim()} className="flex-1 bg-brand-500 hover:bg-brand-400 text-surface-950 text-[10px] font-bold py-1.5 rounded-lg transition-colors disabled:opacity-50">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button type="button" onClick={() => { setShowAdd(false); setNewName(''); }} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
