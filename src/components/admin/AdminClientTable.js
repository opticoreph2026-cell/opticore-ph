'use client';

import { useState } from 'react';
import { Edit2, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';

export default function AdminClientTable({ clients }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleUpdatePlan(id, plan) {
    if (!confirm(`Are you sure you want to change this user's plan to ${plan.toUpperCase()}? This will be recorded in the financial inventory.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${id}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });

      if (res.ok) {
        setEditingId(null);
        router.refresh();
      } else {
        alert('Failed to update plan. Please try again.');
      }
    } catch (err) {
      alert('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-white/[0.02] text-[10px] font-black text-text-faint uppercase tracking-widest border-b border-white/[0.04]">
            <th className="px-6 py-4">Client</th>
            <th className="px-6 py-4">Current Plan</th>
            <th className="px-6 py-4">Last Active</th>
            <th className="px-6 py-4 text-center">Scans</th>
            <th className="px-6 py-4 text-center">Tokens</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {clients.map((c) => (
            <tr key={c.id} className="hover:bg-white/[0.01] transition-colors group">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-bold text-text-primary">{c.name || 'Anonymous'}</span>
                  <span className="text-[11px] text-text-faint">{c.email}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                {editingId === c.id ? (
                  <div className="flex items-center gap-2">
                    <select 
                      className="bg-surface-800 border border-white/10 rounded px-2 py-1 text-xs text-text-primary outline-none focus:border-brand-500/50"
                      defaultValue={c.planTier}
                      onChange={(e) => handleUpdatePlan(c.id, e.target.value)}
                      disabled={loading}
                    >
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                      <option value="business">Business</option>
                    </select>
                    {loading && <Loader2 className="w-3 h-3 animate-spin text-brand-400" />}
                  </div>
                ) : (
                  <span className={clsx(
                    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    c.planTier === 'pro' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                    c.planTier === 'business' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    "bg-white/5 text-text-muted border border-white/10"
                  )}>
                    {c.planTier}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-[11px] text-text-muted">
                {c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleDateString() : 'Never'}
              </td>
              <td className="px-6 py-4 text-center font-mono font-bold text-blue-400 text-xs">
                {c.scanCount || 0}
              </td>
              <td className="px-6 py-4 text-center font-mono text-text-faint text-xs">
                {(c.totalTokensUsed || 0).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => setEditingId(editingId === c.id ? null : c.id)}
                  className="p-2 rounded-lg bg-white/5 text-text-muted hover:bg-brand-500/20 hover:text-brand-400 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
          {clients.length === 0 && (
            <tr><td colSpan="3" className="px-6 py-10 text-center text-text-faint italic">No clients registered yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
