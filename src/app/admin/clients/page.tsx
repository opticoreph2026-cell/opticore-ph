import React from 'react';
import { db } from '@/lib/db';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Users, Search, CheckCircle2, XCircle, Settings2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminClientsPage() {
  const clients = await db.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      properties: true,
      subscription: true
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-accent-cyan" />
            Households
          </h1>
          <p className="text-white/60 mt-1">Manage and monitor registered OptiCore clients.</p>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text" 
            placeholder="Search by email..." 
            className="w-full md:w-64 bg-surface-1000 border border-border-subtle rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan transition-colors"
          />
        </div>
      </div>

      <SpotlightCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-white/[0.02]">
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Client / Email</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Properties</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Subscription</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {clients.map((client: any) => {
                const isActive = client.subscription?.status === 'active';
                const subTier = client.subscription?.planTier || 'FREE';
                
                return (
                  <tr key={client.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-1000 border border-border-subtle flex items-center justify-center text-xs font-bold text-accent-cyan">
                          {client.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{client.email}</p>
                          <p className="text-xs text-white/40 font-mono">ID: {client.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-surface-1000 border border-border-subtle text-xs font-medium text-white/80">
                        {client.properties.length} Active
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        subTier === 'PRO' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-surface-1000 text-white/60 border border-border-subtle'
                      }`}>
                        {subTier}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <><CheckCircle2 className="w-4 h-4 text-accent-emerald" /><span className="text-sm text-accent-emerald">Active</span></>
                        ) : (
                          <><XCircle className="w-4 h-4 text-white/40" /><span className="text-sm text-white/40">Inactive</span></>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white" title="Manage Client">
                        <Settings2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/60 text-sm">
                    No clients registered yet.
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
