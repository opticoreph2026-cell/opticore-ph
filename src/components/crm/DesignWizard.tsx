'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Zap,
  Sun,
  Package,
  Calculator,
  FileText,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import type { CriticalLoad } from '@/lib/solar-design';
import type { DesignComputeResult } from '@/lib/design-compute';

const STEPS = [
  { id: 1, label: 'Client', icon: User },
  { id: 2, label: 'Loads', icon: Zap },
  { id: 3, label: 'Sizing', icon: Sun },
  { id: 4, label: 'Products', icon: Package },
  { id: 5, label: 'ROI', icon: Calculator },
  { id: 6, label: 'Proposal', icon: FileText },
];

interface Lead {
  id: string;
  fullName: string;
  phone?: string | null;
  province?: string | null;
  monthlyBillPhp: number;
  customerType: string;
}

interface PanelOption {
  id: string;
  modelName: string;
  wattage: number;
  efficiencyPct: number;
  cellType: string;
}

interface WizardForm {
  leadId: string;
  averageMonthlyBill: number;
  averageMonthlyKwh: number;
  gridConnectionType: 'single_phase' | 'three_phase';
  designPathway: 'zero_export_hybrid' | 'grid_tied_net_metered' | 'off_grid';
  customerType: string;
  peakSunHours: number;
  targetOffsetPct: number;
  panelModelId: string;
  panelWattage: number;
  backupAutonomyHours: number;
  criticalLoads: CriticalLoad[];
  selfConsumptionPct: number;
  allInRatePhp: number;
}

