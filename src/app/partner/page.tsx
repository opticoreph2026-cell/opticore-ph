import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

export default async function PartnerDashboard() {
  const session = await getSession();
  
  // Note: In a production app, the JWT would contain the partner's orgId
  // For this prototype, we'll fetch all commissions if we don't have orgId
  const orgId = (session as any)?.orgId as string | undefined;

  const commissions = await db.commissionRecord.findMany({
    where: orgId ? { payeeOrgId: orgId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      project: {
        include: {
          lead: true,
        }
      }
    }
  });

  const totalEarned = commissions
    .filter((c: any) => c.status === 'paid')
    .reduce((sum: number, c: any) => sum + c.amountCentavos, 0);

  const pendingEarned = commissions
    .filter((c: any) => c.status === 'pending')
    .reduce((sum: number, c: any) => sum + c.amountCentavos, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Partner Dashboard</h1>
        <p className="text-gray-400">Track your referred projects and commissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#16161D] p-6 rounded-2xl border border-white/5">
          <div className="text-sm font-medium text-gray-400 mb-1">Total Earned</div>
          <div className="text-4xl font-bold text-[#10B981]">₱{(totalEarned / 100).toLocaleString()}</div>
        </div>
        <div className="bg-[#16161D] p-6 rounded-2xl border border-white/5">
          <div className="text-sm font-medium text-gray-400 mb-1">Pending Payouts</div>
          <div className="text-4xl font-bold text-[#F5A524]">₱{(pendingEarned / 100).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-[#16161D] border border-white/5 rounded-xl overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-white/5 bg-white/5">
          <h2 className="text-lg font-bold text-white">Referred Projects & Commissions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#0F0F14] text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No commissions found.
                  </td>
                </tr>
              ) : (
                commissions.map((comm: any) => (
                  <tr key={comm.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-medium text-white">{comm.project?.lead?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 capitalize">{comm.commissionType.replace('_', ' ')}</td>
                    <td className="px-6 py-4">₱{(comm.amountCentavos / 100).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        comm.status === 'paid' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F5A524]/10 text-[#F5A524]'
                      }`}>
                        {comm.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(comm.createdAt).toLocaleDateString()}
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
