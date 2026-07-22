'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Check, X, Edit2, Plus, Zap } from 'lucide-react';
import { AddUtilityDialog } from './AddUtilityDialog';

interface UtilityRow {
  id: string;
  name: string;
  code: string;
  territory: string | null;
  rateSchedules: { allInRateRu: number; effectiveDate: string }[];
}

export function UtilityTable({ initialUtilities }: { initialUtilities: UtilityRow[] }) {
  const router = useRouter();
  const [utilities, setUtilities] = useState(initialUtilities);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', code: '', territory: '' });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const startEdit = (u: UtilityRow) => {
    setEditingId(u.id);
    setEditForm({ name: u.name, code: u.code, territory: u.territory || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', code: '', territory: '' });
  };

  const saveEdit = async (u: UtilityRow) => {
    try {
      const res = await fetch(`/api/admin/utilities/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editForm.name, code: editForm.code.toUpperCase(), territory: editForm.territory || null }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setUtilities((prev) => prev.map((x) => (x.id === u.id ? { ...x, name: editForm.name, code: editForm.code, territory: editForm.territory } : x)));
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (u: UtilityRow) => {
    try {
      const res = await fetch(`/api/admin/utilities/${u.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setUtilities((prev) => prev.filter((x) => x.id !== u.id));
      setConfirmDelete(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground-950 tracking-tight flex items-center gap-3">
            <Zap className="w-8 h-8 text-accent-emerald" />
            Utility Companies
          </h1>
          <p className="text-foreground-950/60 mt-1">Manage DUs, co-ops, and their current rate schedules.</p>
        </div>
        <AddUtilityDialog />
      </div>

      <div className="bg-background-100 border border-border-subtle rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-foreground-950/[0.02]">
                <th className="p-4 text-xs font-semibold text-foreground-950/60 uppercase tracking-wider">Utility Company</th>
                <th className="p-4 text-xs font-semibold text-foreground-950/60 uppercase tracking-wider">Code</th>
                <th className="p-4 text-xs font-semibold text-foreground-950/60 uppercase tracking-wider">Territory</th>
                <th className="p-4 text-xs font-semibold text-foreground-950/60 uppercase tracking-wider text-right">All-In Rate (₱/kWh)</th>
                <th className="p-4 text-xs font-semibold text-foreground-950/60 uppercase tracking-wider text-right">Effective Date</th>
                <th className="p-4 text-xs font-semibold text-foreground-950/60 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {utilities.map((u) => {
                const latestRate = u.rateSchedules[0];
                return (
                  <tr key={u.id} className="hover:bg-foreground-950/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-background-100 border border-border-subtle flex items-center justify-center text-xs font-bold text-accent-emerald">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        {editingId === u.id ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="bg-background-100 border border-foreground-950/10 rounded px-2 py-1 text-sm text-foreground-950 w-48"
                          />
                        ) : (
                          <p className="text-sm font-medium text-foreground-950">{u.name}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {editingId === u.id ? (
                        <input
                          type="text"
                          value={editForm.code}
                          onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                          className="bg-background-100 border border-foreground-950/10 rounded px-2 py-1 text-sm text-foreground-950 font-mono w-24"
                        />
                      ) : (
                        <span className="text-xs font-mono text-accent-cyan">{u.code}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {editingId === u.id ? (
                        <input
                          type="text"
                          value={editForm.territory}
                          onChange={(e) => setEditForm({ ...editForm, territory: e.target.value })}
                          className="bg-background-100 border border-foreground-950/10 rounded px-2 py-1 text-sm text-foreground-950 w-32"
                        />
                      ) : (
                        <span className="text-sm text-foreground-950/60">{u.territory || '—'}</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {latestRate ? (
                        <span className="text-sm font-medium text-foreground-950">
                          ₱{(latestRate.allInRateRu / 10000).toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-sm text-foreground-950/40">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right text-sm text-foreground-950/60">
                      {latestRate
                        ? new Date(latestRate.effectiveDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="p-4 text-right">
                      {confirmDelete === u.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleDelete(u)} className="p-1 text-accent-rose hover:bg-accent-rose/10 rounded transition-colors" title="Confirm delete">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setConfirmDelete(null)} className="p-1 text-foreground-950/40 hover:text-foreground-950 rounded transition-colors" title="Cancel">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : editingId === u.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => saveEdit(u)} className="p-1 text-accent-emerald hover:bg-accent-emerald/10 rounded transition-colors" title="Save">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={cancelEdit} className="p-1 text-foreground-950/40 hover:text-foreground-950 rounded transition-colors" title="Cancel">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => startEdit(u)} className="p-1 text-foreground-950/40 hover:text-accent-cyan rounded transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setConfirmDelete(u.id)} className="p-1 text-foreground-950/40 hover:text-accent-rose rounded transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {utilities.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-foreground-950/60 text-sm">
                    No utility companies configured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
