'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/swr-fetcher';

interface Quotation {
  id: string; quoteNumber: string; status: string; grandTotal: number;
  issueDate: string; validUntil: string;
}

interface Milestone { milestone: string; milestoneDate: string; }

interface CustomerData {
  customer: {
    id: string; fullName: string; contactEmail: string; contactPhone: string | null;
    siteAddress: string | null; quotations: Quotation[];
  } | null;
  project: {
    id: string; status: string; scheduledInstallDate: string | null;
    commissioningDate: string | null; milestones: Milestone[];
  } | null;
}

const statusBadge: Record<string, string> = {
  scheduled: 'bg-accent-cyan/10 text-accent-cyan',
  in_progress: 'bg-accent-cyan/10 text-accent-cyan',
  commissioned: 'bg-accent-emerald/10 text-accent-emerald',
  warranty_registered: 'bg-purple-400/10 text-purple-400',
  closed: 'bg-white/5 text-gray-400',
};

export function CustomerStats({ initialData, email }: { initialData: CustomerData; email: string | undefined }) {
  const { data } = useSWR<CustomerData>('/api/dashboard/customer', fetcher, {
    refreshInterval: 30_000,
    fallbackData: initialData,
  });

  const { customer, project } = data!;
  const quotations = customer?.quotations ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My System</h1>
        <p className="text-gray-400">Track your solar installation and manage your documents.</p>
      </div>

      {!customer ? (
        <div className="bg-background-800 p-8 rounded-2xl border border-white/5 text-center">
          <div className="w-16 h-16 bg-accent-cyan/20 text-accent-cyan rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Active Account Found</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            We couldn&apos;t find a customer record linked to <strong className="text-white">{email}</strong>.
            If you&apos;ve recently signed a contract, your portal will activate within 24 hours.
          </p>
          <a href="mailto:support@opticore.ph"
            className="px-6 py-3 bg-white/5 text-white font-medium rounded-lg hover:bg-white/10 transition-colors inline-block"
          >Contact Support</a>
        </div>
      ) : (
        <div className="space-y-6">
          {project ? (
            <div className="bg-background-800 p-6 rounded-2xl border border-white/5">
              <h2 className="text-lg font-bold text-white mb-4">Installation Status</h2>
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent-emerald/20 text-accent-emerald rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${statusBadge[project.status] ?? 'bg-white/5 text-gray-400'}`}>
                      {project.status.replace(/_/g, ' ')}
                    </span>
                    <p className="text-sm text-gray-400 mt-1">
                      Scheduled: {project.scheduledInstallDate
                        ? new Date(project.scheduledInstallDate).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
                        : 'TBD'}
                    </p>
                  </div>
                </div>
                {project.commissioningDate && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Commissioned</p>
                    <p className="text-sm text-accent-emerald font-medium">
                      {new Date(project.commissioningDate).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>

              {project.milestones.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Recent Milestones</h3>
                  {project.milestones.map((m, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald" />
                        <span className="text-sm text-white capitalize">{m.milestone.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(m.milestoneDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-background-800 p-6 rounded-2xl border border-white/5 text-center text-gray-500">
              <p>Your installation project will appear here once a contract has been signed.</p>
            </div>
          )}

          {quotations.length > 0 && (
            <div className="bg-background-800 p-6 rounded-2xl border border-white/5">
              <h2 className="text-lg font-bold text-white mb-4">My Proposals</h2>
              <div className="space-y-3">
                {quotations.map((q) => (
                  <div key={q.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white">Quote #{q.quoteNumber}</p>
                      <p className="text-xs text-gray-500">
                        Issued {new Date(q.issueDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' · '}Valid until {new Date(q.validUntil).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">₱{q.grandTotal.toLocaleString('en-PH')}</p>
                      <span className={`text-xs capitalize ${
                        q.status === 'accepted' ? 'text-accent-emerald' :
                        q.status === 'rejected' ? 'text-accent-rose' :
                        q.status === 'sent' ? 'text-accent-cyan' :
                        'text-gray-400'
                      }`}>{q.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-background-800 p-6 rounded-2xl border border-white/5">
              <h3 className="text-white font-bold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:support@opticore.ph" className="text-sm text-accent-cyan hover:underline flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Contact Support
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/639XXXXXXXXX" target="_blank" rel="noreferrer" className="text-sm text-accent-cyan hover:underline flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    WhatsApp Us
                  </a>
                </li>
              </ul>
            </div>
            <div className="bg-background-800 p-6 rounded-2xl border border-white/5">
              <h3 className="text-white font-bold mb-4">Account Info</h3>
              <div className="space-y-1.5 text-sm text-gray-400">
                <p><span className="text-white">Name:</span> {customer.fullName}</p>
                <p><span className="text-white">Email:</span> {customer.contactEmail}</p>
                {customer.contactPhone && <p><span className="text-white">Phone:</span> {customer.contactPhone}</p>}
                {customer.siteAddress && <p><span className="text-white">Address:</span> {customer.siteAddress}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