function formatPhp(centavos: number) {
  return `₱${(centavos / 100).toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;
}

export function DesignWizard({ basePath = '/crm' }: { basePath?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [panels, setPanels] = useState<PanelOption[]>([]);

  const [form, setForm] = useState<WizardForm>({
    leadId: '',
    averageMonthlyBill: 10000,
    averageMonthlyKwh: 800,
    gridConnectionType: 'single_phase',
    designPathway: 'zero_export_hybrid',
    customerType: 'residential',
    peakSunHours: 4.5,
    targetOffsetPct: 80,
    panelModelId: '',
    panelWattage: 550,
    backupAutonomyHours: 4,
    criticalLoads: [],
    selfConsumptionPct: 70,
    allInRatePhp: 10.5,
  });

  const [computeResult, setComputeResult] = useState<DesignComputeResult | null>(null);
  const [designId, setDesignId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [roiScenarioId, setRoiScenarioId] = useState<string | null>(null);
  const [roiResults, setRoiResults] = useState<any>(null);
  const [quotation, setQuotation] = useState<any>(null);

  useEffect(() => {
    fetch('/api/energy/leads')
      .then((r) => r.json())
      .then((json) => setLeads(json.data ?? []))
      .catch(() => {});
    fetch('/api/energy/products/panels')
      .then((r) => r.json())
      .then((json) => setPanels(json.data ?? []))
      .catch(() => {});
  }, []);

  const onLeadChange = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      const bill = lead.monthlyBillPhp / 100 || 10000;
      const kwh = Math.round(bill / form.allInRatePhp);
      setForm((f) => ({
        ...f,
        leadId,
        averageMonthlyBill: bill,
        averageMonthlyKwh: kwh || 800,
        customerType: lead.customerType || 'residential',
      }));
    } else {
      setForm((f) => ({ ...f, leadId }));
    }
  };

  const runCompute = useCallback(
    async (save: boolean) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/energy/designs/compute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: form.leadId,
            save,
            averageMonthlyKwh: form.averageMonthlyKwh,
            averageMonthlyBillCentavos: Math.round(form.averageMonthlyBill * 100),
            gridConnectionType: form.gridConnectionType,
            designPathway: form.designPathway,
            customerType: form.customerType,
            peakSunHours: form.peakSunHours,
            targetOffsetPct: form.targetOffsetPct,
            panelWattage: form.panelWattage,
            backupAutonomyHours: form.backupAutonomyHours,
            criticalLoads: form.criticalLoads,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Compute failed');

        setComputeResult(json.data.compute);
        setCustomerId(json.data.customerId);
        if (json.data.design?.id) setDesignId(json.data.design.id);
        return json.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Compute failed');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [form],
  );

  const runRoi = async () => {
    if (!designId || !computeResult) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/energy/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designId,
          selfConsumptionPct: form.selfConsumptionPct,
          capexTotalCentavos: computeResult.grandTotalCentavos,
          allInRateRu: Math.round(form.allInRatePhp * 10000),
          bgcRateRu: Math.round(form.allInRatePhp * 0.65 * 10000),
          annualRateEscalationPct: 5,
          discountRatePct: 8,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'ROI failed');
      setRoiScenarioId(json.data.id);
      setRoiResults(json.data.parsedResults);
      setStep(6);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ROI failed');
    } finally {
      setLoading(false);
    }
  };

  const createQuotation = async () => {
    if (!designId || !customerId || !computeResult) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/energy/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          designId,
          roiScenarioId,
          hardwareSubtotalCentavos: computeResult.hardwareSubtotalCentavos,
          installationFeeCentavos: computeResult.installationFeeCentavos,
          designFeeCentavos: computeResult.designFeeCentavos,
          grandTotalCentavos: computeResult.grandTotalCentavos,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Quotation failed');
      setQuotation(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Quotation failed');
    } finally {
      setLoading(false);
    }
  };

  const addLoad = () => {
    setForm((f) => ({
      ...f,
      criticalLoads: [
        ...f.criticalLoads,
        { name: '', watts: 100, quantity: 1, hoursPerDay: 4, mustBackup: true },
      ],
    }));
  };

  const updateLoad = (index: number, patch: Partial<CriticalLoad>) => {
    setForm((f) => ({
      ...f,
      criticalLoads: f.criticalLoads.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    }));
  };

  const removeLoad = (index: number) => {
    setForm((f) => ({
      ...f,
      criticalLoads: f.criticalLoads.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-white mb-2">Engineering Calculator</h1>
        <p className="text-sm text-white/40">
          6-step Neovolt sizing, ROI analysis, and proposal generation.
        </p>
      </div>

      {/* Progress */}
      <div className="bg-[#0F0F14] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-white/5 z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#F5A524] z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isPast = step > s.id;
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-[#F5A524] text-[#08080B] scale-110'
                      : isPast
                        ? 'bg-[#10B981] text-[#08080B]'
                        : 'bg-[#16161D] border border-white/10 text-white/30'
                  }`}
                >
                  {isPast ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-[10px] font-medium uppercase tracking-wide hidden sm:block ${
                    isActive || isPast ? 'text-white' : 'text-white/30'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 text-sm text-accent-rose">
          {error}
        </div>
      )}

      <div className="bg-[#0F0F14] border border-white/5 rounded-2xl overflow-hidden">
        {/* Step 1 — Client */}
        {step === 1 && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-display font-bold text-white">Client & Site</h2>
              <p className="text-sm text-white/40">Select lead, utility profile, and system pathway.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1.5">Lead</label>
                <select
                  value={form.leadId}
                  onChange={(e) => onLeadChange(e.target.value)}
                  className="w-full bg-[#16161D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                >
                  <option value="">— Select lead —</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.fullName} {l.province ? `(${l.province})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1.5">Grid Type</label>
                <select
                  value={form.gridConnectionType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      gridConnectionType: e.target.value as WizardForm['gridConnectionType'],
                    }))
                  }
                  className="w-full bg-[#16161D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                >
                  <option value="single_phase">Single-Phase (230V)</option>
                  <option value="three_phase">Three-Phase (400V)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1.5">Pathway</label>
                <select
                  value={form.designPathway}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      designPathway: e.target.value as WizardForm['designPathway'],
                    }))
                  }
                  className="w-full bg-[#16161D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                >
                  <option value="zero_export_hybrid">Zero-Export Hybrid (default)</option>
                  <option value="grid_tied_net_metered">Grid-Tied Net Metering</option>
                  <option value="off_grid">Off-Grid</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1.5">Peak Sun Hours</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.peakSunHours}
                  onChange={(e) => setForm((f) => ({ ...f, peakSunHours: Number(e.target.value) }))}
                  className="w-full bg-[#16161D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1.5">Solar Panel</label>
                <select
                  value={form.panelModelId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    const panel = panels.find((p) => p.id === pid);
                    setForm((f) => ({
                      ...f,
                      panelModelId: pid,
                      panelWattage: panel?.wattage ?? f.panelWattage,
                    }));
                  }}
                  className="w-full bg-[#16161D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                >
                  <option value="">— Select panel —</option>
                  {panels.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.modelName} ({p.wattage}W · {p.efficiencyPct}% eff.)
                    </option>
                  ))}
                </select>
                {form.panelWattage > 0 && (
                  <p className="text-xs text-white/40 mt-1.5">{form.panelWattage}W selected</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1.5">Utility Rate (₱/kWh)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.allInRatePhp}
                  onChange={(e) => {
                    const rate = Number(e.target.value);
                    setForm((f) => ({
                      ...f,
                      allInRatePhp: rate,
                      averageMonthlyKwh: Math.round(f.averageMonthlyBill / rate) || f.averageMonthlyKwh,
                    }));
                  }}
                  className="w-full bg-[#16161D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                />
              </div>
            </div>
            <NavButtons
              onNext={() => form.leadId && setStep(2)}
              nextDisabled={!form.leadId}
              nextLabel="Next: Load Analysis"
            />
          </div>
        )}

        {/* Step 2 — Loads */}
        {step === 2 && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-display font-bold text-white">Load Analysis</h2>
              <p className="text-sm text-white/40">Bill data and critical backup loads (PEC 1.25 safety factor applied in engine).</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1.5">Monthly Bill (₱)</label>
                <input
                  type="number"
                  value={form.averageMonthlyBill}
                  onChange={(e) => {
                    const bill = Number(e.target.value);
                    setForm((f) => ({
                      ...f,
                      averageMonthlyBill: bill,
                      averageMonthlyKwh: Math.round(bill / f.allInRatePhp),
                    }));
                  }}
                  className="w-full bg-[#16161D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1.5">Monthly kWh</label>
                <input
                  type="number"
                  value={form.averageMonthlyKwh}
                  onChange={(e) => setForm((f) => ({ ...f, averageMonthlyKwh: Number(e.target.value) }))}
                  className="w-full bg-[#16161D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1.5">Target Offset %</label>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={form.targetOffsetPct}
                  onChange={(e) => setForm((f) => ({ ...f, targetOffsetPct: Number(e.target.value) }))}
                  className="w-full accent-[#F5A524]"
                />
                <p className="text-sm text-accent-amber mt-1">{form.targetOffsetPct}%</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1.5">Backup Hours</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={form.backupAutonomyHours}
                  onChange={(e) => setForm((f) => ({ ...f, backupAutonomyHours: Number(e.target.value) }))}
                  className="w-full bg-[#16161D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white/80">Critical Loads (optional)</h3>
                <button
                  type="button"
                  onClick={addLoad}
                  className="inline-flex items-center gap-1 text-xs text-accent-cyan hover:text-accent-cyan/80"
                >
                  <Plus className="w-3.5 h-3.5" /> Add appliance
                </button>
              </div>
              {form.criticalLoads.length === 0 ? (
                <p className="text-sm text-white/30 italic">
                  Leave empty — engine will estimate from bill data.
                </p>
              ) : (
                <div className="space-y-2">
                  {form.criticalLoads.map((load, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        placeholder="Name"
                        value={load.name}
                        onChange={(e) => updateLoad(i, { name: e.target.value })}
                        className="col-span-4 bg-[#16161D] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                      />
                      <input
                        type="number"
                        placeholder="W"
                        value={load.watts}
                        onChange={(e) => updateLoad(i, { watts: Number(e.target.value) })}
                        className="col-span-2 bg-[#16161D] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={load.quantity}
                        onChange={(e) => updateLoad(i, { quantity: Number(e.target.value) })}
                        className="col-span-1 bg-[#16161D] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                      />
                      <input
                        type="number"
                        placeholder="Hrs"
                        value={load.hoursPerDay}
                        onChange={(e) => updateLoad(i, { hoursPerDay: Number(e.target.value) })}
                        className="col-span-2 bg-[#16161D] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeLoad(i)}
                        className="col-span-1 p-2 text-accent-rose hover:bg-accent-rose/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <NavButtons
              onPrev={() => setStep(1)}
              onNext={async () => {
                const data = await runCompute(true);
                if (data) setStep(3);
              }}
              nextLabel={loading ? 'Computing...' : 'Run Sizing Engine'}
              nextDisabled={loading}
              loading={loading}
            />
          </div>
        )}

        {/* Step 3 — Sizing */}
        {step === 3 && computeResult && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-display font-bold text-white">System Sizing</h2>
              <p className="text-sm text-white/40">Auto-computed from load profile and Neovolt catalog.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SizingCard
                label="PV Array"
                value={`${computeResult.pv.pvArrayKwp.toFixed(1)} kWp`}
                sub={`${computeResult.pv.panelCount} × ${form.panelWattage}W panels`}
                color="text-accent-amber"
              />
              <SizingCard
                label="Inverter"
                value={computeResult.selection.inverter.modelName}
                sub={`${computeResult.selection.inverterQuantity}× · ${computeResult.selection.inverter.ratedAcKw} kW`}
                color="text-accent-cyan"
              />
              <SizingCard
                label="Battery"
                value={`${computeResult.selection.totalUsableStorageKwh.toFixed(1)} kWh`}
                sub={`${computeResult.selection.batteryQuantity}× ${computeResult.selection.battery.modelName}`}
                color="text-accent-emerald"
              />
            </div>
            {computeResult.selection.warningFlags.length > 0 && (
              <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/10 p-4 text-sm text-accent-amber">
                {computeResult.selection.warningFlags.map((w, i) => (
                  <p key={i}>{w}</p>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-[#16161D] rounded-xl p-4">
                <p className="text-white/40 mb-1">Annual PV Yield</p>
                <p className="text-white font-bold">{Math.round(computeResult.annualYieldKwh).toLocaleString()} kWh/yr</p>
              </div>
              <div className="bg-[#16161D] rounded-xl p-4">
                <p className="text-white/40 mb-1">Peak Load (backup)</p>
                <p className="text-white font-bold">{computeResult.backup.totalCriticalLoadKw.toFixed(2)} kW</p>
              </div>
            </div>
            <NavButtons onPrev={() => setStep(2)} onNext={() => setStep(4)} nextLabel="Next: Products & Pricing" />
          </div>
        )}

        {/* Step 4 — Products / BOM */}
        {step === 4 && computeResult && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-display font-bold text-white">Products & Pricing</h2>
              <p className="text-sm text-white/40">
                Estimated pricing — edit in Settings when distributor prices are confirmed.
              </p>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-white/30 border-b border-white/5">
                <tr>
                  <th className="py-3">Item</th>
                  <th className="py-3 text-right">Qty</th>
                  <th className="py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/70">
                {computeResult.bom.map((item, i) => (
                  <tr key={i}>
                    <td className="py-3">{item.description}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">{formatPhp(item.totalCentavos)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-3">Installation & commissioning (est.)</td>
                  <td className="py-3 text-right">1</td>
                  <td className="py-3 text-right">{formatPhp(computeResult.installationFeeCentavos)}</td>
                </tr>
                <tr>
                  <td className="py-3">Design & engineering fee</td>
                  <td className="py-3 text-right">1</td>
                  <td className="py-3 text-right">{formatPhp(computeResult.designFeeCentavos)}</td>
                </tr>
                <tr>
                  <td className="py-3">Permits & DU filing</td>
                  <td className="py-3 text-right">1</td>
                  <td className="py-3 text-right">{formatPhp(computeResult.permitFeeCentavos)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10">
                  <td colSpan={2} className="py-4 text-right font-semibold text-white">
                    Grand Total (excl. VAT):
                  </td>
                  <td className="py-4 text-right text-xl font-bold text-accent-cyan">
                    {formatPhp(computeResult.grandTotalCentavos)}
                  </td>
                </tr>
              </tfoot>
            </table>
            <NavButtons onPrev={() => setStep(3)} onNext={() => setStep(5)} nextLabel="Next: ROI Analysis" />
          </div>
        )}

        {/* Step 5 — ROI */}
        {step === 5 && computeResult && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-display font-bold text-white">ROI Analysis</h2>
              <p className="text-sm text-white/40">Adjust self-consumption rate for battery-backed systems.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase mb-1.5">
                Self-Consumption: {form.selfConsumptionPct}%
              </label>
              <input
                type="range"
                min={30}
                max={95}
                value={form.selfConsumptionPct}
                onChange={(e) => setForm((f) => ({ ...f, selfConsumptionPct: Number(e.target.value) }))}
                className="w-full accent-[#10B981]"
              />
              <p className="text-xs text-white/40 mt-2">
                Zero-export default: 70%. With battery time-shifting, residential typically 65–85%.
              </p>
            </div>
            <div className="bg-[#16161D] rounded-xl p-5 border border-[#F5A524]/20">
              <p className="text-sm text-white/60 mb-1">System Investment</p>
              <p className="text-2xl font-bold text-white">{formatPhp(computeResult.grandTotalCentavos)}</p>
              <p className="text-xs text-white/40 mt-2">
                25-year projection with {form.allInRatePhp} ₱/kWh + 5% annual rate escalation
              </p>
            </div>
            <NavButtons
              onPrev={() => setStep(4)}
              onNext={runRoi}
              nextLabel={loading ? 'Calculating ROI...' : 'Generate ROI & Proposal'}
              nextDisabled={loading || !designId}
              loading={loading}
            />
          </div>
        )}

        {/* Step 6 — Proposal */}
        {step === 6 && (
          <div className="p-8 space-y-6">
            {roiResults && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="Payback" value={`${roiResults.simplePaybackYears?.toFixed?.(1) ?? roiResults.headline?.simplePaybackYears?.toFixed?.(1) ?? '—'} yrs`} />
                <MetricCard
                  label="Year 1 Savings"
                  value={formatPhp(roiResults.year1SavingsCentavos ?? roiResults.headline?.yearOneSavingsCentavos ?? 0)}
                />
                <MetricCard
                  label="NPV (25yr)"
                  value={formatPhp(roiResults.npvCentavos ?? roiResults.headline?.npvCentavos ?? 0)}
                />
                <MetricCard
                  label="Total Investment"
                  value={formatPhp(computeResult?.grandTotalCentavos ?? 0)}
                />
              </div>
            )}

            {!quotation ? (
              <div className="text-center py-8">
                <button
                  type="button"
                  onClick={createQuotation}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#F5A524] text-[#08080B] font-semibold rounded-xl hover:bg-[#F5A524]/90 disabled:opacity-50"
                >
                  {loading ? <Spinner className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  Create Quotation
                </button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-accent-emerald mx-auto" />
                <h2 className="text-2xl font-display font-bold text-white">Proposal Ready</h2>
                <p className="text-white/40">
                  Quote <span className="text-accent-amber font-mono">{quotation.quoteNumber}</span> saved as draft.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => router.push(`${basePath}/roi/${designId}`)}
                    className="px-6 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10"
                  >
                    View ROI Chart
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`${basePath}/designs`)}
                    className="px-6 py-3 bg-accent-emerald text-[#08080B] font-semibold rounded-xl hover:bg-accent-emerald/90"
                  >
                    Back to Designs
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SizingCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="bg-[#16161D] border border-white/5 p-5 rounded-2xl">
      <p className="text-xs text-white/40 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-lg font-bold text-white mb-1 ${color}`}>{value}</p>
      <p className="text-xs text-white/50">{sub}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#16161D] rounded-xl p-4 text-center border border-white/5">
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function NavButtons({
  onPrev,
  onNext,
  nextLabel = 'Next',
  nextDisabled = false,
  loading = false,
}: {
  onPrev?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="flex justify-between pt-6 border-t border-white/5">
      {onPrev ? (
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 text-white/70 font-semibold rounded-xl hover:bg-white/10"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      ) : (
        <div />
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5A524] text-[#08080B] font-semibold rounded-xl hover:bg-[#F5A524]/90 disabled:opacity-50"
        >
          {loading ? <Spinner className="w-4 h-4" /> : null}
          {nextLabel} <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
