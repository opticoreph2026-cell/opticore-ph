'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface DeleteClientButtonProps {
  clientId: string;
  clientEmail: string;
}

export function DeleteClientButton({ clientId, clientEmail }: DeleteClientButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setConfirming(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="p-1.5 rounded-lg text-foreground-950/30 hover:text-accent-rose hover:bg-accent-rose/10 transition-colors"
        title="Delete user"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-border-subtle rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground-950 mb-2">Delete User</h3>
            <p className="text-sm text-foreground-950/60 mb-6">
              Are you sure you want to delete <strong className="text-foreground-950">{clientEmail}</strong>?
              This action cannot be undone. Their profile and account data will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setConfirming(false); setLoading(false); }}
                disabled={loading}
                className="px-4 py-2 text-sm text-foreground-950/60 hover:text-foreground-950 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-foreground-950 bg-accent-rose rounded-xl hover:bg-accent-rose/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
