'use client';

import { motion } from 'framer-motion';
import MouseSpotlightCard from '@/components/ui/MouseSpotlightCard';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function BillHistoryCard({ readings }: { readings: any[] }) {
  // Map readings to recharts expected format
  const chartData = [...readings].reverse().map(r => {
    const total = (r.billAmountElectric || 0) + (r.billAmountWater || 0);
    const date = new Date(r.readingDate);
    const month = date.toLocaleString('default', { month: 'short' });
    return { name: month, amount: total / 100 }; // Recharts prefers numbers
  });

  return (
    <motion.div variants={item} className="w-full h-full">
      <MouseSpotlightCard className="p-6 h-full min-h-[300px] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">6-Month Trend</p>
        </div>
        
        <div className="flex-1 w-full h-[200px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0F0F14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#06B6D4' }}
                  formatter={(value: number) => [`₱${value.toFixed(2)}`, 'Bill']}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#06B6D4" 
                  radius={[4, 4, 4, 4]} 
                  className="opacity-80 hover:opacity-100 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center border border-dashed border-white/10 rounded-xl">
              <p className="text-xs font-bold text-slate-500">Not enough data to generate chart.</p>
            </div>
          )}
        </div>
      </MouseSpotlightCard>
    </motion.div>
  );
}
