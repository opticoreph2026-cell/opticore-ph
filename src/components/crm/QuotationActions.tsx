'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface QuotationActionsProps {
  quotationId: string;
  currentStatus: string;
}

const STATUS_ACTIONS: Record<string, { label: string; nextStatus: string; variant: string }[]> = {
  draft: [
    { label: 'Send to Customer', nextStatus: 'sent', variant: 'primary' },
  ],
  sent: [
    { label: 'Mark Accepted', nextStatus: 'accepted', variant: 'success' },
    { label: 'Mark Rejected', nextStatus: 'rejected', variant: 'danger' },
  ],
  expired: [
    { label: 'Re-send', nextStatus: 'sent', variant: 'primary' },
  ],
};

export function QuotationActions({ quotationId, currentStatus }: QuotationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const actions = STATUS_ACTIONS[currentStatus] || [];

  const handleAction = async (nextStatus: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/energy/quotations/${quotationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (actions.length === 0) return null;

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-accent-rose bg-accent-rose/10 px-3 py-2 rounded-lg">{error}</p>
      )}
      <div className="flex gap-2">
        {actions.map((action) => (
          <button
            key={action.nextStatus}
            onClick={() => handleAction(action.nextStatus)}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
              action.variant === 'primary'
                ? 'bg-accent-blue text-white hover:bg-accent-blue/90'
                : action.variant === 'success'
                ? 'bg-accent-emerald text-white hover:bg-accent-emerald/90'
                : 'bg-accent-rose text-white hover:bg-accent-rose/90'
            }`}
          >
            {loading ? 'Updating...' : action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
