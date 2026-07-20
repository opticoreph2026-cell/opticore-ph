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
  ResponsiveContainer,
} from 'recharts';

function formatPhp(pesos: number) {
  return `₱${pesos.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
}

export default function ROIConsultationPage() {
  const { designId } = useParams();
  const [scenario, setScenario] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/energy/roi?designId=${designId}`);
        const json = await res.json();
        if (json.data?.length > 0) {
          const s = json.data[0];
          setScenario({
            ...s,
            parsed: s.parsedResults ?? (s.resultsJson ? JSON.parse(s.resultsJson) : null),
          });
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
    return <div className="p-8 text-foreground-400">Loading ROI data...</div>;
  }

  if (!scenario?.parsed) {
    return (
      <div className="p-8 text-foreground-400">
        No ROI model found. Complete the engineering calculator wizard first.
      </div>
    );
  }

  const { parsed, capexTotal } = scenario;
  const headline = parsed.headline ?? parsed;
  const cashFlow: any[] = parsed.cashFlowByYear ?? [];

  const chartData = cashFlow
    .filter((c) => c.year > 0)
    .map((c) => ({
      year: `Y${c.year}`,
      cumulative: c.cumulativeCashFlow,
      cost: capexTotal,
    }));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground-950 mb-1">Financial Analysis & ROI</h1>
        <p className="text-foreground-950/40">
          {scenario.design?.site?.customer?.fullName ?? 'Customer'} · {scenario.scenarioLabel}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Investment" value={formatPhp(capexTotal)} />
        <MetricCard
          label="Year 1 Savings"
          value={formatPhp(headline.yearOneSavingsCentavos ?? parsed.year1SavingsCentavos ?? 0)}
          accent
        />
        <MetricCard
          label="Simple Payback"
          value={`${(headline.simplePaybackYears ?? parsed.simplePaybackYears ?? 0).toFixed(1)} yrs`}
        />
        <MetricCard
          label="NPV (25yr)"
          value={formatPhp(headline.npvCentavos ?? parsed.npvCentavos ?? 0)}
          highlight
        />
      </div>

      {chartData.length > 0 && (
        <div className="bg-background-900 p-6 rounded-2xl border border-foreground-950/5">
          <h2 className="text-lg font-bold text-foreground-950 mb-6">25-Year Cumulative Cash Flow</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="year" stroke="#888" tick={{ fill: '#888', fontSize: 11 }} />
                <YAxis
                  stroke="#888"
                  tick={{ fill: '#888', fontSize: 11 }}
                  tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--surface-900)', borderColor: '#333', color: '#fff' }}
                  formatter={(value: number) => [formatPhp(value * 100), '']}
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  name="Cumulative Savings"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  name="System Cost"
                  stroke="#F43F5E"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  accent,
  highlight,
}: {
  label: string;
  value: string;
  accent?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 border text-center ${
        highlight
          ? 'bg-accent-cyan/10 border-accent-cyan/20'
          : 'bg-background-800 border-foreground-950/5'
      }`}
    >
      <p className="text-xs text-foreground-950/40 mb-2">{label}</p>
      <p
        className={`text-2xl font-bold ${
          accent ? 'text-accent-emerald' : highlight ? 'text-accent-cyan' : 'text-foreground-950'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
