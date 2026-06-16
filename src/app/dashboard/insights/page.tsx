'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Zap, TrendingDown } from 'lucide-react';
import useSWR from 'swr';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function InsightsPage() {
  const { data } = useSWR('/api/dashboard/data', fetcher);
  const readings = data?.data?.chartData || [];

  // Re-map the chart data to fit the insights year-over-year format
  // In the real app, we might get actual year-over-year from the backend,
  // but we can generate mock previous year data for demonstration.
  const chartData = [...readings].reverse().map((r: any) => {
    return { 
      name: r.name, 
      currentYear: r.electric,
      lastYear: r.electric * (0.8 + Math.random() * 0.4) // mock previous year
    };
  });

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pt-6 pb-20 lg:pb-6 animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            <Zap className="w-8 h-8 text-accent-cyan" />
            Energy <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-emerald">Insights</span>
          </h1>
          <p className="text-white/60 text-sm mt-2">
            Deep dive into your energy consumption patterns and long-term trends.
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-surface-800 hover:bg-surface-800/80 text-white font-medium rounded-xl transition-all border border-border-subtle self-start md:self-auto shadow-sm">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <SpotlightCard className="p-6 lg:p-8 h-full">
            <div className="mb-6">
              <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Year Over Year Comparison</h2>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-white/80">
                  <div className="w-3 h-3 rounded-full bg-accent-cyan" /> Current Year
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-white/40">
                  <div className="w-3 h-3 rounded-full bg-white/20" /> Previous Year
                </div>
              </div>
            </div>
            
            <div className="w-full h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Inter' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Inter' }} dx={-10} tickFormatter={(val) => `₱${val}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F0F14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontFamily: 'Inter' }}
                      itemStyle={{ color: '#06B6D4' }}
                      formatter={(value: number) => [`₱${value.toFixed(2)}`, '']}
                    />
                    <Line type="monotone" dataKey="currentYear" stroke="#06B6D4" strokeWidth={3} dot={{ r: 4, fill: '#06B6D4', strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="lastYear" stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center border border-dashed border-border-subtle rounded-xl">
                  <p className="text-sm font-medium text-white/40">Not enough data to generate chart.</p>
                </div>
              )}
            </div>
          </SpotlightCard>
        </div>

        {/* Stats Column */}
        <div className="space-y-6">
          <SpotlightCard className="p-6">
            <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">Unbundled Charges</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-white/60 font-medium">Generation Charge</span>
                  <span className="text-white font-bold">54.2%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-1000 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-cyan w-[54.2%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-white/60 font-medium">Distribution Charge</span>
                  <span className="text-white font-bold">22.8%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-1000 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-cyan w-[22.8%]/80" style={{ width: '22.8%', opacity: 0.8 }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-white/60 font-medium">Transmission Charge</span>
                  <span className="text-white font-bold">10.5%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-1000 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-cyan w-[10.5%]/60" style={{ width: '10.5%', opacity: 0.6 }} />
                </div>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6 relative overflow-hidden group">
            {/* Background glow effect */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-accent-emerald/10 blur-3xl rounded-full group-hover:bg-accent-emerald/20 transition-all duration-500" />
            
            <div className="flex items-center gap-3 mb-4 relative">
              <div className="w-10 h-10 bg-accent-emerald/10 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-accent-emerald" />
              </div>
              <h3 className="text-accent-emerald font-semibold tracking-tight">Efficiency Score</h3>
            </div>
            <p className="text-4xl font-display font-bold text-white tracking-tighter mb-2 relative">A-</p>
            <p className="text-sm font-medium text-accent-emerald/80 relative">You are consuming 15% less energy than similar households in your area.</p>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
