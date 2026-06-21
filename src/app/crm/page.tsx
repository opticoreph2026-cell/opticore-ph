import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

export default async function CrmDashboard() {
  const session = await getSession();
  const role = session?.role as string;
  const isOwner = role === 'opticore_owner';

  // Fetch some basic stats
  const activeLeads = await db.lead.count({ where: { status: 'new' } });
  const activeProjects = await db.project.count({ where: { status: 'installation_scheduled' } });
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back, {session?.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#16161D] p-6 rounded-2xl border border-white/5">
          <div className="text-sm font-medium text-gray-400 mb-1">New Leads</div>
          <div className="text-4xl font-bold text-white">{activeLeads}</div>
        </div>
        <div className="bg-[#16161D] p-6 rounded-2xl border border-white/5">
          <div className="text-sm font-medium text-gray-400 mb-1">Active Installs</div>
          <div className="text-4xl font-bold text-white">{activeProjects}</div>
        </div>
        {isOwner && (
          <div className="bg-[#16161D] p-6 rounded-2xl border border-white/5">
            <div className="text-sm font-medium text-gray-400 mb-1">Total Pipeline (Est.)</div>
            <div className="text-4xl font-bold text-[#10B981]">₱0.00</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#16161D] p-6 rounded-2xl border border-white/5">
          <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
          <div className="text-sm text-gray-400 py-8 text-center border border-dashed border-white/10 rounded-lg">
            No recent activity to show.
          </div>
        </div>
        <div className="bg-[#16161D] p-6 rounded-2xl border border-white/5">
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium text-white transition-colors">
              + Add New Lead
            </button>
            <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium text-white transition-colors">
              + Generate ROI Quote
            </button>
            {isOwner && (
              <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium text-white transition-colors">
                + Add Inventory Item
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
