import React from 'react';
import { db } from '@/lib/db';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Zap, Search, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminProvidersPage() {
  const providers = await db.provider.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            <Zap className="w-8 h-8 text-accent-emerald" />
            Utility Providers
          </h1>
          <p className="text-white/60 mt-1">Manage power distributors, regional co-ops, and global baselines.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search providers..." 
              className="w-full md:w-48 bg-surface-1000 border border-border-subtle rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent-emerald transition-colors"
            />
          </div>
          <button className="flex items-center justify-center w-10 h-10 bg-accent-emerald/10 hover:bg-accent-emerald/20 border border-accent-emerald/20 text-accent-emerald rounded-xl transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <SpotlightCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-white/[0.02]">
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Provider Name</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider text-right">Rates (₱/kWh)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {providers.map((provider: any) => (
                <tr key={provider.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-1000 border border-border-subtle flex items-center justify-center text-xs font-bold text-accent-emerald">
                        {provider.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{provider.name}</p>
                        <p className="text-xs text-white/40 font-mono">ID: {provider.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {provider.isSupported ? (
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-accent-emerald/10 border border-accent-emerald/20 text-[10px] font-bold uppercase tracking-widest text-accent-emerald">
                        Supported
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-surface-1000 border border-border-subtle text-[10px] font-bold uppercase tracking-widest text-white/40">
                        Unsupported
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <p className="text-sm font-medium text-white">₱{(provider.currentRate / 10000).toFixed(4)}</p>
                  </td>
                </tr>
              ))}
              
              {providers.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-white/60 text-sm">
                    No providers configured yet.
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
