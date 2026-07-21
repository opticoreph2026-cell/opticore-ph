'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/swr-fetcher';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Users, Zap, Package, TrendingUp } from 'lucide-react';

interface AdminData {
  totalClients: number;
  totalLeads: number;
  activeProjects: number;
  totalInventory: number;
  recentLeads: { id: string; fullName: string; status: string; customerType: string; createdAt: string }[];
}

export function AdminStats({ initialData }: { initialData: AdminData }) {
  const { data } = useSWR<AdminData>('/api/dashboard/admin', fetcher, {
    refreshInterval: 60_000,
    fallbackData: initialData,
  });

  const { totalClients, totalLeads, activeProjects, totalInventory, recentLeads } = data!;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground-50 tracking-tight">System Pulse</h1>
        <p className="text-foreground-50/60 mt-1">OptiCore Energy Solutions — platform overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SpotlightCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-accent-rose/10 border border-accent-rose/20 rounded-xl flex items-center justify-center text-accent-rose">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-foreground-50/60">Total Users</h3>
          </div>
          <p className="text-3xl font-display font-bold text-foreground-50">{totalClients.toLocaleString()}</p>
        </SpotlightCard>

        <SpotlightCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-accent-cyan/10 border border-accent-cyan/20 rounded-xl flex items-center justify-center text-accent-cyan">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-foreground-50/60">Total Leads</h3>
          </div>
          <p className="text-3xl font-display font-bold text-foreground-50">{totalLeads.toLocaleString()}</p>
        </SpotlightCard>

        <SpotlightCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-accent-cyan/10 border border-accent-cyan/20 rounded-xl flex items-center justify-center text-accent-cyan">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-foreground-50/60">Active Projects</h3>
          </div>
          <p className="text-3xl font-display font-bold text-foreground-50">{activeProjects.toLocaleString()}</p>
        </SpotlightCard>

        <SpotlightCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-accent-emerald/10 border border-accent-emerald/20 rounded-xl flex items-center justify-center text-accent-emerald">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-foreground-50/60">Inventory Units</h3>
          </div>
          <p className="text-3xl font-display font-bold text-foreground-50">{totalInventory.toLocaleString()}</p>
        </SpotlightCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpotlightCard className="p-8">
          <h2 className="text-xl font-medium text-foreground-50 mb-6">Recent Leads</h2>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-foreground-50/40 text-center py-6">No leads yet.</p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-3 border-b border-foreground-950/10 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent-cyan" />
                    <div>
                      <span className="text-sm text-foreground-50/80">{lead.fullName}</span>
                      <span className="ml-2 text-xs text-foreground-50/40 capitalize">{lead.customerType.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <span className="text-xs text-foreground-50/40 font-mono capitalize">{lead.status.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </SpotlightCard>

        <SpotlightCard className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-background-950 border border-foreground-950/10 rounded-2xl flex items-center justify-center text-accent-emerald mb-4">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-foreground-50 mb-2">All Systems Operational</h3>
          <p className="text-sm text-foreground-50/60 max-w-sm">
            OptiCore Energy Solutions platform is running normally. Database, API routes, and design engine are healthy.
          </p>
        </SpotlightCard>
      </div>
    </div>
  );
}
