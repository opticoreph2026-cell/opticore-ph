'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function ROIConsultationPage() {
  const { designId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/energy/roi?designId=${designId}`);
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setData(json.data[0]); // Get the most recent ROI model
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (designId) fetchData();
  }, [designId]);

  if (loading) {
    return <div className="p-8 text-gray-400">Loading ROI Data...</div>;
  }

  if (!data) {
    return <div className="p-8 text-gray-400">No ROI model found for this design.</div>;
  }

  // Parse the projection array
  const projections = data.yearlyProjections ? JSON.parse(data.yearlyProjections as string) : [];

  // Format data for Recharts
  const chartData = projections.map((p: any) => ({
    year: `Year ${p.year}`,
    savings: p.cumulativeSavingsCentavos / 100,
    cost: data.systemCostCentavos / 100,
  }));

  const totalCost = data.systemCostCentavos / 100;
  const year1Savings = data.year1SavingsCentavos / 100;
  const lifetimeSavings = data.lifetimeSavingsCentavos / 100;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Financial Analysis & ROI</h1>
        <p className="text-xl text-gray-400">Live Consultation View</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-[#16161D] p-6 rounded-2xl border border-white/5 text-center">
          <div className="text-sm font-medium text-gray-400 mb-2">Total Investment</div>
          <div className="text-3xl font-bold text-white">₱{totalCost.toLocaleString()}</div>
        </div>
        <div className="bg-[#16161D] p-6 rounded-2xl border border-white/5 text-center">
          <div className="text-sm font-medium text-gray-400 mb-2">Year 1 Savings</div>
          <div className="text-3xl font-bold text-[#10B981]">₱{year1Savings.toLocaleString()}</div>
        </div>
        <div className="bg-[#16161D] p-6 rounded-2xl border border-white/5 text-center">
          <div className="text-sm font-medium text-gray-400 mb-2">Payback Period</div>
          <div className="text-3xl font-bold text-white">{data.paybackPeriodYears} Years</div>
        </div>
        <div className="bg-[#16161D] p-6 rounded-2xl border border-[#F5A524]/20 text-center">
          <div className="text-sm font-medium text-[#F5A524] mb-2">25-Year Net ROI</div>
          <div className="text-3xl font-bold text-[#F5A524]">
            ₱{(lifetimeSavings - totalCost).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-[#16161D] p-8 rounded-2xl border border-white/5">
        <h2 className="text-2xl font-bold text-white mb-8">Cumulative Cash Flow</h2>
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="year" stroke="#888" tick={{ fill: '#888' }} />
              <YAxis 
                stroke="#888" 
                tick={{ fill: '#888' }} 
                tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F0F14', borderColor: '#333', color: '#fff' }}
                formatter={(value: number) => [`₱${value.toLocaleString()}`, '']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="savings" 
                name="Cumulative Savings" 
                stroke="#10B981" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#10B981' }} 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="cost" 
                name="System Cost" 
                stroke="#F43F5E" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
