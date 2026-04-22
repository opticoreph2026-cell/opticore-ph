'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = { starter: '#3a3a50', pro: '#60a5fa', business: '#f59e0b' };

export default function AdminKpiCharts({ planCounts }) {
  const data = [
    { name: 'Starter',  value: planCounts.starter  ?? 0 },
    { name: 'Pro',      value: planCounts.pro       ?? 0 },
    { name: 'Business', value: planCounts.business  ?? 0 },
  ].filter(d => d.value > 0);

  const total = data.reduce((a, d) => a + d.value, 0);

  return (
    <div className="card">
      <h2 className="font-semibold text-text-primary mb-4">Plan Distribution</h2>
      {total > 0 ? (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={COLORS[d.name.toLowerCase()] ?? '#3a3a50'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, fontSize: 12, color: '#f1f0ef',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {data.map((d) => (
              <div key={d.name} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: COLORS[d.name.toLowerCase()] ?? '#3a3a50' }}
                />
                <span className="text-sm text-text-secondary w-20">{d.name}</span>
                <span className="text-sm font-semibold text-text-primary">{d.value}</span>
                <span className="text-xs text-text-muted">
                  ({total ? ((d.value / total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-text-muted py-6 text-center">No client data yet.</p>
      )}
    </div>
  );
}
