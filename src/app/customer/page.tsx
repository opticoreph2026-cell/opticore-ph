import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

export default async function CustomerDashboard() {
  const session = await getSession();
  const userId = session?.userId as string;

  // Find their project
  // In a real app we'd map lead to user, or link user directly to project
  // For this prototype, let's just fetch the first project they are linked to.
  // Actually, wait, the schema doesn't link Project directly to User.
  // It links Project -> Lead -> ... Lead has email.
  // We can query lead by email.
  const email = session?.email as string;
  let project = null;

  if (email) {
    const lead = await db.lead.findFirst({
      where: { email },
      include: {
        projects: true
      }
    });
    if (lead && lead.projects.length > 0) {
      project = lead.projects[0];
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My System</h1>
        <p className="text-gray-400">Track your installation and system performance.</p>
      </div>

      {!project ? (
        <div className="bg-[#16161D] p-8 rounded-2xl border border-white/5 text-center">
          <div className="w-16 h-16 bg-[#F5A524]/20 text-[#F5A524] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Active Projects Found</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            We couldn't find any active Neovolt ESS installations linked to your email ({email}). If you've recently signed a contract, your project will appear here shortly.
          </p>
          <a href="mailto:support@opticore.ph" className="px-6 py-3 bg-white/5 text-white font-medium rounded-lg hover:bg-white/10 transition-colors inline-block">
            Contact Support
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#16161D] p-6 rounded-2xl border border-white/5">
            <h2 className="text-lg font-bold text-white mb-4">Installation Status</h2>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#10B981]/20 text-[#10B981] rounded-full flex items-center justify-center font-bold">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium capitalize">{project.status.replace(/_/g, ' ')}</p>
                <p className="text-sm text-gray-400">Target Install: {project.targetInstallDate ? new Date(project.targetInstallDate).toLocaleDateString() : 'TBD'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#16161D] p-6 rounded-2xl border border-white/5">
              <h3 className="text-white font-bold mb-4">System Details</h3>
              <p className="text-sm text-gray-400 mb-2">Detailed technical specs will appear here once commissioned.</p>
            </div>
            <div className="bg-[#16161D] p-6 rounded-2xl border border-white/5">
              <h3 className="text-white font-bold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-[#06B6D4] hover:underline flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    View Contract & Proposal
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-[#06B6D4] hover:underline flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    Open Monitoring App
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
