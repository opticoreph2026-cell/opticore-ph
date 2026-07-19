'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface DismissButtonProps {
  id: string;
  isRead: boolean;
}

export function DismissButton({ id, isRead }: DismissButtonProps) {
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (dismissed) return null;

  const handleDismiss = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/alerts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setDismissed(true);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDismiss}
      disabled={loading}
      className="p-1 text-foreground-950/20 hover:text-accent-rose transition-colors rounded disabled:opacity-40"
      title="Dismiss"
    >
      <X className="w-4 h-4" />
    </button>
  );
}
