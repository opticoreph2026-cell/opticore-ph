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
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-xl shadow-amber-500/5">
              <Brain className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-display text-2xl font-bold text-white tracking-tight">Intelligence Reports</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Automated AI Insights & Historical Data</p>
            </div>
          </div>
          <div className="print:hidden">
            <ExportButtons plan={clientPlan} />
          </div>
        </div>

        {/* Unbundled Bill Breakdown — shown if any AI-scanned readings exist */}
        <BillBreakdownChart readings={readings} />

        {reports.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reports.map((r, i) => (
              <div 
                key={r.id} 
                className={`relative group bento-card p-6 overflow-hidden transition-all duration-500 hover:border-white/20 ${i === 0 ? 'lg:col-span-2 bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/10' : 'bg-surface-1000/20'}`}
              >
                {i === 0 && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[80px] -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-all duration-700" />
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
                  <div className="flex items-start gap-5 min-w-0">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${i === 0 ? 'bg-amber-500/10 border border-amber-500/20 shadow-xl shadow-amber-500/5' : 'bg-white/5 border border-white/10'}`}>
                      <FileText className={`w-6 h-6 ${i === 0 ? 'text-amber-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-black text-white tracking-tight">
                          {r.generatedAt ? format(new Date(r.generatedAt), "MMMM yyyy") : 'Monthly Insight'}
                        </h3>
                        {i === 0 && (
                          <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-widest">
                            Latest Report
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mb-4 font-black uppercase tracking-[0.2em]">
                        ID: {r.id.slice(-8).toUpperCase()} • {r.generatedAt ? format(new Date(r.generatedAt), 'MMM d, yyyy') : 'Recent'}
                      </p>
                      <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 font-medium">
                        {r.summary ?? 'AI-generated analysis of your utility consumption and savings opportunities.'}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 mt-6">
                        {r.estimatedSavings && (
                          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                            <Zap className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">₱{Number(r.estimatedSavings).toLocaleString()} Savings</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl">
                          <Brain className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-[11px] font-black text-cyan-400 uppercase tracking-widest">AI Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-start">
                    <ShareReportButton reportId={r.id} isBusiness={clientPlan === 'business'} />
                    {r.pdfUrl && (
                      <a
                        href={r.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group/btn"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4 text-slate-400 group-hover/btn:text-white transition-colors" />
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
