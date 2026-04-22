'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ReceiptText } from 'lucide-react';

const CHARGE_COLORS = {
  'Generation':    '#f59e0b',
  'Transmission':  '#60a5fa',
  'System Loss':   '#f97316',
  'Distribution':  '#34d399',
  'VAT':           '#c084fc',
  'Gov Tax':       '#fb7185',
  'Subsidies':     '#94a3b8',
  'Other':         '#6b7280',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-800 border border-white/10 rounded-xl p-3 shadow-xl text-xs space-y-1">
      <p className="font-bold text-text-primary mb-2">{label}</p>
      {payload.map(p => (
        p.value > 0 && (
          <div key={p.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-text-muted">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
              {p.name}
            </span>
            <span className="font-mono font-bold text-text-primary">₱{Number(p.value).toFixed(2)}</span>
          </div>
        )
      ))}
    </div>
  );
};

export default function BillBreakdownChart({ readings }) {
  const scanned = readings.filter(r => r.sourceType === 'ai_scan' && r.generationCharge != null);

  if (scanned.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center text-center py-12 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-surface-700 flex items-center justify-center">
          <ReceiptText className="w-6 h-6 text-text-muted" />
        </div>
        <h3 className="text-sm font-semibold text-text-primary">No scanned bill data</h3>
        <p className="text-[11px] text-text-muted max-w-[240px] leading-relaxed">
          Use the AI Vision Scan feature to upload a bill. Unbundled charges (generation, VAT, etc.) will appear here automatically.
        </p>
      </div>
    );
  }

  // Build chart data — last 3 scanned readings
  const chartData = scanned.slice(0, 3).reverse().map(r => ({
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
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-text-primary flex items-center gap-2">
            <ReceiptText className="w-4 h-4 text-brand-400" /> Unbundled Bill Breakdown
          </h2>
          <p className="text-[11px] text-text-muted mt-0.5">AI-scanned charge breakdown by component</p>
        </div>
        <span className="stat-badge stat-badge-amber">AI Scanned</span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" tick={{ fill: '#6b6967', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b6967', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          {Object.keys(CHARGE_COLORS).map(key => (
            <Bar key={key} dataKey={key} stackId="bill" fill={CHARGE_COLORS[key]} radius={key === 'Other' ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
