'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { 
  Activity, Shield, Terminal, Server, 
  Cpu, Database, Globe, AlertTriangle, 
  CheckCircle2, Clock, RefreshCw, Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { TableSkeleton } from '@/components/ui/Skeleton';
import SpotlightCard from '@/components/ui/SpotlightCard';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminSystemPage() {
  const { data: stats, isLoading: statsLoading } = useSWR('/api/admin/system/stats', fetcher, { refreshInterval: 10000 });
  const { data: audit, isLoading: auditLoading } = useSWR('/api/admin/audit', fetcher, { refreshInterval: 30000 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-20"
    >
      <header>
        <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <Server className="w-6 h-6 text-brand-400" />
          </div>
          System Operations
        </h1>
        <p className="text-sm text-slate-500 mt-2 font-medium">Real-time telemetry, provider status, and audit trails.</p>
      </header>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Database Latency" 
          value={stats?.system?.dbLatency ? `${stats.system.dbLatency}ms` : '...'} 
          sub="Edge to Turso" 
          icon={Database} 
          color="cyan"
          isLoading={statsLoading}
        />
        <StatCard 
          label="AI Token Velocity" 
          value={stats?.totalTokens?.toLocaleString() || '0'} 
          sub="Total tokens processed" 
          icon={Cpu} 
          color="purple"
          isLoading={statsLoading}
        />
        <StatCard 
          label="System Uptime" 
          value={stats?.system?.uptime || '99.9%'} 
          sub="Last 30 days" 
          icon={Activity} 
          color="emerald"
          isLoading={statsLoading}
        />
        <StatCard 
          label="Audit Log Status" 
          value={audit?.logs?.length || '0'} 
          sub="Recent entries cached" 
          icon={Shield} 
          color="amber"
          isLoading={auditLoading}
        />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Provider Status */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="flex items-center gap-3 px-1">
            <Globe className="w-4 h-4 text-brand-400" />
            <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">Provider Mesh</h2>
          </div>
          <SpotlightCard className="p-6 bg-surface-900/50 border-white/[0.04]">
            <div className="space-y-4">
              {stats?.providers?.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <div>
                    <p className="text-sm font-bold text-white">{p.name}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{p.coverage} Support</p>
                  </div>
                  <div className={clsx(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                    p.status === 'operational' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                    p.status === 'beta' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-slate-500/10 text-slate-400 border-slate-500/20"
                  )}>
                    {p.status === 'operational' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {p.status.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </div>

        {/* Audit Log */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex items-center gap-3 px-1">
            <Terminal className="w-4 h-4 text-brand-400" />
            <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">Live Audit Trail</h2>
          </div>
          <SpotlightCard className="p-0 bg-surface-900/50 border-white/[0.04] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02] text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/[0.04]">
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Admin</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {audit?.logs?.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "px-2 py-1 rounded-lg text-[9px] font-black uppercase border",
                          log.action.includes('SUSPEND') ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-brand-500/10 text-brand-400 border-brand-500/20"
                        )}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-white font-medium">{log.adminId.slice(0, 8)}...</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-500 font-medium">{new Date(log.createdAt).toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 transition-all">
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!auditLoading && audit?.logs?.length === 0 && (
              <div className="py-12 text-center">
                <AlertTriangle className="w-8 h-8 text-slate-800 mx-auto mb-3" />
                <p className="text-slate-600 text-sm">No audit logs recorded in this cycle.</p>
              </div>
            )}
            {auditLoading && <TableSkeleton />}
          </SpotlightCard>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color, isLoading }) {
  const colorMap = {
    cyan:    'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    purple:  'text-purple-400 bg-purple-500/10 border-purple-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };

  return (
    <SpotlightCard className="p-6 bg-surface-950/40 backdrop-blur-3xl border-white/[0.04] group hover:border-white/10 transition-all duration-500">
      <div className="flex items-center gap-4 mb-6">
        <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center border", colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{label}</p>
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-white tracking-tighter">
          {isLoading ? '...' : value}
        </p>
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mt-1">{sub}</p>
      </div>
    </SpotlightCard>
  );
}
