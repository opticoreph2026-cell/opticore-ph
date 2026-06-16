import React from 'react';
import { db } from '@/lib/db';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { FileText, Download, TrendingUp, Cpu } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const aiReports = await db.aIReport.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      property: {
        include: { client: true }
      }
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-accent-cyan" />
            Telemetry Reports
          </h1>
          <p className="text-white/60 mt-1">AI advisory logs, platform diagnostics, and usage metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SpotlightCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-accent-cyan" /> Recent AI Generations
              </h2>
            </div>
            
            <div className="space-y-4">
              {aiReports.map((report: any) => (
                <div key={report.id} className="p-4 rounded-xl border border-border-subtle bg-surface-1000">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-white">Report for {report.property.name}</p>
                      <p className="text-xs text-white/40">Client: {report.property.client.email}</p>
                    </div>
                    <span className="text-xs font-mono text-white/40">{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-white/60 line-clamp-2">{report.content}</p>
                </div>
              ))}

              {aiReports.length === 0 && (
                <div className="p-8 text-center border border-dashed border-border-subtle rounded-xl text-white/40 text-sm">
                  No AI reports generated yet.
                </div>
              )}
            </div>
          </SpotlightCard>
        </div>

        <div className="space-y-6">
          <SpotlightCard className="p-6">
            <h2 className="text-lg font-medium text-white mb-4">Export Data</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-border-subtle bg-surface-1000 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white">Client Roster (CSV)</span>
                </div>
                <Download className="w-4 h-4 text-white/40" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-border-subtle bg-surface-1000 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white">Financial Metrics</span>
                </div>
                <Download className="w-4 h-4 text-white/40" />
              </button>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}

// Ensure Users icon is imported 
import { Users } from 'lucide-react';
