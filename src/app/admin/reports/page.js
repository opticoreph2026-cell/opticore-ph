import 'server-only';
import { FileText, Brain } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const metadata = { title: 'Admin Reports — OptiCore PH' };

import { db } from '@/lib/db';

async function getAllReports() {
  return db.aIReport.findMany({
    orderBy: { generatedAt: 'desc' },
    take: 50,
  });
}

export default async function AdminReportsPage() {
  let reports = [];
  try { reports = await getAllReports(); } catch { /* ok */ }

  return (
    <div className="space-y-6 animate-fade-up max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-400" /> All Reports
        </h1>
        <p className="text-sm text-text-muted mt-1">
          {reports.length} AI-generated reports across all clients.
        </p>
      </div>

      {reports.length > 0 ? (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.06]">
              <tr>
                {['Client ID', 'Generated', 'Summary', 'Est. Savings'].map(h => (
                  <th key={h} className="text-left text-xs text-text-muted font-medium px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 text-mono text-xs text-text-muted font-mono">
                    {String(r.clientId ?? '').slice(0, 8)}…
                  </td>
                  <td className="px-5 py-4 text-text-secondary whitespace-nowrap text-xs">
                    {r.generatedAt
                      ? format(new Date(r.generatedAt), 'MMM d, yyyy')
                      : '—'}
                  </td>
                  <td className="px-5 py-4 text-text-secondary max-w-xs">
                    <p className="line-clamp-1 text-xs">
                      {r.summary ?? '—'}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-emerald-400 font-medium">
                    {r.estimatedSavings
                      ? `₱${Number(r.estimatedSavings).toLocaleString()}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card flex flex-col items-center py-16 gap-4">
          <Brain className="w-8 h-8 text-text-muted" />
          <p className="text-text-muted text-sm">No reports generated yet.</p>
        </div>
      )}
    </div>
  );
}
