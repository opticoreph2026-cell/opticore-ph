'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { ReceiptText, Sparkles } from 'lucide-react';

const CHARGE_COLORS = {
  'Generation':    '#22d3ee', // Cyan
  'Transmission':  '#3b82f6', // Blue
  'System Loss':   '#f59e0b', // Amber
  'Distribution':  '#10b981', // Emerald
  'VAT':           '#8b5cf6', // Violet
  'Gov Tax':       '#f43f5e', // Rose
  'Subsidies':     '#64748b', // Slate
  'Other':         '#475569', // Slate darker
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[200px]">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
        <Sparkles className="w-3 h-3 text-cyan-400" />
        Billing Period: {label}
      </p>
      <div className="space-y-2">
        {payload.map(p => (
          p.value > 0 && (
            <div key={p.name} className="flex items-center justify-between gap-4 group">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: p.fill }} />
                <span className="text-[11px] font-bold">{p.name}</span>
              </span>
              <span className="font-mono font-black text-white text-xs">₱{Number(p.value).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          )
        ))}
        <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-500 uppercase">Total Bill</span>
          <span className="text-sm font-black text-cyan-400">
            ₱{payload.reduce((acc, curr) => acc + curr.value, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function BillBreakdownChart({ readings }) {
  const scanned = readings.filter(r => r.sourceType === 'ai_scan' && r.generationCharge != null);

  if (scanned.length === 0) {
    return (
      <div className="card h-[380px] flex flex-col items-center justify-center text-center p-8 border-dashed border-white/10">
        <div className="w-16 h-16 rounded-[24px] bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
          <ReceiptText className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-lg font-black text-white tracking-tight mb-2">Detailed Breakdown Locked</h3>
        <p className="text-sm text-slate-500 max-w-[260px] leading-relaxed">
          Upload your electric bill using <span className="text-cyan-400 font-bold">AI Vision Scan</span> to see exactly where your money goes.
        </p>
      </div>
    );
  }

  // Build chart data — last 5 scanned readings
  const chartData = scanned.slice(0, 5).reverse().map(r => ({
    name: r.readingDate?.slice(0, 7) ?? 'Unknown',
    'Generation':   r.generationCharge   ?? 0,
    'Transmission': r.transmissionCharge ?? 0,
    'System Loss':  r.systemLoss         ?? 0,
    'Distribution': r.distributionCharge ?? 0,
    'VAT':          r.vat                ?? 0,
    'Gov Tax':      r.governmentTax      ?? 0,
    'Subsidies':    r.subsidies          ?? 0,
    'Other':        r.otherCharges       ?? 0,
  }));

  return (
    <div className="card p-8 bg-surface-1000/20 backdrop-blur-md">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-black text-white tracking-tighter flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <ReceiptText className="w-4 h-4 text-cyan-400" />
            </div>
            Unbundled Charge Breakdown
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Visualizing each component of your monthly utility bill</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">AI Accurate</span>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {Object.keys(CHARGE_COLORS).map(key => (
                <linearGradient key={`grad-${key}`} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHARGE_COLORS[key]} stopOpacity={1} />
                  <stop offset="100%" stopColor={CHARGE_COLORS[key]} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
              axisLine={false} 
              tickLine={false}
              dy={10}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(v) => `₱${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            {Object.keys(CHARGE_COLORS).map((key, idx) => (
              <Bar 
                key={key} 
                dataKey={key} 
                stackId="bill" 
                fill={`url(#grad-${key})`}
                radius={idx === Object.keys(CHARGE_COLORS).length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} 
                barSize={40}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
