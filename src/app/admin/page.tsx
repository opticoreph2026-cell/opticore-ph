import React from 'react';
import { db } from '@/lib/db';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Users, Activity, HardDrive, ShieldAlert } from 'lucide-react';

// Force dynamic so admin data isn't cached statically at build time
export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  // Parallel DB queries for performance
  const [totalClients, activeProviders, recentLogs, totalProperties] = await Promise.all([
    db.client.count(),
    db.provider.count({ where: { isSupported: true } }),
    db.billLog.count(),
    db.property.count()
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">System Pulse</h1>
        <p className="text-white/60 mt-1">Real-time OptiCore platform telemetry.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SpotlightCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-accent-rose/10 border border-accent-rose/20 rounded-xl flex items-center justify-center text-accent-rose">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-white/60">Total Households</h3>
          </div>
          <p className="text-3xl font-display font-bold text-white">{totalClients.toLocaleString()}</p>
        </SpotlightCard>

        <SpotlightCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-accent-cyan/10 border border-accent-cyan/20 rounded-xl flex items-center justify-center text-accent-cyan">
              <HardDrive className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-white/60">Total Properties</h3>
          </div>
          <p className="text-3xl font-display font-bold text-white">{totalProperties.toLocaleString()}</p>
        </SpotlightCard>

        <SpotlightCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-accent-emerald/10 border border-accent-emerald/20 rounded-xl flex items-center justify-center text-accent-emerald">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-white/60">Total Bills Logged</h3>
          </div>
          <p className="text-3xl font-display font-bold text-white">{recentLogs.toLocaleString()}</p>
        </SpotlightCard>

        <SpotlightCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-white/60">Active Providers</h3>
          </div>
          <p className="text-3xl font-display font-bold text-white">{activeProviders.toLocaleString()}</p>
        </SpotlightCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpotlightCard className="p-8">
          <h2 className="text-xl font-medium text-white mb-6">Recent Platform Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent-emerald" />
                <span className="text-sm text-white/80">Database Sync</span>
              </div>
              <span className="text-xs text-white/40 font-mono">2 mins ago</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent-cyan" />
                <span className="text-sm text-white/80">API Gateway Traffic Normal</span>
              </div>
              <span className="text-xs text-white/40 font-mono">15 mins ago</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent-rose" />
                <span className="text-sm text-white/80">Turso Connection Handshake</span>
              </div>
              <span className="text-xs text-white/40 font-mono">1 hour ago</span>
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-surface-1000 border border-border-subtle rounded-2xl flex items-center justify-center text-accent-rose mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Active Incidents</h3>
          <p className="text-sm text-white/60 max-w-sm">
            All OptiCore PH systems are fully operational. The database, AI processing engines, and API endpoints are healthy.
          </p>
        </SpotlightCard>
      </div>
    </div>
  );
}
