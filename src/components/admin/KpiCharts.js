'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const COLORS = { 
  starter:  '#334155', // Slate
  pro:      '#22d3ee', // Cyan
  business: '#f59e0b'  // Amber
};

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="drop-shadow-[0_0_12px_rgba(34,211,238,0.2)]"
      />
    </g>
  );
};

export default function AdminKpiCharts({ planCounts }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const data = [
    { name: 'Starter',  value: planCounts.starter  ?? 0 },
    { name: 'Pro',      value: planCounts.pro       ?? 0 },
    { name: 'Business', value: planCounts.business  ?? 0 },
  ].filter(d => d.value > 0);

  const total = data.reduce((a, d) => a + d.value, 0);

  if (total === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">No Subscriptions Yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="h-[200px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              animationBegin={0}
              animationDuration={1500}
            >
              {data.map((d) => (
                <Cell 
                  key={d.name} 
                  fill={COLORS[d.name.toLowerCase()] ?? '#334155'} 
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0];
                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-surface-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[140px]"
                  >
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5">{item.name} Tier</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-black text-white leading-none">{item.value}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Active Users</p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                      <p className="text-[9px] font-black text-brand-400 uppercase tracking-widest">
                        {((item.value / total) * 100).toFixed(1)}% Market Share
                      </p>
                    </div>
                  </motion.div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <p className="text-2xl font-black text-white leading-none tracking-tighter">{total}</p>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1.5">Total Core</p>
          </motion.div>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full shadow-lg transition-transform group-hover:scale-125"
                style={{ background: COLORS[d.name.toLowerCase()] ?? '#334155' }}
              />
              <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-widest">{d.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-white font-mono">{d.value}</span>
              <span className="text-[10px] font-black text-cyan-500/60 bg-cyan-500/5 px-2 py-0.5 rounded-md">
                {((d.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
