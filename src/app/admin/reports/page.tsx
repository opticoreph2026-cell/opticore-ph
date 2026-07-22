import React from 'react';
import { db } from '@/lib/db';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { FileText, Download, TrendingUp, Users, ClipboardList, Zap, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const [
    leads,
    projects,
    designs,
    clients,
    activities,
    leadCount,
    projectCount,
    designCount,
    clientCount,
    customerCount,
    quoteCount,
  ] = await Promise.all([
    db.energyLead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true, fullName: true, email: true, status: true, source: true, customerType: true, createdAt: true,
      },
    }) as any[],
    db.energyProject.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true, status: true, scheduledInstallDate: true, createdAt: true,
        contract: { select: { quotation: { select: { quoteNumber: true } } } },
      },
    }) as any[],
    db.systemDesign.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true, pvArrayKwp: true, pvPanelCount: true, status: true, designPathway: true, createdAt: true,
        site: { select: { address: true, customer: { select: { fullName: true } } } },
      },
    }) as any[],
    db.client.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }) as any[],
    db.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, action: true, description: true, relatedToType: true, createdAt: true },
    }) as any[],
    db.energyLead.count(),
    db.energyProject.count(),
    db.systemDesign.count(),
    db.client.count(),
    db.energyCustomer.count(),
    db.energyQuotation.count(),
  ]);

  const statusColor: Record<string, string> = {
    new: 'text-accent-cyan',     contacted: 'text-accent-cyan', site_visit_scheduled: 'text-accent-amber',
    qualified: 'text-accent-emerald', quote_sent: 'text-accent-cyan', negotiating: 'text-accent-amber',
    won: 'text-accent-emerald', lost: 'text-accent-rose', disqualified: 'text-foreground-950/40',
    draft: 'text-foreground-950/40', finalized: 'text-accent-cyan', approved_by_customer: 'text-accent-emerald',
    scheduled: 'text-accent-cyan', in_progress: 'text-accent-cyan', commissioned: 'text-accent-emerald',
    closed: 'text-foreground-950/40',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground-950 tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-accent-cyan" />
            Platform Reports
          </h1>
          <p className="text-foreground-950/60 mt-1">Pipeline activity, system designs, and operational metrics.</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Leads', value: leadCount, icon: Users, color: 'text-accent-cyan' },
          { label: 'Projects', value: projectCount, icon: Zap, color: 'text-accent-emerald' },
          { label: 'Designs', value: designCount, icon: ClipboardList, color: 'text-accent-cyan' },
          { label: 'Clients', value: clientCount, icon: Users, color: 'text-accent-cyan' },
          { label: 'Customers', value: customerCount, icon: Users, color: 'text-accent-amber' },
          { label: 'Quotations', value: quoteCount, icon: TrendingUp, color: 'text-accent-cyan' },
        ].map((stat) => (
          <SpotlightCard key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold text-foreground-950 font-mono">{stat.value}</p>
                <p className="text-xs text-foreground-950/40">{stat.label}</p>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Activity timeline */}
          <SpotlightCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-foreground-950 flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-cyan" /> Recent Activity
              </h2>
            </div>
            <div className="space-y-3">
              {activities.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl border border-border-subtle bg-background-100">
                  <div className="w-2 h-2 mt-2 rounded-full bg-accent-cyan flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground-950 truncate">{log.description}</p>
                    <p className="text-xs text-foreground-950/40">
                      {log.action} &middot; {log.relatedToType}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-foreground-950/30 flex-shrink-0">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="p-8 text-center border border-dashed border-border-subtle rounded-xl text-foreground-950/40 text-sm">
                  No activity recorded yet.
                </div>
              )}
            </div>
          </SpotlightCard>

          {/* Recent leads */}
          <SpotlightCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-foreground-950 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-cyan" /> Recent Leads
              </h2>
            </div>
            <div className="space-y-4">
              {leads.map((lead) => (
                <div key={lead.id} className="p-4 rounded-xl border border-border-subtle bg-background-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground-950">{lead.fullName}</p>
                      <p className="text-xs text-foreground-950/40">{lead.email ?? 'No email'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${statusColor[lead.status] ?? 'text-foreground-950/60'}`}>
                        {lead.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-mono text-foreground-950/30">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-foreground-950/40">Source: {lead.source} &middot; {lead.customerType}</p>
                </div>
              ))}
              {leads.length === 0 && (
                <div className="p-8 text-center border border-dashed border-border-subtle rounded-xl text-foreground-950/40 text-sm">
                  No leads yet.
                </div>
              )}
            </div>
          </SpotlightCard>

          {/* Recent designs */}
          <SpotlightCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-foreground-950 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-accent-cyan" /> Recent System Designs
              </h2>
            </div>
            <div className="space-y-4">
              {designs.map((design) => (
                <div key={design.id} className="p-4 rounded-xl border border-border-subtle bg-background-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground-950">
                        {design.site?.customer?.fullName ?? 'Unknown'} — {design.pvArrayKwp} kWp
                      </p>
                      <p className="text-xs text-foreground-950/40">
                        {design.site?.address ?? 'No address'} &middot; {design.pvPanelCount} panels
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${statusColor[design.status] ?? 'text-foreground-950/60'}`}>
                        {design.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-mono text-foreground-950/30">
                        {new Date(design.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-foreground-950/40">Pathway: {design.designPathway.replace(/_/g, ' ')}</p>
                </div>
              ))}
              {designs.length === 0 && (
                <div className="p-8 text-center border border-dashed border-border-subtle rounded-xl text-foreground-950/40 text-sm">
                  No system designs yet.
                </div>
              )}
            </div>
          </SpotlightCard>
        </div>

        <div className="space-y-6">
          {/* Projects summary */}
          <SpotlightCard className="p-6">
            <h2 className="text-lg font-medium text-foreground-950 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent-emerald" /> Recent Projects
            </h2>
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="p-3 rounded-xl border border-border-subtle bg-background-100">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground-950">
                      {project.contract?.quotation?.quoteNumber ?? 'No quote'}
                    </p>
                    <span className={`text-xs font-medium ${statusColor[project.status] ?? 'text-foreground-950/60'}`}>
                      {project.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-950/40 mt-1">
                    {project.scheduledInstallDate
                      ? `Install: ${new Date(project.scheduledInstallDate).toLocaleDateString()}`
                      : 'No install date'}
                  </p>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="p-4 text-center border border-dashed border-border-subtle rounded-xl text-foreground-950/40 text-sm">
                  No projects yet.
                </div>
              )}
            </div>
          </SpotlightCard>

          {/* Recent client signups */}
          <SpotlightCard className="p-6">
            <h2 className="text-lg font-medium text-foreground-950 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-cyan" /> New Signups
            </h2>
            <div className="space-y-3">
              {clients.map((client) => (
                <div key={client.id} className="p-3 rounded-xl border border-border-subtle bg-background-100">
                  <p className="text-sm font-medium text-foreground-950 truncate">{client.name ?? client.email}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-foreground-950/40">{client.email}</span>
                    <span className="text-xs font-mono text-foreground-950/30">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {clients.length === 0 && (
                <div className="p-4 text-center border border-dashed border-border-subtle rounded-xl text-foreground-950/40 text-sm">
                  No signups yet.
                </div>
              )}
            </div>
          </SpotlightCard>

          {/* Export */}
          <SpotlightCard className="p-6">
            <h2 className="text-lg font-medium text-foreground-950 mb-4">Export Data</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-border-subtle bg-background-100 hover:bg-foreground-950/5 transition-colors">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-foreground-950/60" />
                  <span className="text-sm text-foreground-950">Leads (CSV)</span>
                </div>
                <Download className="w-4 h-4 text-foreground-950/40" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-border-subtle bg-background-100 hover:bg-foreground-950/5 transition-colors">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-foreground-950/60" />
                  <span className="text-sm text-foreground-950">Project Metrics</span>
                </div>
                <Download className="w-4 h-4 text-foreground-950/40" />
              </button>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
