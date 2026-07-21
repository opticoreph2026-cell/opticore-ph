'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Pencil, Trash2, X, Search, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'textarea' | 'date';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface AdminTableProps<T> {
  title: string;
  description?: string;
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  createFields?: FieldConfig[];
  editFields?: FieldConfig[];
  onSave?: (item: Partial<T>, id?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  identifierKey?: string;
  pageSize?: number;
  searchKeys?: string[];
  emptyMessage?: string;
}

export function AdminTable<T extends { [key: string]: any }>({
  title,
  description,
  columns,
  data,
  loading,
  error,
  createFields,
  editFields,
  onSave,
  onDelete,
  identifierKey = 'id',
  pageSize = 15,
  searchKeys,
  emptyMessage = 'No records found.',
}: AdminTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const router = useRouter();
  const { error: toastError, success } = useToast();

  const filtered = searchKeys && search
    ? data.filter((item) =>
        searchKeys.some((key) => {
          const val = item[key];
          return val != null && String(val).toLowerCase().includes(search.toLowerCase());
        })
      )
    : data;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const openCreate = () => {
    const initial: Record<string, string> = {};
    if (createFields) {
      for (const f of createFields) {
        initial[f.key] = '';
      }
    }
    setForm(initial);
    setShowCreate(true);
  };

  const openEdit = (item: T) => {
    const initial: Record<string, string> = {};
    const fields = editFields || createFields;
    if (fields) {
      for (const f of fields) {
        initial[f.key] = item[f.key] != null ? String(item[f.key]) : '';
      }
    }
    setForm(initial);
    setEditing(item);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form } as Partial<T>;
      if (editing) {
        await onSave?.(payload, editing[identifierKey] as string);
        success('Updated successfully');
        setEditing(null);
        router.refresh();
      } else {
        await onSave?.(payload, undefined);
        success('Created successfully');
        setShowCreate(false);
        router.refresh();
      }
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await onDelete?.(deleting);
      success('Deleted successfully');
      setDeleting(null);
      router.refresh();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: FieldConfig) => {
    const value = form[field.key] ?? '';

    if (field.type === 'select' && field.options) {
      return (
        <select
          value={value}
          onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
          className="w-full bg-background-900 border border-foreground-950/10 rounded-lg px-3 py-2 text-sm text-foreground-50 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
        >
          <option value="">Select...</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
          placeholder={field.placeholder}
          rows={3}
          className="w-full bg-background-900 border border-foreground-950/10 rounded-lg px-3 py-2 text-sm text-foreground-50 focus:outline-none focus:ring-2 focus:ring-accent-cyan resize-none"
        />
      );
    }

    return (
      <input
        type={field.type}
        value={value}
        onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
        placeholder={field.placeholder}
        required={field.required}
        className="w-full bg-background-900 border border-foreground-950/10 rounded-lg px-3 py-2 text-sm text-foreground-50 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
      />
    );
  };

  const renderModal = (
    open: boolean,
    onClose: () => void,
    fields: FieldConfig[] | undefined,
    onSubmit: () => void,
    submitLabel: string,
  ) => {
    if (!open || !fields) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div
          className="relative bg-background-800 border border-foreground-950/10 rounded-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-foreground-950/5">
            <h3 className="text-lg font-semibold text-foreground-50">{submitLabel}</h3>
            <button onClick={onClose} className="p-1 text-foreground-50/40 hover:text-foreground-50 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-6 py-4 space-y-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-foreground-50/70 mb-1">{field.label}</label>
                {renderField(field)}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-foreground-950/10">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm text-foreground-50/60 hover:text-foreground-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-background-50 bg-primary-500 rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-primary-500/20"
            >
              {saving ? 'Saving...' : submitLabel}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SkeletonRow = () => (
    <tr>
      {columns.map((col) => (
        <td key={col.key} className="px-5 py-4">
          <div className="h-4 bg-foreground-950/5 rounded animate-pulse" style={{ width: col.width || '80px' }} />
        </td>
      ))}
      <td className="px-5 py-4">
        <div className="h-4 w-16 bg-foreground-950/5 rounded animate-pulse" />
      </td>
    </tr>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground-950">{title}</h2>
          {description && <p className="text-sm text-foreground-950/50 mt-0.5">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          {searchKeys && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-950/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                placeholder="Search..."
                className="pl-9 pr-3 py-2 text-sm bg-background-100/40 border border-foreground-950/10 rounded-lg text-foreground-950 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-500 w-48"
              />
            </div>
          )}
          {createFields && onSave && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-background-50 bg-primary-500 rounded-lg hover:bg-primary-600 transition-all duration-200 shadow-lg shadow-primary-500/20"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-accent-rose/10 border border-accent-rose/20 rounded-xl px-5 py-4 text-sm text-accent-rose">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-background-900 border border-foreground-950/10 rounded-xl overflow-hidden hover:border-foreground-950/20 transition-all duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-foreground-950/5 text-xs uppercase text-foreground-50/40">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-5 py-4 font-semibold" style={{ width: col.width }}>
                    {col.label}
                  </th>
                ))}
                {(onSave || onDelete) && <th className="px-5 py-4 font-semibold w-20">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground-950/10">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + ((onSave || onDelete) ? 1 : 0)}
                    className="px-5 py-12 text-center text-foreground-50/40"
                  >
                    {search ? 'No results match your search.' : emptyMessage}
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => (
                  <tr key={item[identifierKey] as string ?? idx} className="hover:bg-foreground-950/3 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-4 text-foreground-50/80">
                        {col.render ? col.render(item) : String(item[col.key] ?? '—')}
                      </td>
                    ))}
                    {(onSave || onDelete) && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {editFields && onSave && (
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1.5 text-foreground-50/40 hover:text-accent-cyan transition-colors rounded-lg hover:bg-foreground-950/5"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => setDeleting(item[identifierKey] as string)}
                              className="p-1.5 text-foreground-50/40 hover:text-accent-rose transition-colors rounded-lg hover:bg-foreground-950/5"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-foreground-950/10">
            <p className="text-xs text-foreground-50/40">
              Showing {(page * pageSize) + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-1.5 text-foreground-50/40 hover:text-foreground-50 disabled:opacity-20 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-foreground-50/40">{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 text-foreground-50/40 hover:text-foreground-50 disabled:opacity-20 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {renderModal(showCreate, () => setShowCreate(false), createFields, handleSave, 'Create')}
      {renderModal(!!editing, () => setEditing(null), editFields || createFields, handleSave, 'Save Changes')}

      {/* Delete Confirmation */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDeleting(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-background-800 border border-foreground-950/10 rounded-2xl w-full max-w-sm mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-rose/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-accent-rose" />
              </div>
              <h3 className="text-lg font-semibold text-foreground-50 mb-2">Confirm Delete</h3>
              <p className="text-sm text-foreground-50/60 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleting(null)}
                  className="px-5 py-2 text-sm text-foreground-50/60 hover:text-foreground-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-5 py-2 text-sm font-semibold text-background-50 bg-accent-rose rounded-lg hover:bg-accent-rose/90 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-accent-rose/20"
                >
                  {saving ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
