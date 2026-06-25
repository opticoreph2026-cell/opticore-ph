import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import {
  Users,
  Briefcase,
  TrendingUp,
  Handshake,
  ArrowRight,
  PlusCircle,
  Calculator,
  Package,
  ChevronRight,
  FileText,
} from 'lucide-react';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getStats() {
  const [newLeads, qualified, quoteSent, activeProjects, commissioned] = await Promise.all([
    db.energyLead.count({ where: { status: 'new' } }),
    db.energyLead.count({ where: { status: 'qualified' } }),
    db.energyLead.count({ where: { status: 'quote_sent' } }),
    db.energyProject.count({ where: { status: { in: ['scheduled', 'in_progress'] } } }),
    db.energyProject.count({ where: { status: 'commissioned' } }),
  ]);
  return { newLeads, qualified, quoteSent, activeProjects, commissioned };
}

async function getRecentLeads() {
  return db.energyLead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      fullName: true,
      city: true,
      status: true,
      createdAt: true,
      customerType: true,
    },
  });
}

const statusColors: Record<string, string> = {
  new: 'bg-[#06B6D4]/15 text-[#06B6D4]',
  contacted: 'bg-accent-cyan/15 text-accent-cyan',
  site_visit_scheduled: 'bg-purple-500/15 text-purple-400',
  site_visit_done: 'bg-purple-500/25 text-purple-300',
  qualified: 'bg-[#10B981]/15 text-[#10B981]',
  quote_sent: 'bg-blue-500/15 text-blue-400',
  negotiating: 'bg-amber-500/15 text-amber-400',
  won: 'bg-[#10B981]/20 text-[#10B981] font-semibold',
  lost: 'bg-accent-rose/15 text-accent-rose',
  disqualified: 'bg-white/5 text-white/30',
  converted: 'bg-[#10B981]/20 text-[#10B981] font-semibold',
};

const statusLabel: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  site_visit_scheduled: 'Site Visit Scheduled',
  site_visit_done: 'Site Visit Done',
  qualified: 'Qualified',
  quote_sent: 'Quote Sent',
  negotiating: 'Negotiating',
  won: 'Won',
  lost: 'Lost',
  disqualified: 'Disqualified',
  converted: 'Converted',
};

export default async function CrmDashboard() {
  const session = await getSession();
  const role = session?.role as string;
  const isOwner = role === 'opticore_owner';
  const name = (session as any)?.name || session?.email || 'Team';

  const [stats, recentLeads] = await Promise.all([
    getStats(),
    getRecentLeads(),
  ]);

  const firstName = String(name).split(' ')[0];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Here's what's happening at OptiCore Energy Solutions today.
          </p>
        </div>
        <Link
          href="/crm/leads"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-blue text-white text-sm font-semibold hover:bg-accent-blue/90 transition-colors shadow-lg shadow-accent-blue/20"
        >
          <PlusCircle className="w-4 h-4" />
          New Lead
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: 'New Leads',
            value: stats.newLeads,
            icon: Users,
            color: 'text-[#06B6D4]',
            bg: 'bg-[#06B6D4]/10',
            href: '/crm/leads',
          },
          {
            label: 'Qualified',
            value: stats.qualified,
            icon: TrendingUp,
            color: 'text-accent-cyan',
            bg: 'bg-accent-cyan/10',
            href: '/crm/leads',
          },
          {
            label: 'Quote Sent',
            value: stats.quoteSent,
            icon: FileText,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            href: '/crm/quotations',
          },
          {
            label: 'Active Projects',
            value: stats.activeProjects,
            icon: Briefcase,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            href: '/crm/projects',
          },
          {
            label: 'Commissioned',
            value: stats.commissioned,
            icon: Handshake,
            color: 'text-[#10B981]',
            bg: 'bg-[#10B981]/10',
            href: '/crm/projects',
          },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group bg-[#0F0F14] border border-white/5 rounded-2xl p-5 hover:border-white/10 hover:bg-[#16161D] transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-3xl font-bold text-white font-display">{stat.value}</p>
            <p className="text-sm text-white/40 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2 bg-[#0F0F14] border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h2 className="font-display font-semibold text-white">Recent Leads</h2>
            <Link
              href="/crm/leads"
              className="text-xs text-[#06B6D4] hover:text-[#06B6D4]/80 flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-sm text-white/30">No leads yet</p>
              <Link
                href="/crm/leads"
                className="mt-4 inline-flex items-center gap-2 text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Add your first lead
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentLeads.map((lead: typeof recentLeads[number]) => (
                <Link
                  key={lead.id}
                  href={`/crm/leads`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-cyan/20 flex items-center justify-center text-sm font-bold text-white/60">
                      {lead.fullName?.charAt(0) ?? '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                        {lead.fullName}
                      </p>
                      <p className="text-xs text-white/30 capitalize">
                        {lead.city} · {lead.customerType?.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                        statusColors[lead.status ?? 'new'] ?? 'bg-white/5 text-white/40'
                      }`}
                    >
                      {statusLabel[lead.status ?? 'new'] ?? lead.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-[#0F0F14] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="font-display font-semibold text-white">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              {[
                { href: '/crm/leads', label: 'Add New Lead', icon: Users, color: 'text-[#06B6D4]' },
                { href: '/crm/designs/new', label: 'Start ROI Design', icon: Calculator, color: 'text-accent-blue' },
                { href: '/crm/projects', label: 'View Projects', icon: Briefcase, color: 'text-purple-400' },
                ...(isOwner
                  ? [{ href: '/crm/inventory', label: 'Manage Inventory', icon: Package, color: 'text-[#10B981]' }]
                  : []),
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 hover:border-white/10 transition-all group"
                >
                  <action.icon className={`w-4 h-4 ${action.color} flex-shrink-0`} />
                  <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                    {action.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 ml-auto transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Pipeline status */}
          <div className="bg-[#0F0F14] border border-white/5 rounded-2xl p-6">
            <h3 className="font-semibold text-white text-sm mb-4">Pipeline Health</h3>
            <div className="space-y-3">
              {[
                { label: 'New → Contacted', pct: stats.newLeads > 0 ? 100 : 0, color: 'bg-[#06B6D4]' },
                { label: 'Site Visit Done', pct: stats.qualified > 0 ? 60 : 0, color: 'bg-purple-500' },
                { label: 'Quote Sent', pct: stats.quoteSent > 0 ? 40 : 0, color: 'bg-blue-500' },
                { label: 'Won / Commissioned', pct: stats.commissioned > 0 ? 20 : 0, color: 'bg-[#10B981]' },
              ].map((stage) => (
                <div key={stage.label}>
                  <div className="flex justify-between text-xs text-white/40 mb-1">
                    <span>{stage.label}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stage.color} rounded-full transition-all duration-700`}
                      style={{ width: `${stage.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
