import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { DollarSign } from 'lucide-react';

export const runtime = 'nodejs';

export default async function PartnerCommissionsPage() {
  const session = await getSession();
  const orgId = (session as any)?.organizationId as string | undefined;

  const commissions = await db.commissionRecord.findMany({
    where: orgId ? { organizationId: orgId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      organization: { select: { name: true } },
      project: {
        select: {
          id: true,
          contract: { select: { quotation: { select: { customer: { select: { fullName: true } } } } } },
        },
      },
    },
  });

  const totalEarned = (commissions as any[])
    .filter((c: any) => c.status === 'paid')
    .reduce((sum: number, c: any) => sum + c.amount, 0);

  const pendingEarned = (commissions as any[])
    .filter((c: any) => c.status === 'pending')
    .reduce((sum: number, c: any) => sum + c.amount, 0);

  const paidThisMonth = (commissions as any[])
    .filter((c: any) => {
      if (c.status !== 'paid' || !c.paidAt) return false;
      const d = new Date(c.paidAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum: number, c: any) => sum + c.amount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground-950 mb-2">Commissions & Payouts</h1>
        <p className="text-foreground-400">Track your earnings from referred installations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background-800 p-6 rounded-2xl border border-foreground-950/5">
          <div className="text-sm font-medium text-foreground-400 mb-1">Total Earned</div>
          <div className="text-4xl font-bold text-accent-emerald">₱{Number(totalEarned).toLocaleString()}</div>
        </div>
        <div className="bg-background-800 p-6 rounded-2xl border border-foreground-950/5">
          <div className="text-sm font-medium text-foreground-400 mb-1">Pending Payouts</div>
          <div className="text-4xl font-bold text-accent-cyan">₱{Number(pendingEarned).toLocaleString()}</div>
        </div>
        <div className="bg-background-800 p-6 rounded-2xl border border-foreground-950/5">
          <div className="text-sm font-medium text-foreground-400 mb-1">Paid This Month</div>
          <div className="text-4xl font-bold text-accent-cyan">₱{Number(paidThisMonth).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-background-800 border border-foreground-950/5 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-foreground-950/5 bg-foreground-950/5">
          <h2 className="text-lg font-bold text-foreground-950">Commission History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground-300">
            <thead className="bg-background-900 text-xs uppercase text-foreground-400">
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
                  <td colSpan={5} className="px-6 py-12 text-center text-foreground-500">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-foreground-600" />
                    <p className="font-medium text-foreground-400">No commissions found</p>
                    <p className="text-xs text-foreground-600 mt-1">Commissions will appear when projects are completed.</p>
                  </td>
                </tr>
              ) : (
                commissions.map((comm: any) => (
                  <tr key={comm.id} className="hover:bg-foreground-950/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground-950">
                      {comm.project?.contract?.quotation?.customer?.fullName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 capitalize">{comm.roleInProject.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4">₱{Number(comm.amount).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        comm.status === 'paid'
                          ? 'bg-accent-emerald/10 text-accent-emerald'
                          : 'bg-accent-cyan/10 text-accent-cyan'
                      }`}>
                        {comm.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground-500">
                      {new Date(comm.createdAt).toLocaleDateString('en-PH', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
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
