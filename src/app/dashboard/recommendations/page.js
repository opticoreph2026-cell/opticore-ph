import { getCurrentUser } from '@/lib/auth';
import { getReportsByClient, db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Lightbulb, Calculator, Zap, Cpu, Brain, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export const metadata = { title: 'Recommendations — OptiCore PH' };

async function getHardwareRecommendations(userId) {
  const client = await db.client.findUnique({
    where: { id: userId },
    include: {
      readings:   { orderBy: { readingDate: 'desc' }, take: 1 },
      appliances: true,
    },
  });

  const effectiveRate = client?.readings?.[0]?.effectiveRate || 12.0;
  const userAppliances = client?.appliances || [];
  const recommendations = [];

  for (const app of userAppliances) {
    const cat = app.category?.toLowerCase();
    if (cat === 'ac' || cat === 'aircon') {
      if (!['inverter', '5-star', '4-star'].includes(app.energyRating)) {
        const currentWattage = app.wattage || 750;
        const estCapacity    = (currentWattage / 750) * 9000;

        const alternatives = await db.applianceCatalog.findMany({
          where: {
            category:          'AC',
            eerRating:         { gt: 11.5 },
            coolingCapacityKjH: { gte: estCapacity - 2000, lte: estCapacity + 2000 },
          },
          orderBy: { eerRating: 'desc' },
          take: 1,
        });

        if (alternatives.length > 0) {
          const rec          = alternatives[0];
          const currentHours = app.hoursPerDay || 8;
          const currentDaily = (currentWattage / 1000) * currentHours * effectiveRate;
          const newDaily     = ((rec.wattage || currentWattage * 0.6) / 1000) * currentHours * effectiveRate;
          const monthlySavings = Math.max(0, (currentDaily - newDaily) * 30);
          const paybackMonths  = rec.estimatedPricePhp && monthlySavings > 0
            ? (rec.estimatedPricePhp / monthlySavings).toFixed(1) : null;

          recommendations.push({
            type: 'Hardware Upgrade', title: `Upgrade ${app.name}`,
            current:     { brand: app.brand, wattage: currentWattage, rating: app.energyRating },
            recommended: { brand: rec.brand, model: rec.modelNumber, price: rec.estimatedPricePhp, eer: rec.eerRating },
            monthlySavings, paybackMonths,
          });
        }
      }
    }
  }
  return recommendations;
}

export default async function RecommendationsPage() {
  const jwtUser = await getCurrentUser();
  if (!jwtUser) redirect('/login');

  let reports = [];
  try { reports = await getReportsByClient(jwtUser.sub); } catch { /* degrade gracefully */ }

  const latest       = reports[0];
  const hardwareRecs = await getHardwareRecommendations(jwtUser.sub);

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Page Header ── */}
      <div>
        <p className="section-label mb-1">Intelligence</p>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Lightbulb className="w-6 h-6 text-brand-400" />
          AI Recommendations
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Personalized hardware upgrades and AI tips generated from your usage data.
        </p>
      </div>

      {/* ── Hardware Upgrade Cards ── */}
      {hardwareRecs.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-brand-400" />
            <h2 className="font-bold text-white text-sm tracking-wide uppercase"
              style={{ letterSpacing: '0.08em' }}>Smart Hardware Upgrades</h2>
          </div>

          {hardwareRecs.map((rec, i) => (
            <div key={i} className="bento-card p-6 relative overflow-hidden group">
              {/* Hover amber sheen */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl"
                style={{ background: 'radial-gradient(ellipse at top right, rgba(245,158,11,0.05), transparent 70%)' }} />

              {/* Type badge */}
              <div className="absolute top-5 right-5">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.22)' }}>
                  {rec.type}
                </span>
              </div>

              <div className="flex flex-col md:flex-row gap-6 md:items-stretch relative z-10">
                <div className="flex-1 space-y-4 min-w-0">
                  <h3 className="text-lg md:text-xl font-black text-white break-words pr-4">{rec.title}</h3>
                  <div className="grid sm:grid-cols-2 gap-3">

                    {/* Current */}
                    <div className="p-4 rounded-xl space-y-2"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <h4 className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Current Device</h4>
                      <p className="text-sm text-white"><span className="text-white/30 text-xs">Brand:</span> {rec.current.brand || 'Unknown'}</p>
                      <p className="text-sm text-white"><span className="text-white/30 text-xs">Power:</span> {rec.current.wattage}W</p>
                      <p className="text-sm">
                        <span className="text-white/30 text-xs">Rating:</span>{' '}
                        <span className="text-orange-400 capitalize">{String(rec.current.rating || 'N/A').replace('-', ' ')}</span>
                      </p>
                    </div>

                    {/* Recommended */}
                    <div className="p-4 rounded-xl space-y-2"
                      style={{
                        background: 'linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.03) 100%)',
                        border: '1px solid rgba(245,158,11,0.22)',
                      }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Cpu className="w-3.5 h-3.5 text-brand-400" />
                        <h4 className="text-[9px] font-black text-brand-400 uppercase tracking-[0.2em]">Suggested Match</h4>
                      </div>
                      <p className="text-sm text-white font-medium break-words">
                        <span className="text-white/30 text-xs">Model:</span> {rec.recommended.brand} {rec.recommended.model}
                      </p>
                      {rec.recommended.price && (
                        <p className="text-sm text-white">
                          <span className="text-white/30 text-xs">Price:</span>{' '}
                          <span className="font-mono">₱{rec.recommended.price.toLocaleString()}</span>
                        </p>
                      )}
                      {rec.recommended.eer && (
                        <p className="text-sm text-white">
                          <span className="text-white/30 text-xs">EER:</span>{' '}
                          <span className="font-mono text-emerald-400">{rec.recommended.eer.toFixed(2)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Savings Widget */}
                <div className="shrink-0 w-full md:w-52 p-5 rounded-2xl flex flex-col items-center justify-center text-center"
                  style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)' }}>
                  <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] mb-2">Est. Savings</p>
                  <p className="text-3xl font-black text-emerald-400 mb-1">
                    ₱{rec.monthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-white/30 mb-4">per month</p>
                  {rec.paybackMonths && (
                    <div className="w-full flex items-center justify-center gap-2 py-2 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <Calculator className="w-3.5 h-3.5 text-emerald-400/60" />
                      <span className="text-xs text-white/40">
                        ROI in <strong className="text-emerald-400">{rec.paybackMonths}</strong> mo
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bento-card p-12 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <Cpu className="w-7 h-7 text-brand-400/50" />
          </div>
          <p className="text-sm text-white/35 max-w-xs leading-relaxed">
            No hardware upgrades suggested for your current appliance profile. Add more appliances in <strong className="text-brand-400">My Appliances</strong> to unlock personalized recommendations.
          </p>
        </div>
      )}

      {/* ── Latest AI Report Digest ── */}
      {latest && (
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-2.5">
            <Brain className="w-4 h-4 text-brand-400" />
            <h2 className="font-bold text-white text-sm tracking-wide uppercase" style={{ letterSpacing: '0.08em' }}>
              AI Report Digest
            </h2>
          </div>

          {/* Summary card */}
          <div className="bento-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.22)' }}>
                  <Brain className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Latest AI Analysis</p>
                  <p className="text-[10px] text-white/30 mt-0.5">
                    {latest.generatedAt
                      ? format(new Date(latest.generatedAt), 'MMMM d, yyyy · h:mm a')
                      : 'Recently generated'}
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(245,158,11,0.10)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.20)' }}>
                Gemini 2.5
              </span>
            </div>

            {latest.summary && (
              <p className="text-sm text-white/55 leading-relaxed pt-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {latest.summary}
              </p>
            )}
          </div>

          {/* Recommendations list */}
          {latest.recommendations && (
            <div className="bento-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Action Items</h3>
              </div>
              <div className="space-y-2.5">
                {String(latest.recommendations)
                  .split('\n')
                  .filter(Boolean)
                  .map((line, i) => (
                    <div key={i}
                      className="flex items-start gap-3 p-3.5 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.20)' }}>
                        <span className="text-[9px] font-black text-brand-400">{i + 1}</span>
                      </div>
                      <p className="text-sm text-white/55 leading-relaxed">
                        {line.replace(/^[-•*]\s*/, '')}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
