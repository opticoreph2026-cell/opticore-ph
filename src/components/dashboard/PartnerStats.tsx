'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/swr-fetcher';
import { Briefcase } from 'lucide-react';

interface Milestone { milestone: string; milestoneDate: string; }
interface Project {
  id: string; status: string; scheduledInstallDate: string | null;
  commissioningDate: string | null; createdAt: string;
  contract: { quotation: { customer: { fullName: string } } } | null;
  milestones: Milestone[];
}

interface PartnerData {
  activeCount: number; completedCount: number; scheduledCount: number;
  projects: Project[];
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-accent-cyan/10 text-accent-cyan',
  in_progress: 'bg-accent-cyan/10 text-accent-cyan',
  commissioned: 'bg-accent-emerald/10 text-accent-emerald',
  warranty_registered: 'bg-purple-400/10 text-purple-400',
  closed: 'bg-foreground-950/5 text-foreground-400',
};

export function PartnerStats({ initialData }: { initialData: PartnerData }) {
  const { data } = useSWR<PartnerData>('/api/dashboard/partner', fetcher, {
    refreshInterval: 30_000,
    fallbackData: initialData,
  });

  const { activeCount, completedCount, scheduledCount, projects } = data!;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-accent-emerald/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-accent-cyan/5 blur-3xl pointer-events-none" />
        <h1 className="text-3xl font-display font-bold text-foreground-950 mb-2">My Projects</h1>
        <p className="text-sm text-foreground-950/50">Overview of your installation projects and milestones.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group bg-background-900 p-6 rounded-2xl border border-foreground-950/10 hover:border-foreground-950/20 hover:bg-background-800 transition-all duration-200">
          <div className="text-sm font-medium text-foreground-950/50 mb-1">Active Projects</div>
          <div className="text-4xl font-bold text-accent-cyan font-display">{activeCount}</div>
        </div>
        <div className="group bg-background-900 p-6 rounded-2xl border border-foreground-950/10 hover:border-foreground-950/20 hover:bg-background-800 transition-all duration-200">
          <div className="text-sm font-medium text-foreground-950/50 mb-1">Completed</div>
          <div className="text-4xl font-bold text-accent-emerald font-display">{completedCount}</div>
        </div>
        <div className="group bg-background-900 p-6 rounded-2xl border border-foreground-950/10 hover:border-foreground-950/20 hover:bg-background-800 transition-all duration-200">
          <div className="text-sm font-medium text-foreground-950/50 mb-1">Scheduled</div>
          <div className="text-4xl font-bold text-accent-cyan font-display">{scheduledCount}</div>
        </div>
      </div>

      <div className="bg-background-900 border border-foreground-950/10 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-foreground-950/10">
          <h2 className="text-lg font-bold text-foreground-950 font-display">Installation Projects</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-foreground-950/5 text-xs uppercase text-foreground-950/40">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Install Date</th>
                <th className="px-6 py-4 font-semibold">Milestones</th>
                <th className="px-6 py-4 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground-950/10">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-foreground-950/40">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 text-foreground-950/20" />
                    <p className="font-medium text-foreground-950/60">No projects yet</p>
                    <p className="text-xs text-foreground-950/40 mt-1">Projects will appear once a contract is signed.</p>
                  </td>
                </tr>
              ) : (
                projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-foreground-950/3 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground-950">
                      {proj.contract?.quotation?.customer?.fullName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${
                        statusColors[proj.status] ?? 'bg-foreground-950/5 text-foreground-950/40'
                      }`}>{proj.status.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-6 py-4 text-foreground-950/50">
                      {proj.scheduledInstallDate
                        ? new Date(proj.scheduledInstallDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '\u2014'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        {proj.milestones.length > 0
                          ? proj.milestones.map((m, i) => (
                              <span key={i} className="text-xs text-foreground-950/50 capitalize">{m.milestone.replace(/_/g, ' ')}</span>
                            ))
                          : <span className="text-xs text-foreground-950/40">None yet</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground-950/50">
                      {new Date(proj.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
