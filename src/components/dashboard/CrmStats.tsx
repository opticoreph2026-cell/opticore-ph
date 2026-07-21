'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { fetcher } from '@/lib/swr-fetcher';
import {
  Users, Briefcase, TrendingUp, Handshake, ArrowRight, PlusCircle,
  Calculator, Package, ChevronRight, FileText,
} from 'lucide-react';

interface LeadSummary {
  id: string; fullName: string; city: string | null; status: string;
  createdAt: string; customerType: string;
}

interface CrmData {
  newLeads: number; qualified: number; quoteSent: number;
  activeProjects: number; commissioned: number;
  recentLeads: LeadSummary[];
}

const statusColors: Record<string, string> = {
  new: 'bg-accent-cyan/15 text-accent-cyan',
  contacted: 'bg-accent-cyan/15 text-accent-cyan',
  site_visit_scheduled: 'bg-purple-500/15 text-purple-400',
  site_visit_done: 'bg-purple-500/25 text-purple-300',
  qualified: 'bg-accent-emerald/15 text-accent-emerald',
  quote_sent: 'bg-blue-500/15 text-blue-400',
  negotiating: 'bg-amber-500/15 text-amber-400',
  won: 'bg-accent-emerald/20 text-accent-emerald font-semibold',
  lost: 'bg-accent-rose/15 text-accent-rose',
  disqualified: 'bg-foreground-950/5 text-foreground-950/30',
  converted: 'bg-accent-emerald/20 text-accent-emerald font-semibold',
};

const statusLabel: Record<string, string> = {
  new: 'New', contacted: 'Contacted', site_visit_scheduled: 'Site Visit Scheduled',
  site_visit_done: 'Site Visit Done', qualified: 'Qualified', quote_sent: 'Quote Sent',
  negotiating: 'Negotiating', won: 'Won', lost: 'Lost', disqualified: 'Disqualified', converted: 'Converted',
};

