'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Zap, TrendingDown } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function InsightsPage() {
  const { data } = useSWR('/api/dashboard/data', fetcher);
  const readings = data?.readings || [];

  // Generate mock year-over-year data based on readings
  const chartData = [...readings].reverse().map((r: any) => {
    const total = (r.billAmountElectric || 0) + (r.billAmountWater || 0);
    const date = new Date(r.readingDate);
    return { 
      name: date.toLocaleString('default', { month: 'short' }), 
      currentYear: total / 100,
      lastYear: (total / 100) * (0.8 + Math.random() * 0.4) // mock previous year
    };
  });

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pt-6 pb-20 lg:pb-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Zap className="w-8 h-8 text-cyan-400" />
            Energy <span className="text-cyan-400">Insights</span>
          </h1>
          <p className="text-slate-400 font-bold mt-2">
            Deep dive into your energy consumption patterns and long-term trends.
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold rounded-xl transition-all border border-white/10 self-start md:self-auto">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-surface-900 border border-white/5 rounded-3xl p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Year Over Year Comparison</h2>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <div className="w-3 h-3 rounded-full bg-cyan-500" /> Current Year
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <div className="w-3 h-3 rounded-full bg-slate-600" /> Previous Year
              </div>
            </div>
          </div>
          
          <div className="w-full h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }} dx={-10} tickFormatter={(val) => `₱${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F0F14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#06B6D4' }}
                    formatter={(value: number) => [`₱${value.toFixed(2)}`, '']}
                  />
                  <Line type="monotone" dataKey="currentYear" stroke="#06B6D4" strokeWidth={3} dot={{ r: 4, fill: '#06B6D4', strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="lastYear" stroke="#475569" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center border border-dashed border-white/10 rounded-xl">
                <p className="text-xs font-bold text-slate-500">Not enough data to generate chart.</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-6">
          <div className="bg-surface-900 border border-white/5 rounded-3xl p-6">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Unbundled Charges</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-bold">Generation Charge</span>
                <span className="text-white font-black">54.2%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-1000 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 w-[54.2%]" />
              </div>

              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-slate-400 font-bold">Distribution Charge</span>
                <span className="text-white font-black">22.8%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-1000 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 w-[22.8%]" />
              </div>

              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-slate-400 font-bold">Transmission Charge</span>
                <span className="text-white font-black">10.5%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-1000 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 w-[10.5%]" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-emerald-400 font-black tracking-tight">Efficiency Score</h3>
            </div>
            <p className="text-4xl font-black text-white tracking-tighter mb-2">A-</p>
            <p className="text-xs font-bold text-emerald-500">You are consuming 15% less energy than similar households in your area.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
