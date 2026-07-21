'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Save } from 'lucide-react';

interface FeeConfig {
  id: string;
  designFee: number;
  installationPct: number;
  permitFee: number;
  maintenanceAnnualFee: number;
  depositRequiredPct: number;
  updatedAt: string;
}

export function FeeConfigClient({ config }: { config: FeeConfig }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    designFee: config.designFee.toString(),
    installationPct: config.installationPct.toString(),
    permitFee: config.permitFee.toString(),
    maintenanceAnnualFee: config.maintenanceAnnualFee.toString(),
    depositRequiredPct: config.depositRequiredPct.toString(),
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/energy/fee-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designFee: parseFloat(form.designFee) || 0,
          installationPct: parseInt(form.installationPct) || 0,
          permitFee: parseFloat(form.permitFee) || 0,
          maintenanceAnnualFee: parseFloat(form.maintenanceAnnualFee) || 0,
          depositRequiredPct: parseFloat(form.depositRequiredPct) || 0,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      success('Fee configuration updated');
      router.refresh();
    } catch (err) {
      error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({
    label, value, onChange, suffix, type = 'number',
  }: {
    label: string; value: string; onChange: (v: string) => void; suffix?: string; type?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-foreground-50/70 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-background-800 border border-foreground-950/10 rounded-lg px-4 py-2.5 text-foreground-50 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground-50/40">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground-950">Fee Configuration</h1>
        <p className="text-sm text-foreground-950/50 mt-1">Set default fees used across all quotations and designs.</p>
      </div>

      <SpotlightCard className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Design Fee (₱)"
            value={form.designFee}
            onChange={(v) => setForm((p) => ({ ...p, designFee: v }))}
          />
          <Field
            label="Installation Fee (%)"
            value={form.installationPct}
            onChange={(v) => setForm((p) => ({ ...p, installationPct: v }))}
            suffix="× 100 (1500 = 15%)"
          />
          <Field
            label="Permit Fee (₱)"
            value={form.permitFee}
            onChange={(v) => setForm((p) => ({ ...p, permitFee: v }))}
          />
          <Field
            label="Annual Maintenance (₱)"
            value={form.maintenanceAnnualFee}
            onChange={(v) => setForm((p) => ({ ...p, maintenanceAnnualFee: v }))}
          />
          <Field
            label="Required Deposit (%)"
            value={form.depositRequiredPct}
            onChange={(v) => setForm((p) => ({ ...p, depositRequiredPct: v }))}
            suffix="%"
            type="string"
          />
        </div>

        <div className="pt-4 border-t border-foreground-950/5 flex items-center justify-between">
          <p className="text-xs text-foreground-50/30">
            Last updated: {new Date(config.updatedAt).toLocaleString()}
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-accent-blue text-foreground-950 font-medium rounded-lg hover:bg-accent-blue/90 disabled:opacity-50 transition-colors text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </SpotlightCard>

      <div className="bg-background-800 border border-foreground-950/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground-50/70 mb-2">How values are used</h3>
        <ul className="text-xs text-foreground-50/50 space-y-1.5">
          <li>• <strong className="text-foreground-50/70">Design Fee</strong> — Flat fee added to every quotation</li>
          <li>• <strong className="text-foreground-50/70">Installation Fee</strong> — Percentage of hardware subtotal (1500 = 15%)</li>
          <li>• <strong className="text-foreground-50/70">Permit Fee</strong> — Flat fee for utility/engineering permits</li>
          <li>• <strong className="text-foreground-50/70">Deposit Required</strong> — Percentage of grand total due upfront</li>
          <li>• Panel prices are read from <strong className="text-foreground-50/70">SolarPanel.unitPriceCentavos</strong> in the catalog</li>
        </ul>
      </div>
    </div>
  );
}