export function CrmStats({ initialData, firstName, isOwner }: { initialData: CrmData; firstName: string; isOwner: boolean }) {
  const { data } = useSWR<CrmData>('/api/dashboard/crm', fetcher, {
    refreshInterval: 15_000,
    fallbackData: initialData,
  });

  const stats = data!;
  const recentLeads = stats.recentLeads;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground-950">
            Good morning, {firstName}
          </h1>
          <p className="text-sm text-foreground-950/40 mt-1">
            Here&apos;s what&apos;s happening at OptiCore Energy Solutions today.
          </p>
        </div>
        <Link
          href="/crm/leads"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-background-50 text-sm font-semibold hover:bg-primary-600 transition-all duration-200 shadow-lg shadow-primary-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          New Lead
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'New Leads', value: stats.newLeads, icon: Users, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10', href: '/crm/leads' },
          { label: 'Qualified', value: stats.qualified, icon: TrendingUp, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10', href: '/crm/leads' },
          { label: 'Quote Sent', value: stats.quoteSent, icon: FileText, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10', href: '/crm/quotations' },
          { label: 'Active Projects', value: stats.activeProjects, icon: Briefcase, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10', href: '/crm/projects' },
          { label: 'Commissioned', value: stats.commissioned, icon: Handshake, color: 'text-accent-emerald', bg: 'bg-accent-emerald/10', href: '/crm/projects' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="group bg-background-100 border border-foreground-950/10 rounded-2xl p-5 hover:border-foreground-950/20 hover:bg-background-200 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <ArrowRight className="w-4 h-4 text-foreground-950/20 group-hover:text-foreground-950/50 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-3xl font-bold text-foreground-950 font-display">{stat.value}</p>
            <p className="text-sm text-foreground-950/50 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-background-100 border border-foreground-950/10 rounded-2xl overflow-hidden hover:border-foreground-950/20 transition-all duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-foreground-950/10">
            <h2 className="font-display font-semibold text-foreground-950">Recent Leads</h2>
            <Link href="/crm/leads"
              className="text-xs text-accent-cyan hover:text-accent-cyan/80 flex items-center gap-1 transition-colors"
            >View all <ChevronRight className="w-3 h-3" /></Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-foreground-950/10 mx-auto mb-3" />
              <p className="text-sm text-foreground-950/30">No leads yet</p>
              <Link href="/crm/leads"
                className="mt-4 inline-flex items-center gap-2 text-sm text-accent-cyan hover:text-accent-cyan/80 transition-colors"
              ><PlusCircle className="w-4 h-4" /> Add your first lead</Link>
            </div>
          ) : (
            <div className="divide-y divide-foreground-950/10">
              {recentLeads.map((lead) => (
                <Link key={lead.id} href="/crm/leads"
                  className="flex items-center justify-between px-6 py-4 hover:bg-foreground-950/3 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-cyan/20 flex items-center justify-center text-sm font-bold text-foreground-950/60">
                      {lead.fullName?.charAt(0) ?? '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground-950/90 group-hover:text-foreground-950 transition-colors">{lead.fullName}</p>
                      <p className="text-xs text-foreground-950/40 capitalize">{lead.city} · {lead.customerType?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                        statusColors[lead.status ?? 'new'] ?? 'bg-foreground-950/5 text-foreground-950/40'
                      }`}
                    >{statusLabel[lead.status ?? 'new'] ?? lead.status}</span>
                    <ChevronRight className="w-4 h-4 text-foreground-950/20 group-hover:text-foreground-950/50 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-background-100 border border-foreground-950/10 rounded-2xl overflow-hidden hover:border-foreground-950/20 transition-all duration-200">
            <div className="px-6 py-4 border-b border-foreground-950/10">
              <h2 className="font-display font-semibold text-foreground-950">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              {[
                { href: '/crm/leads', label: 'Add New Lead', icon: Users, color: 'text-accent-cyan' },
                { href: '/crm/designs/new', label: 'Start ROI Design', icon: Calculator, color: 'text-accent-cyan' },
                { href: '/crm/projects', label: 'View Projects', icon: Briefcase, color: 'text-accent-emerald' },
                ...(isOwner
                  ? [{ href: '/crm/inventory', label: 'Manage Inventory', icon: Package, color: 'text-accent-emerald' }]
                  : []),
              ].map((action) => (
                <Link key={action.href} href={action.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-foreground-950/3 hover:bg-foreground-950/5 border border-foreground-950/10 hover:border-foreground-950/20 transition-all group"
                >
                  <action.icon className={`w-4 h-4 ${action.color} flex-shrink-0`} />
                  <span className="text-sm font-medium text-foreground-950/70 group-hover:text-foreground-950 transition-colors">{action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-foreground-950/20 group-hover:text-foreground-950/50 ml-auto transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-background-100 border border-foreground-950/10 rounded-2xl p-6 hover:border-foreground-950/20 transition-all duration-200">
            <h3 className="font-semibold text-foreground-950 text-sm font-display mb-4">Pipeline Health</h3>
            <div className="space-y-3">
              {[
                { label: 'New → Contacted', pct: stats.newLeads > 0 ? 100 : 0, color: 'bg-accent-cyan' },
                { label: 'Site Visit Done', pct: stats.qualified > 0 ? 60 : 0, color: 'bg-accent-cyan' },
                { label: 'Quote Sent', pct: stats.quoteSent > 0 ? 40 : 0, color: 'bg-accent-cyan' },
                { label: 'Won / Commissioned', pct: stats.commissioned > 0 ? 20 : 0, color: 'bg-accent-emerald' },
              ].map((stage) => (
                <div key={stage.label}>
                  <div className="flex justify-between text-xs text-foreground-950/50 mb-1"><span>{stage.label}</span></div>
                  <div className="h-1.5 bg-foreground-950/5 rounded-full overflow-hidden">
                    <div className={`h-full ${stage.color} rounded-full transition-all duration-700`} style={{ width: `${stage.pct}%` }} />
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
