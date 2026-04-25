import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Brain, ExternalLink, Zap, TrendingDown, LayoutDashboard, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export async function generateMetadata({ params }) {
  const { id } = params;
  try {
    const report = await db.aIReport.findUnique({ where: { id } });
    if (!report) return { title: 'Report Not Found' };
    return { title: 'OptiCore Energy Profile' };
  } catch {
    return { title: 'Error' };
  }
}

export default async function PublicReportPage({ params }) {
  const { id } = params;

  let report = null;
  try {
    report = await db.aIReport.findUnique({
      where: { id },
      include: {
        property: { select: { name: true, address: true } },
      }
    });
  } catch (error) {
    console.error('[PublicReport] Database error:', error);
  }

  if (!report) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-50" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-radial pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06] bg-surface-900/60 backdrop-blur-xl shrink-0">
        <div className="max-w-4xl mx-auto w-full px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <Logo className="w-9 h-9" />
            <span className="font-bold text-sm tracking-tight">
              <span className="shimmer-text">OptiCore</span>
              <span className="text-text-secondary ml-0.5">PH</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="stat-badge stat-badge-amber">
              <Brain className="w-3.5 h-3.5" /> Edge AI Verified
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">

          {/* Title Area */}
          <div className="text-center sm:text-left space-y-3">
            <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">
              Automated Utility Insights
            </p>
            <h1 className="text-3xl font-semibold text-text-primary">
              {report.property?.name || 'Property Profile'} Energy Scan
            </h1>
            <p className="text-sm text-text-muted">
              Generated securely on {format(new Date(report.generatedAt), 'MMMM d, yyyy')}
            </p>
            {report.property?.address && (
              <p className="inline-block mt-2 px-3 py-1 bg-surface-800 border border-white/5 rounded-full text-xs text-text-secondary">
                {report.property.address}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Core Diagnostics */}
            <div className="md:col-span-2 space-y-6">
              
              <div className="card shadow-2xl">
                <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2 border-b border-white/[0.06] pb-3">
                  <LayoutDashboard className="w-5 h-5 text-text-muted" /> Executive Summary
                </h2>
                <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {report.summary}
                </div>
              </div>

              {report.recommendations && (
                <div className="card shadow-2xl">
                  <h2 className="font-semibold text-text-primary mb-5 flex items-center gap-2 border-b border-white/[0.06] pb-3">
                    <Zap className="w-5 h-5 text-brand-400" /> Action Items & Optimizations
                  </h2>
                  <div className="space-y-4">
                    {String(report.recommendations)
                      .split('\n')
                      .filter(Boolean)
                      .map((line, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-surface-800/50 border border-white/[0.04]">
                          <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-brand-500/20">
                            <span className="text-xs font-bold text-brand-400">{i + 1}</span>
                          </div>
                          <p className="text-sm text-text-secondary leading-relaxed pt-0.5">{line.replace(/^[-•*]\s*/, '')}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <div className="card border-emerald-500/20 bg-emerald-500/5 shadow-2xl">
                <div className="flex flex-col items-center text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                    <TrendingDown className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-xs text-emerald-200 font-medium uppercase tracking-wider mb-2">
                    Estimated Monthly Savings
                  </p>
                  <p className="text-4xl font-bold text-emerald-400">
                    ₱{Number(report.estimatedSavings).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="card shadow-2xl relative overflow-hidden group border-brand-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent pointer-events-none" />
                <h3 className="font-semibold text-text-primary mb-2 relative z-10">
                  Powered by OptiCore
                </h3>
                <p className="text-xs text-text-muted mb-4 relative z-10 leading-relaxed">
                  Start tracking your own utility usage and hardware efficiency using our AI billing engine.
                </p>
                <Link href="/login" className="btn-primary w-full text-xs py-2.5 relative z-10">
                  Map Your Own Property <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-surface-900/60 py-6 px-5 relative z-10 shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-text-muted">
            OptiCore PH Analytics • Read-only external export
          </p>
          <a href="https://opticoreph.com" className="text-[11px] text-brand-400 hover:underline flex items-center gap-1">
            opticoreph.com <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}
