'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Check, X, Edit2 } from 'lucide-react';
import { AddProductDialog } from './AddProductDialog';
import { InlinePriceEdit } from './InlinePriceEdit';

interface ProductRow {
  id: string;
  modelName: string;
  sku: string;
  unitPrice: number;
  isPriceConfirmed: boolean;
  _category: string;
  _spec: string;
}

export function CatalogTable({ initialProducts }: { initialProducts: ProductRow[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ modelName: '', sku: '' });
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const startEdit = (p: ProductRow) => {
    setEditingId(p.id);
    setEditForm({ modelName: p.modelName, sku: p.sku });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ modelName: '', sku: '' });
  };

  const saveEdit = async (p: ProductRow) => {
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: p._category, modelName: editForm.modelName, sku: editForm.sku }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, modelName: editForm.modelName, sku: editForm.sku } : x)));
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (p: ProductRow) => {
    setDeleting(p.id);
    try {
      const res = await fetch(`/api/admin/products/${p.id}?category=${p._category}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
      setConfirmDelete(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <AddProductDialog />
      </div>

      <div className="bg-surface-800 border border-border-subtle rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-900 border-b border-border-subtle text-white/60">
            <tr>
              <th className="px-6 py-4 font-medium">Model</th>
              <th className="px-6 py-4 font-medium">SKU</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Specs</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-white/80">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  {editingId === p.id ? (
                    <input
                      type="text"
                      value={editForm.modelName}
                      onChange={(e) => setEditForm({ ...editForm, modelName: e.target.value })}
                      className="w-full bg-surface-1000 border border-border-subtle rounded px-2 py-1 text-sm text-white"
                    />
                  ) : (
                    <span className="font-medium text-white">{p.modelName}</span>
                  )}
                </td>
                <td className="px-6 py-4 font-mono text-xs text-white/60">
                  {editingId === p.id ? (
                    <input
                      type="text"
                      value={editForm.sku}
                      onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                      className="w-full bg-surface-1000 border border-border-subtle rounded px-2 py-1 text-sm text-white font-mono"
                    />
                  ) : (
                    p.sku
                  )}
                </td>
                <td className="px-6 py-4 uppercase text-xs tracking-wider text-accent-cyan">{p._category}</td>
                <td className="px-6 py-4 text-white/60 text-xs">{p._spec}</td>
                <td className="px-6 py-4">
                  <InlinePriceEdit
                    id={p.id}
                    category={p._category as 'inverter' | 'battery' | 'panel'}
                    currentPrice={p.unitPrice}
                    isConfirmed={p.isPriceConfirmed}
                    apiPath={`/api/admin/products/${p.id}`}
                  />
                </td>
                <td className="px-6 py-4">
                  {confirmDelete === p.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={deleting === p.id}
                        className="p-1 text-accent-rose hover:bg-accent-rose/10 rounded transition-colors"
                        title="Confirm delete"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="p-1 text-white/40 hover:text-white rounded transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : editingId === p.id ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => saveEdit(p)} className="p-1 text-accent-emerald hover:bg-accent-emerald/10 rounded transition-colors" title="Save">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={cancelEdit} className="p-1 text-white/40 hover:text-white rounded transition-colors" title="Cancel">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(p)} className="p-1 text-white/40 hover:text-accent-cyan rounded transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(p.id)} className="p-1 text-white/40 hover:text-accent-rose rounded transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-white/40">
                  No products in catalog.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
