import React from 'react';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export default async function LeadsPage() {
  const leads = await db.lead.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Leads & Prospects</h1>
          <p className="text-sm text-gray-400">Manage incoming inquiries and pipeline.</p>
        </div>
        <button className="px-4 py-2 bg-[#F5A524] text-[#08080B] font-medium rounded-lg hover:bg-[#e0961f] transition-colors text-sm">
          Add Lead
        </button>
      </div>

      <div className="bg-[#16161D] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/5 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Est. Bill</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No leads found.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-medium text-white">{lead.name}</td>
                    <td className="px-6 py-4">
                      <div>{lead.email}</div>
                      <div className="text-xs text-gray-500">{lead.phone}</div>
                    </td>
                    <td className="px-6 py-4">₱{(lead.monthlyBillCentavos / 100).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#F5A524]/10 text-[#F5A524] capitalize">
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
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
