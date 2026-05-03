'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { 
  Users, TrendingUp, Search, Trash2, 
  ShieldAlert, ShieldCheck, Key, RefreshCw, 
  UserX, UserCheck, Mail, Info
} from 'lucide-react';
import { TableSkeleton } from '@/components/ui/Skeleton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { clsx } from 'clsx';

const fetcher = (url) => fetch(url).then((res) => res.json());

const PLAN_BADGES = {
  starter: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  pro: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  negosyo: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  business: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function AdminClientsPage() {
  const { data, error, isLoading } = useSWR('/api/admin/clients', fetcher);
  const [search, setSearch] = useState('');
  
  // Dialog State
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
    targetId: null,
    isDestructive: false,
    confirmText: 'Confirm'
  });

  const clients = data?.clients ?? [];

  const handleAction = async () => {
    if (!dialog.action || !dialog.targetId) return;
    
    try {
      const res = await dialog.action(dialog.targetId);
      if (res.ok) {
        mutate('/api/admin/clients');
        setDialog(prev => ({ ...prev, isOpen: false }));
      } else {
        const err = await res.json();
        alert(err.error || 'Action failed');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const openConfirm = (type, clientId, clientName) => {
    switch (type) {
      case 'DELETE':
        setDialog({
          isOpen: true,
          title: 'Delete Client Account',
          message: `Are you sure you want to permanently delete ${clientName}? This will remove all their utility data and AI reports. This action is IRREVERSIBLE.`,
          action: (id) => fetch(`/api/admin/clients/${id}`, { method: 'DELETE' }),
          targetId: clientId,
          isDestructive: true,
          confirmText: 'Delete Permanently'
        });
        break;
      case 'SUSPEND':
        setDialog({
          isOpen: true,
          title: 'Suspend Account',
          message: `Do you want to suspend ${clientName}? They will be immediately logged out and blocked from accessing their dashboard.`,
          action: (id) => fetch(`/api/admin/clients/${id}/suspend`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ suspend: true })
          }),
          targetId: clientId,
          isDestructive: true,
          confirmText: 'Suspend Account'
        });
        break;
      case 'ACTIVATE':
        setDialog({
          isOpen: true,
          title: 'Reactivate Account',
          message: `Restore access for ${clientName}?`,
          action: (id) => fetch(`/api/admin/clients/${id}/suspend`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ suspend: false })
          }),
          targetId: clientId,
          isDestructive: false,
          confirmText: 'Reactivate'
        });
        break;
      case 'RESET_PWD':
        setDialog({
          isOpen: true,
          title: 'Force Password Reset',
          message: `Send a password reset link to ${clientName}? This will invalidate their current password.`,
          action: (id) => fetch(`/api/admin/clients/${id}/reset-password`, { method: 'POST' }),
          targetId: clientId,
          isDestructive: false,
          confirmText: 'Send Reset Link'
        });
        break;
    }
  };

  const filtered = clients.filter(c =>
    c.role !== 'admin' && (
      !search ||
      (c.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="space-y-8 animate-fade-up">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-brand-400" />
            </div>
            Customer Base
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">Manage user access, tiers, and security status.</p>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            className="w-full bg-surface-900 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all"
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </header>

      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <div className="p-12 text-center bg-rose-500/5 border border-rose-500/10 rounded-[32px]">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <p className="text-rose-400 font-bold uppercase tracking-widest text-xs">Access Error</p>
          <p className="text-slate-500 mt-2 text-sm">Failed to retrieve client manifest. Please try again.</p>
        </div>
      ) : (
        <div className="bento-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/[0.04]">
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Subscription</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Activity</th>
                  <th className="px-6 py-4 text-right">Commands</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((c) => (
                  <tr key={c.id} className={clsx(
                    "group transition-colors",
                    c.suspended ? "bg-rose-500/[0.02] hover:bg-rose-500/[0.04]" : "hover:bg-white/[0.01]"
                  )}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-800 border border-white/10 overflow-hidden shrink-0">
                          {c.avatar ? (
                            <img src={c.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                              {c.name ? c.name[0] : '?'}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={clsx(
                            "font-bold truncate tracking-tight",
                            c.suspended ? "text-slate-500 line-through" : "text-white"
                          )}>
                            {c.name || 'Anonymous User'}
                          </span>
                          <span className="text-xs text-slate-500 truncate">{c.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2 py-1 rounded-lg text-[9px] font-black uppercase border",
                        PLAN_BADGES[c.planTier] || PLAN_BADGES.starter
                      )}>
                        {c.planTier || 'starter'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {c.suspended ? (
                        <div className="flex items-center gap-1.5 text-rose-400">
                          <ShieldAlert className="w-3 h-3" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Suspended</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <ShieldCheck className="w-3 h-3" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Active</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400 font-medium">
                          {c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleDateString() : 'Never'}
                        </span>
                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">
                          Joined {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openConfirm('RESET_PWD', c.id, c.name || c.email)}
                          className="p-2 rounded-xl text-slate-400 hover:bg-amber-500/10 hover:text-amber-400 transition-all"
                          title="Force Password Reset"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        
                        {c.suspended ? (
                          <button
                            onClick={() => openConfirm('ACTIVATE', c.id, c.name || c.email)}
                            className="p-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-all"
                            title="Reactivate Account"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => openConfirm('SUSPEND', c.id, c.name || c.email)}
                            className="p-2 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                            title="Suspend Account"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => openConfirm('DELETE', c.id, c.name || c.email)}
                          className="p-2 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <Users className="w-12 h-12 text-slate-800 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">No clients found matching "{search}"</p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleAction}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        isDestructive={dialog.isDestructive}
      />
    </div>
  );
}
