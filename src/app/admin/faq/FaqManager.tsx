'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit2, Check, X, Plus } from 'lucide-react';

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  locale: string;
  category: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export function FaqManager({ initialEntries }: { initialEntries: FaqRow[] }) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ question: '', answer: '', category: '', sortOrder: 0 });
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ question: '', answer: '', locale: 'en', category: '', sortOrder: 0 });
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'en' | 'fil'>('all');

  const startEdit = (e: FaqRow) => {
    setEditingId(e.id);
    setEditForm({ question: e.question, answer: e.answer, category: e.category || '', sortOrder: e.sortOrder });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ question: '', answer: '', category: '', sortOrder: 0 });
  };

  const saveEdit = async (entry: FaqRow) => {
    try {
      const res = await fetch(`/api/admin/faq/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Failed to update');
      setEntries((prev) =>
        prev.map((x) =>
          x.id === entry.id
            ? { ...x, question: editForm.question, answer: editForm.answer, category: editForm.category || null, sortOrder: editForm.sortOrder }
            : x,
        ),
      );
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (entry: FaqRow) => {
    setDeleting(entry.id);
    try {
      const res = await fetch(`/api/admin/faq/${entry.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setEntries((prev) => prev.filter((x) => x.id !== entry.id));
      setConfirmDelete(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (entry: FaqRow) => {
    try {
      const res = await fetch(`/api/admin/faq/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !entry.active }),
      });
      if (!res.ok) throw new Error('Failed to toggle');
      setEntries((prev) => prev.map((x) => (x.id === entry.id ? { ...x, active: !x.active } : x)));
    } catch (err) {
      console.error(err);
    }
  };

  const createEntry = async () => {
    try {
      const res = await fetch('/api/admin/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      });
      if (!res.ok) throw new Error('Failed to create');
      const created = await res.json();
      setEntries((prev) => [...prev, { ...created, createdAt: created.createdAt || new Date().toISOString(), updatedAt: created.updatedAt || new Date().toISOString() }]);
      setShowNew(false);
      setNewForm({ question: '', answer: '', locale: 'en', category: '', sortOrder: 0 });
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEntries = filter === 'all' ? entries : entries.filter((e) => e.locale === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {(['all', 'en', 'fil'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === f ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-foreground-950/50 hover:text-foreground-950/70 bg-foreground-950/5 border border-foreground-950/10'
              }`}
            >
              {f === 'all' ? 'All' : f === 'en' ? 'English' : 'Filipino'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary-500 text-foreground-950 hover:bg-primary-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          New FAQ
        </button>
      </div>

      {showNew && (
        <div className="bg-surface-800 border border-border-subtle rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground-950">New FAQ Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-foreground-950/60 font-medium">Question</label>
              <input
                type="text"
                value={newForm.question}
                onChange={(e) => setNewForm({ ...newForm, question: e.target.value })}
                className="w-full bg-surface-900 border border-border-subtle rounded-lg px-3 py-2 text-sm text-foreground-950 focus:outline-none focus:border-primary-500/50"
                placeholder="Enter question"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-foreground-950/60 font-medium">Locale</label>
              <select
                value={newForm.locale}
                onChange={(e) => setNewForm({ ...newForm, locale: e.target.value })}
                className="w-full bg-surface-900 border border-border-subtle rounded-lg px-3 py-2 text-sm text-foreground-950 focus:outline-none focus:border-primary-500/50"
              >
                <option value="en">English</option>
                <option value="fil">Filipino</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-foreground-950/60 font-medium">Answer</label>
            <textarea
              value={newForm.answer}
              onChange={(e) => setNewForm({ ...newForm, answer: e.target.value })}
              rows={3}
              className="w-full bg-surface-900 border border-border-subtle rounded-lg px-3 py-2 text-sm text-foreground-950 focus:outline-none focus:border-primary-500/50 resize-none"
              placeholder="Enter answer"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-foreground-950/60 font-medium">Category</label>
              <input
                type="text"
                value={newForm.category}
                onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                className="w-full bg-surface-900 border border-border-subtle rounded-lg px-3 py-2 text-sm text-foreground-950 focus:outline-none focus:border-primary-500/50"
                placeholder="e.g. billing, installation"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-foreground-950/60 font-medium">Sort Order</label>
              <input
                type="number"
                value={newForm.sortOrder}
                onChange={(e) => setNewForm({ ...newForm, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full bg-surface-900 border border-border-subtle rounded-lg px-3 py-2 text-sm text-foreground-950 focus:outline-none focus:border-primary-500/50"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={createEntry}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-primary-500 text-foreground-950 hover:bg-primary-600 transition-all"
            >
              Create
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-foreground-950/5 text-foreground-950/60 hover:text-foreground-950 hover:bg-foreground-950/10 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-surface-800 border border-border-subtle rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-900 border-b border-border-subtle text-foreground-950/60">
            <tr>
              <th className="px-6 py-4 font-medium">Question</th>
              <th className="px-6 py-4 font-medium">Locale</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Sort</th>
              <th className="px-6 py-4 font-medium">Active</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filteredEntries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-foreground-950/30">
                  No FAQ entries found.
                </td>
              </tr>
            )}
            {filteredEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-surface-900/50 transition-colors">
                <td className="px-6 py-4">
                  {editingId === entry.id ? (
                    <input
                      type="text"
                      value={editForm.question}
                      onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                      className="w-full bg-surface-900 border border-border-subtle rounded px-2 py-1 text-sm text-foreground-950"
                    />
                  ) : (
                    <span className="text-foreground-950 font-medium line-clamp-1">{entry.question}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-mono uppercase text-foreground-950/50">{entry.locale}</span>
                </td>
                <td className="px-6 py-4">
                  {editingId === entry.id ? (
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full bg-surface-900 border border-border-subtle rounded px-2 py-1 text-sm text-foreground-950"
                    />
                  ) : (
                    <span className="text-foreground-950/60">{entry.category || '—'}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === entry.id ? (
                    <input
                      type="number"
                      value={editForm.sortOrder}
                      onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-20 bg-surface-900 border border-border-subtle rounded px-2 py-1 text-sm text-foreground-950"
                    />
                  ) : (
                    <span className="text-foreground-950/60">{entry.sortOrder}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(entry)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                      entry.active
                        ? 'bg-secondary-500/20 text-secondary-400 border border-secondary-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {entry.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {editingId === entry.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(entry)}
                          className="p-1.5 text-secondary-400 hover:bg-secondary-500/10 rounded-lg transition-colors"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(entry)}
                          className="p-1.5 text-foreground-950/40 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {confirmDelete === entry.id ? (
                          <>
                            <button
                              onClick={() => handleDelete(entry)}
                              disabled={deleting === entry.id}
                              className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Confirm delete"
                            >
                              {deleting === entry.id ? '...' : <Check className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="p-1.5 text-foreground-950/40 hover:text-foreground-950/60 rounded-lg transition-colors"
                              title="Cancel delete"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(entry.id)}
                            className="p-1.5 text-foreground-950/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
