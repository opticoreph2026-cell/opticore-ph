'use client';

import React from 'react';
import { SpotlightCard } from '../ui/SpotlightCard';

interface OverviewProps {
  data: {
    currentMonthTotal: number;
    totalBillsCount: number;
    totalFuelLogsCount: number;
    chartData: any[];
  };
  loading?: boolean;
}

export function Overview({ data, loading = false }: OverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-surface-900 animate-pulse rounded-2xl"></div>
        <div className="h-32 bg-surface-900 animate-pulse rounded-2xl"></div>
        <div className="h-32 bg-surface-900 animate-pulse rounded-2xl"></div>
        <div className="h-64 bg-surface-900 animate-pulse rounded-2xl md:col-span-3"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* KPI Cards */}
      <SpotlightCard className="p-6">
        <h3 className="text-sm font-medium text-white/60 mb-2">Total Monthly Spend</h3>
        <p className="text-3xl font-display font-bold text-white">
          ₱ {(data.currentMonthTotal / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-white/40 mt-2">Combined utilities & fuel</p>
      </SpotlightCard>

      <SpotlightCard className="p-6">
        <h3 className="text-sm font-medium text-white/60 mb-2">Active Bills Tracked</h3>
        <p className="text-3xl font-display font-bold text-white">{data.totalBillsCount}</p>
        <p className="text-xs text-white/40 mt-2">In the last 6 months</p>
      </SpotlightCard>

      <SpotlightCard className="p-6">
        <h3 className="text-sm font-medium text-white/60 mb-2">Fuel Logs</h3>
        <p className="text-3xl font-display font-bold text-white">{data.totalFuelLogsCount}</p>
        <p className="text-xs text-white/40 mt-2">In the last 6 months</p>
      </SpotlightCard>

      {/* Main Chart Area placeholder - real chart library like Recharts would go here */}
      <SpotlightCard className="p-6 md:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Spending History</h3>
          <select className="bg-surface-800 border border-border-subtle text-white text-sm rounded-lg focus:ring-accent-cyan focus:border-accent-cyan block p-2 outline-none">
            <option>Last 6 months</option>
            <option>This year</option>
          </select>
        </div>
        
        <div className="h-64 flex items-end justify-between gap-2 pb-4">
          {data.chartData?.map((item, i) => {
            const maxVal = Math.max(...data.chartData.map(d => d.total));
            const height = maxVal > 0 ? (item.total / maxVal) * 100 : 0;
            
            return (
              <div key={i} className="flex flex-col items-center flex-1 group">
                <div className="w-full relative flex flex-col justify-end h-48 bg-surface-800/30 rounded-t-sm group-hover:bg-surface-800/50 transition-colors">
                  <div 
                    className="w-full bg-gradient-to-t from-accent-cyan to-accent-emerald rounded-t-sm transition-all duration-500" 
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 transform -translate-x-1/2 bg-surface-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap transition-opacity shadow-lg border border-border-subtle z-10">
                    ₱ {(item.total / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <span className="text-xs text-white/40 mt-3 font-mono">{item.month.split('-')[1]}</span>
              </div>
            );
          })}
          {data.chartData?.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
              No data available yet
            </div>
          )}
        </div>
      </SpotlightCard>
    </div>
  );
}
