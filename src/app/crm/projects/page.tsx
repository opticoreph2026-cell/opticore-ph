import React from 'react';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export default async function ProjectsPage() {
  const projects = await db.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      lead: { select: { name: true, address: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Active Projects</h1>
          <p className="text-sm text-gray-400">Track installation milestones and status.</p>
        </div>
      </div>

      <div className="bg-[#16161D] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/5 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Address</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Target Install</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No active projects.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-medium text-white">{project.lead?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-gray-400">{project.lead?.address || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#06B6D4]/10 text-[#06B6D4] capitalize">
                        {project.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {project.targetInstallDate 
                        ? new Date(project.targetInstallDate).toLocaleDateString() 
                        : 'TBD'}
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
