import React from 'react';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await db.energyProject.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      scheduledInstallDate: true,
      actualInstallDate: true,
      commissioningDate: true,
      createdAt: true,
      contract: {
        select: {
          quotation: {
            select: {
              customer: {
                select: { fullName: true, siteAddress: true }
              }
            }
          }
        }
      },
    },
  });

  const statusColors: Record<string, string> = {
    scheduled: 'bg-accent-cyan/10 text-accent-cyan',
    in_progress: 'bg-accent-cyan/10 text-accent-cyan',
    commissioned: 'bg-accent-emerald/10 text-accent-emerald',
    warranty_registered: 'bg-accent-cyan/10 text-accent-cyan',
    closed: 'bg-foreground-950/5 text-foreground-950/40',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground-950 mb-1">Active Projects</h1>
          <p className="text-sm text-foreground-950/40">Track solar installation milestones and commissioning status.</p>
        </div>
      </div>

      <div className="bg-background-200 border border-foreground-950/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground-950/70">
            <thead className="bg-foreground-950/5 text-xs uppercase text-foreground-950/40">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Scheduled Install</th>
                <th className="px-6 py-4 font-medium">Commissioned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground-950/10">
              {projects.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-foreground-950/50">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-10 h-10 text-foreground-950/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="font-medium text-foreground-950/40">No active projects</p>
                      <p className="text-xs text-foreground-950/60">Projects are created when a contract is signed.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map((project: any) => {
                  const customer = project.contract?.quotation?.customer;
                  return (
                    <tr key={project.id} className="hover:bg-foreground-950/5 transition-colors cursor-pointer">
                      <td className="px-6 py-4 font-medium text-foreground-950">{customer?.fullName || 'Unknown'}</td>
                      <td className="px-6 py-4 text-foreground-950/40">{customer?.siteAddress || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[project.status] ?? 'bg-foreground-950/5 text-foreground-950/40'}`}>
                          {project.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-foreground-950/50">
                        {project.scheduledInstallDate
                          ? new Date(project.scheduledInstallDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'TBD'}
                      </td>
                      <td className="px-6 py-4 text-foreground-950/50">
                        {project.commissioningDate
                          ? new Date(project.commissioningDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
