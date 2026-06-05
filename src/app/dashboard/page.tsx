'use client';

import React, { useEffect, useState } from 'react';
import { Overview } from '@/components/dashboard/Overview';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

export default function DashboardPage() {
  const [data, setData] = useState({
    currentMonthTotal: 0,
    totalBillsCount: 0,
    totalFuelLogsCount: 0,
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard/data');
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setData(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-white/60 text-sm mt-1">Track your electricity, water, and fuel expenses in one place.</p>
      </div>

      <Overview data={data} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpotlightCard className="p-6">
          <h2 className="text-lg font-medium text-white mb-4">Recent AI Insights</h2>
          <div className="space-y-4">
            <div className="p-4 bg-accent-emerald/10 border border-accent-emerald/20 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-sm font-semibold text-accent-emerald">Meralco Rate Decrease</h3>
              </div>
              <p className="text-sm text-white/80">ERC announced a ₱0.12/kWh decrease for the upcoming billing cycle. Expect lower bills next month.</p>
            </div>
            
            <div className="p-4 bg-surface-800 border border-border-subtle rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-sm font-semibold text-white">Ghost Load Detected</h3>
              </div>
              <p className="text-sm text-white/60">Your baseline power consumption is unusually high between 2 AM and 5 AM. Consider checking for standby appliances.</p>
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-6">
          <h2 className="text-lg font-medium text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <a href="/dashboard/bills" className="p-4 bg-surface-800 border border-border-subtle hover:border-accent-cyan hover:bg-surface-800/80 rounded-xl transition-all group">
              <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 text-accent-cyan flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white">Scan New Bill</p>
            </a>
            
            <a href="/dashboard/fuel" className="p-4 bg-surface-800 border border-border-subtle hover:border-accent-emerald hover:bg-surface-800/80 rounded-xl transition-all group">
              <div className="w-10 h-10 rounded-lg bg-accent-emerald/10 text-accent-emerald flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white">Log Fuel Usage</p>
            </a>
            
            <a href="/dashboard/appliances" className="p-4 bg-surface-800 border border-border-subtle hover:border-white hover:bg-surface-800/80 rounded-xl transition-all group">
              <div className="w-10 h-10 rounded-lg bg-white/5 text-white/80 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white">Manage Appliances</p>
            </a>

            <a href="/dashboard/settings" className="p-4 bg-surface-800 border border-border-subtle hover:border-white hover:bg-surface-800/80 rounded-xl transition-all group">
              <div className="w-10 h-10 rounded-lg bg-white/5 text-white/80 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white">Add Property</p>
            </a>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
