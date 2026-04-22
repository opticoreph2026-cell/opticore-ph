'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, Search, Check, Trash2 } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

const TIERS = ['starter', 'pro', 'business'];

export default function AdminClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [upgrading, setUpgrading] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetch('/api/admin/clients')
      .then(r => r.json())
      .then(d => setClients(d.clients ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upgradePlan = async (clientId, tier) => {
    setUpgrading(clientId);
    try {
      const res = await fetch('/api/admin/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, tier }),
      });
      if (res.ok) {
        setClients(prev =>
          prev.map(c => c.id === clientId ? { ...c, planTier: tier } : c)
        );
      }
    } catch { /* ok */ }
    finally { setUpgrading(null); }
  };

  const handleDelete = async (clientId) => {
    if (!confirm('Are you sure you want to permanently delete this client and all their data? This cannot be undone.')) {
      return;
    }

    setDeleting(clientId);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setClients(prev => prev.filter(c => c.id !== clientId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete client.');
      }
    } catch (err) {
      alert('An unexpected error occurred.');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = clients.filter(c =>
    !search ||
    (c.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-up max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-400" />
            Clients
          </h1>
          <p className="text-sm text-text-muted mt-1">{clients.length} total registered clients</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          className="input-field pl-9"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/[0.06]">
                <tr>
                  {['Name', 'Email', 'Current Plan', 'Providers', 'Upgrade To', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs text-text-muted font-medium px-5 py-3.5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-medium text-text-primary whitespace-nowrap">
                      {c.name ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-text-muted">{c.email ?? '—'}</td>
                    <td className="px-5 py-4 text-xs">
                      <span className={`stat-badge ${
                        c.planTier === 'business' ? 'stat-badge-amber' :
                        c.planTier === 'pro'      ? 'stat-badge-blue'  :
                        'bg-surface-700 text-text-muted border border-white/[0.06]'
                      }`}>
                        {c.planTier ?? 'starter'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-text-muted text-xs">
                      {[c.electricityProviderId, c.waterProviderId]
                        .filter(Boolean).length} set
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {TIERS.filter(t => t !== (c.planTier ?? 'starter')).map(tier => (
                          <button
                            key={tier}
                            onClick={() => upgradePlan(c.id, tier)}
                            disabled={upgrading === c.id}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium
                                       bg-brand-500/10 text-brand-300 border border-brand-500/20
                                       hover:bg-brand-500/20 transition-colors disabled:opacity-50"
                          >
                            {upgrading === c.id ? (
                              <Spinner size="sm" className="w-3 h-3" />
                            ) : (
                              <TrendingUp className="w-3 h-3" />
                            )}
                            {tier}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deleting === c.id || c.role === 'admin'}
                        className="p-2 rounded-lg text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        title={c.role === 'admin' ? "Cannot delete an admin" : "Delete Client"}
                      >
                        {deleting === c.id ? (
                          <Spinner size="sm" className="w-4 h-4" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-sm text-text-muted text-center py-10">
              {search ? 'No clients match your search.' : 'No clients yet.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
