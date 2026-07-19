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
  closed: 'bg-white/5 text-gray-400',
};

export function PartnerStats({ initialData }: { initialData: PartnerData }) {
  const { data } = useSWR<PartnerData>('/api/dashboard/partner', fetcher, {
    refreshInterval: 30_000,
    fallbackData: initialData,
  });

  const { activeCount, completedCount, scheduledCount, projects } = data!;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Projects</h1>
        <p className="text-gray-400">Overview of your installation projects and milestones.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#16161D] p-6 rounded-2xl border border-white/5">
          <div className="text-sm font-medium text-gray-400 mb-1">Active Projects</div>
          <div className="text-4xl font-bold text-accent-cyan">{activeCount}</div>
        </div>
        <div className="bg-[#16161D] p-6 rounded-2xl border border-white/5">
          <div className="text-sm font-medium text-gray-400 mb-1">Completed</div>
          <div className="text-4xl font-bold text-accent-emerald">{completedCount}</div>
        </div>
        <div className="bg-[#16161D] p-6 rounded-2xl border border-white/5">
          <div className="text-sm font-medium text-gray-400 mb-1">Scheduled</div>
          <div className="text-4xl font-bold text-accent-cyan">{scheduledCount}</div>
        </div>
      </div>

      <div className="bg-[#16161D] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 bg-white/5">
          <h2 className="text-lg font-bold text-white">Installation Projects</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#0F0F14] text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Install Date</th>
                <th className="px-6 py-4 font-medium">Milestones</th>
                <th className="px-6 py-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p className="font-medium text-gray-400">No projects yet</p>
                    <p className="text-xs text-gray-600 mt-1">Projects will appear once a contract is signed.</p>
                  </td>
                </tr>
              ) : (
                projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      {proj.contract?.quotation?.customer?.fullName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${
                        statusColors[proj.status] ?? 'bg-white/5 text-gray-400'
                      }`}>{proj.status.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {proj.scheduledInstallDate
                        ? new Date(proj.scheduledInstallDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '\u2014'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        {proj.milestones.length > 0
                          ? proj.milestones.map((m, i) => (
                              <span key={i} className="text-xs text-gray-500 capitalize">{m.milestone.replace(/_/g, ' ')}</span>
                            ))
                          : <span className="text-xs text-gray-600">None yet</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
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
