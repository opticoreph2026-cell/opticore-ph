import { getCurrentUser } from '@/lib/auth';
import { getReportsByClient, getClientById, getReadingsByClient, getActiveProperty, ensureDefaultProperty } from '@/lib/db';
import ExportButtons from '@/components/dashboard/ExportButtons';
import BillBreakdownChart from '@/components/dashboard/BillBreakdownChart';
import ShareReportButton from '@/components/dashboard/ShareReportButton';
import PlanGate from '@/components/dashboard/PlanGate';
import { FileText, Brain, Download, Zap } from 'lucide-react';
import { format } from 'date-fns';

export const metadata = { title: 'Reports — OptiCore PH' };

export default async function ReportsPage() {
  const jwtUser = await getCurrentUser();
  let reports = [];
  let clientPlan = 'starter';
  let readings = [];
  try { 
    const activeProperty = await ensureDefaultProperty(jwtUser.sub);
    reports = await getReportsByClient(jwtUser.sub, activeProperty.id); 
    readings = await getReadingsByClient(jwtUser.sub, activeProperty.id);
    const clientRecord = await getClientById(jwtUser.sub);
    clientPlan = clientRecord?.planTier || 'starter';
  } catch { /* ok */ }

  return (
    <PlanGate userPlan={clientPlan} requiredPlan="pro">
      <div className="space-y-6 animate-fade-up print:space-y-4">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="section-label mb-1">Intelligence</p>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5 print:text-black">
              <FileText className="w-6 h-6 text-brand-400 print:hidden" />
              Reports
            </h1>
            <p className="text-sm text-white/40 mt-1 print:hidden">
              Your monthly AI-generated utility analysis reports.
            </p>
          </div>
          <div className="print:hidden">
            <ExportButtons plan={clientPlan} />
          </div>
        </div>

        {/* Unbundled Bill Breakdown — shown if any AI-scanned readings exist */}
        <BillBreakdownChart readings={readings} />

        {reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((r, i) => (
              <div key={r.id} className={`bento-card relative overflow-hidden group transition-all duration-300 ${i === 0 ? 'hover:-translate-y-1' : ''}`} style={i === 0 ? { boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 16px 40px rgba(0,0,0,0.4), inset 0 0 40px rgba(245,158,11,0.03)' } : {}}>
                {i === 0 && <div className="absolute inset-0 bg-amber-glow opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>}
                {i === 0 && <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent"></div>}
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${i === 0 ? 'bg-brand-500/15 border border-brand-500/25 shadow-lg shadow-brand-500/10' : 'bg-surface-800 border border-white/5'
                      }`}>
                      <Brain className={`w-5 h-5 ${i === 0 ? 'text-brand-400' : 'text-text-muted'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold tracking-wide text-text-primary">
                          {r.generatedAt
                            ? format(new Date(r.generatedAt), "MMMM yyyy 'Report'")
                            : 'AI Report'}
                        </p>
                        {i === 0 && (
                          <span className="stat-badge stat-badge-amber text-[10px] px-2 py-0.5">Latest</span>
                        )}
                      </div>
                      <p className="text-[10px] text-text-muted mb-3 font-semibold uppercase tracking-wider">
                        Generated {r.generatedAt
                          ? format(new Date(r.generatedAt), 'MMM d, yyyy')
                          : 'recently'}
                      </p>
                      <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                        {r.summary ?? 'AI-generated analysis of your utility consumption and savings opportunities.'}
                      </p>
                      {r.estimatedSavings && (
                        <p className="text-[11px] font-bold tracking-wider text-emerald-400 mt-3 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" /> EST. SAVINGS: ₱{Number(r.estimatedSavings).toLocaleString()}/mo
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShareReportButton reportId={r.id} isBusiness={clientPlan === 'business'} />
                    {r.pdfUrl && (
                      <a
                        href={r.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost text-xs px-4 py-2 shrink-0 flex items-center gap-1.5 font-bold hover:text-brand-400 transition-colors"
                      >
                        <Download className="w-4 h-4" /> PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bento-card relative overflow-hidden group flex flex-col items-center text-center py-20 gap-4" style={{ boxShadow: 'inset 0 0 40px rgba(245,158,11,0.01)' }}>
            <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shadow-2xl shadow-brand-500/10 mb-2">
              <FileText className="w-7 h-7 text-brand-400" />
            </div>
            <h2 className="font-bold text-text-primary tracking-wide text-lg">No reports yet</h2>
            <p className="text-sm text-text-muted max-w-sm leading-relaxed">
              Reports are auto-generated monthly after you submit your utility readings.
              Pro and Business users also get downloadable PDF versions.
            </p>
          </div>
        )}
      </div>
    </PlanGate>
  );
}
