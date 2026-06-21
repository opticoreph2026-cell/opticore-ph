'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  Battery, 
  Sun, 
  Calculator, 
  FileText, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

const steps = [
  { id: 1, label: 'Load Profile', icon: Zap },
  { id: 2, label: 'Component Sizing', icon: Sun },
  { id: 3, label: 'ROI Engine', icon: Calculator },
  { id: 4, label: 'System Pricing', icon: DollarSign },
  { id: 5, label: 'Generate Quote', icon: FileText },
];

export default function NewDesignWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    leadId: '',
    monthlyBill: 10000,
    roofType: 'G.I. Sheet',
    averageMonthlyConsumption: 800, // kWh
  });

  const [designResult, setDesignResult] = useState<any>(null);

  const handleNext = () => setStep((s) => Math.min(s + 1, 5));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/energy/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: formData.leadId,
          averageMonthlyConsumption: formData.averageMonthlyConsumption,
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setDesignResult(data.data);
        handleNext();
      } else {
        alert(data.error || 'Failed to calculate design');
      }
    } catch (err) {
      console.error(err);
      alert('Error calculating design');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white mb-2">New System Design</h1>
        <p className="text-sm text-white/40">Configure engineering components and calculate financial returns.</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#0F0F14] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-white/5 z-0" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#F5A524] z-0 transition-all duration-500 ease-in-out" 
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }} 
          />
          
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isPast = step > s.id;
            
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#F5A524] text-[#08080B] shadow-lg shadow-[#F5A524]/20 scale-110'
                      : isPast
                      ? 'bg-[#10B981] text-[#08080B]'
                      : 'bg-[#16161D] border border-white/10 text-white/30'
                  }`}
                >
                  {isPast ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-[11px] font-medium tracking-wide uppercase ${isActive || isPast ? 'text-white' : 'text-white/30'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-[#0F0F14] border border-white/5 rounded-2xl overflow-hidden">
        {step === 1 && (
          <div className="p-8 space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-display font-bold text-white mb-1">Load Profile Assessment</h2>
              <p className="text-sm text-white/40">Enter the customer's historical consumption data.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide">Assign to Lead / Customer</label>
                <select 
                  value={formData.leadId}
                  onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                  className="w-full bg-[#16161D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F5A524]/50 focus:ring-1 focus:ring-[#F5A524]/50 transition-all"
                >
                  <option value="">-- Select --</option>
                  <option value="test-lead-id">Sample Lead (John Doe)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide">Avg Monthly Bill (₱)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-medium">₱</span>
                  <input 
                    type="number" 
                    value={formData.monthlyBill}
                    onChange={(e) => setFormData({ ...formData, monthlyBill: Number(e.target.value) })}
                    className="w-full bg-[#16161D] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#F5A524]/50 focus:ring-1 focus:ring-[#F5A524]/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide">Avg Consumption (kWh)</label>
                <input 
                  type="number" 
                  value={formData.averageMonthlyConsumption}
                  onChange={(e) => setFormData({ ...formData, averageMonthlyConsumption: Number(e.target.value) })}
                  className="w-full bg-[#16161D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F5A524]/50 focus:ring-1 focus:ring-[#F5A524]/50 transition-all"
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide">Roof Type</label>
                <select 
                  value={formData.roofType}
                  onChange={(e) => setFormData({ ...formData, roofType: e.target.value })}
                  className="w-full bg-[#16161D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F5A524]/50 focus:ring-1 focus:ring-[#F5A524]/50 transition-all"
                >
                  <option>G.I. Sheet (Corrugated)</option>
                  <option>Concrete Deck (Flat)</option>
                  <option>Clay/Tegula Tiles</option>
                  <option>Asphalt Shingles</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end pt-6 border-t border-white/5">
              <button 
                onClick={handleCalculate}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5A524] text-[#08080B] font-semibold rounded-xl hover:bg-[#F5A524]/90 transition-all shadow-lg shadow-[#F5A524]/20 disabled:opacity-50"
              >
                {loading ? 'Calculating Engine...' : 'Run Sizing Engine'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-8 space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-display font-bold text-white mb-1">Component Selection</h2>
              <p className="text-sm text-white/40">Review the auto-sized components based on the load profile.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#16161D] border border-white/5 p-5 rounded-2xl">
                <Sun className="w-6 h-6 text-[#F5A524] mb-3" />
                <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1">PV Array</p>
                <p className="text-lg font-bold text-white">{designResult?.numberOfPanels || '10'} Panels</p>
                <p className="text-sm text-white/60 mt-1">5.5 kWp Total (550W Jinko)</p>
              </div>
              <div className="bg-[#16161D] border border-white/5 p-5 rounded-2xl">
                <Zap className="w-6 h-6 text-[#06B6D4] mb-3" />
                <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1">Inverter</p>
                <p className="text-lg font-bold text-white">{designResult?.inverterModel || 'Neovolt 5kW'}</p>
                <p className="text-sm text-white/60 mt-1">Single-Phase Hybrid</p>
              </div>
              <div className="bg-[#16161D] border border-white/5 p-5 rounded-2xl">
                <Battery className="w-6 h-6 text-[#10B981] mb-3" />
                <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1">ESS Storage</p>
                <p className="text-lg font-bold text-white">{designResult?.batteryCapacityKwh || '5'} kWh</p>
                <p className="text-sm text-white/60 mt-1">LFP Wall-mount</p>
              </div>
            </div>
            
            <div className="flex justify-between pt-6 border-t border-white/5">
              <button 
                onClick={handlePrev} 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 text-white/70 font-semibold rounded-xl hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={handleNext} 
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5A524] text-[#08080B] font-semibold rounded-xl hover:bg-[#F5A524]/90 transition-all shadow-lg shadow-[#F5A524]/20"
              >
                Proceed to ROI <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-8 space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-display font-bold text-white mb-1">ROI & Financial Engine</h2>
              <p className="text-sm text-white/40">Configure rates, inflation, and analyze the investment return.</p>
            </div>
            
            <div className="bg-[#16161D] border border-[#F5A524]/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5A524]/10 rounded-bl-full blur-3xl" />
              <div className="relative z-10 flex items-start gap-4">
                <div className="p-3 bg-[#F5A524]/20 rounded-xl text-[#F5A524]">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Estimated Payback Period: 3.2 Years</h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-4">
                    Based on standard Meralco rates (₱12.50/kWh) and an assumed 5% annual utility inflation. 
                    The customer is projected to save ₱144,000 annually.
                  </p>
                  <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10">
                    Adjust Assumptions
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-6 border-t border-white/5">
              <button 
                onClick={handlePrev} 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 text-white/70 font-semibold rounded-xl hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={handleNext} 
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5A524] text-[#08080B] font-semibold rounded-xl hover:bg-[#F5A524]/90 transition-all shadow-lg shadow-[#F5A524]/20"
              >
                Proceed to Pricing <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-8 space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-display font-bold text-white mb-1">System Pricing & Bill of Quantities</h2>
              <p className="text-sm text-white/40">Adjust final margins and view the commercial offer.</p>
            </div>

            <div className="bg-[#16161D] border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm text-white/70">
                <thead className="bg-white/5 border-b border-white/5">
                  <tr>
                    <th className="px-5 py-3 font-medium">Item</th>
                    <th className="px-5 py-3 font-medium text-right">Qty</th>
                    <th className="px-5 py-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="px-5 py-4">Jinko 550W N-Type PV Panel</td>
                    <td className="px-5 py-4 text-right">10</td>
                    <td className="px-5 py-4 text-right">₱ 75,000</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4">Neovolt 5kW Hybrid Inverter</td>
                    <td className="px-5 py-4 text-right">1</td>
                    <td className="px-5 py-4 text-right">₱ 45,000</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4">Neovolt 5kWh LFP Battery</td>
                    <td className="px-5 py-4 text-right">1</td>
                    <td className="px-5 py-4 text-right">₱ 65,000</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4">BOS, Installation & Permits</td>
                    <td className="px-5 py-4 text-right">1 Lot</td>
                    <td className="px-5 py-4 text-right">₱ 50,000</td>
                  </tr>
                </tbody>
                <tfoot className="bg-white/3 font-semibold text-white border-t border-white/10">
                  <tr>
                    <td colSpan={2} className="px-5 py-4 text-right">Total Turnkey Price:</td>
                    <td className="px-5 py-4 text-right text-[#06B6D4] text-lg">₱ 235,000</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="flex justify-between pt-6 border-t border-white/5">
              <button 
                onClick={handlePrev} 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 text-white/70 font-semibold rounded-xl hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={handleNext} 
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5A524] text-[#08080B] font-semibold rounded-xl hover:bg-[#F5A524]/90 transition-all shadow-lg shadow-[#F5A524]/20"
              >
                Generate Document <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="p-12 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-[#10B981]/20 border border-[#10B981]/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#10B981]/10">
              <CheckCircle2 className="w-10 h-10 text-[#10B981]" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white mb-3">Design & Quotation Ready</h2>
            <p className="text-white/40 mb-10 max-w-sm mx-auto leading-relaxed">
              The engineering design, ROI model, and final commercial proposal have been generated and saved to the lead's profile.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={handlePrev} 
                className="px-6 py-3.5 bg-white/5 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
              >
                Back to Edit
              </button>
              <button 
                onClick={() => router.push('/crm/designs')} 
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#10B981] text-[#08080B] font-bold rounded-xl hover:bg-[#10B981]/90 transition-all shadow-lg shadow-[#10B981]/20"
              >
                <FileText className="w-5 h-5" />
                View Final PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
