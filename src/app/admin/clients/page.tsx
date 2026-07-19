import React from 'react';
import { db } from '@/lib/db';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Users, Search, CheckCircle2, XCircle } from 'lucide-react';
import { InlineToggle } from '@/components/admin/InlineToggle';
import { DeleteClientButton } from '@/components/admin/DeleteClientButton';

export const dynamic = 'force-dynamic';

export default async function AdminClientsPage() {
  const clients = await db.client.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      suspended: true,
      createdAt: true,
    },
  });

  const roleColors: Record<string, string> = {
    opticore_owner: 'bg-accent-rose/10 text-accent-rose border border-accent-rose/20',
    opticore_staff: 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20',
    partner_admin: 'bg-purple-400/10 text-purple-400 border border-purple-400/20',
    partner_installer: 'bg-blue-400/10 text-blue-400 border border-blue-400/20',
    customer: 'bg-foreground-950/5 text-foreground-950/60 border border-foreground-950/10',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground-950 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-accent-cyan" />
            Users
          </h1>
          <p className="text-foreground-950/60 mt-1">Manage all OptiCore platform accounts.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-950/40" />
          <input
            type="text"
            placeholder="Search by email..."
            className="w-full md:w-64 bg-surface-1000 border border-border-subtle rounded-xl pl-10 pr-4 py-2 text-sm text-foreground-950 focus:outline-none focus:border-accent-cyan transition-colors"
          />
        </div>
      </div>

      <SpotlightCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-foreground-950/[0.02]">
                <th className="p-4 text-xs font-semibold text-foreground-950/60 uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-semibold text-foreground-950/60 uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-semibold text-foreground-950/60 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-foreground-950/60 uppercase tracking-wider">Actions</th>
                <th className="p-4 text-xs font-semibold text-foreground-950/60 uppercase tracking-wider text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {clients.map((client: { id: string; email: string; name: string | null; role: string; suspended: boolean; createdAt: Date }) => (
                <tr key={client.id} className="hover:bg-foreground-950/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-1000 border border-border-subtle flex items-center justify-center text-xs font-bold text-accent-cyan">
                        {client.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground-950">{client.name || client.email}</p>
                        <p className="text-xs text-foreground-950/40">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${roleColors[client.role] ?? 'bg-foreground-950/5 text-foreground-950/60 border border-border-subtle'}`}>
                      {client.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {!client.suspended ? (
                        <><CheckCircle2 className="w-4 h-4 text-accent-emerald" /><span className="text-sm text-accent-emerald">Active</span></>
                      ) : (
                        <><XCircle className="w-4 h-4 text-accent-rose" /><span className="text-sm text-accent-rose">Suspended</span></>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <InlineToggle
                        id={client.id}
                        field="suspended"
                        currentValue={client.suspended}
                        apiPath={`/api/admin/clients/${client.id}`}
                        labelTrue="Active"
                        labelFalse="Suspended"
                        colorTrue="text-accent-emerald"
                        colorFalse="text-accent-rose"
                      />
                      <DeleteClientButton clientId={client.id} clientEmail={client.email} />
                    </div>
                  </td>
                  <td className="p-4 text-right text-xs text-foreground-950/40 font-mono">
                    {new Date(client.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}

              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-foreground-950/60 text-sm">
                    No users registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SpotlightCard>
    </div>
  );
}
